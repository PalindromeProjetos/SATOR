<?php

namespace iAdmin\Cache;

use Smart\Setup\Start;
use Smart\Utils\Session;
use Smart\Mail\PasswordForgot;
use Smart\Mail\PasswordInvite;
use Smart\Common\Traits as Traits;
use iAdmin\Model\users as Model;

class users extends \Smart\Data\Cache {
    use Traits\TuserHandler;

    public function selectLogout(array $data) {
        $this->stash->destroy();

        return self::getResultToJson();
    }

    public function selectLocked(array $data) {
        $this->stash->slay();
		
        return self::getResultToJson();
    }

    public function selectOpened(array $data) {
        $isTest = Start::areTestBase();
		$opened = $this->stash->have();

        self::_setSuccess($opened);
        self::_setText($opened ? 'Esta sessão está aberta' : 'Esta sessão está fechada');

        if($opened) {
            $data = array();
            $data['moduleid'] = $this->stash->moduleid;
            $data['username'] = $this->stash->username;
            $result = self::jsonToObject($this->selectUserComein($data));
            self::_setRows($result->rows);
        }

        self::_set('isTest',$isTest);

        return self::arrayToJson(self::encodeUTF8(self::getResult()));
    }

    public function selectAccess(array $data) {
        $attempts = $this->stash->attempts;
        $backupid = $this->stash->backupid;
        $password = $this->stash->password;

        $access = self::tryHash($data["password"],$password);

        if ($access) {
            $this->stash->attempts = 0;
            $this->stash->usercode = $backupid;
            self::_setText('Sua tentativa foi bem sucedida!');
        } else {
            $attempts++;
            $this->stash->attempts = $attempts;
            self::_setSuccess(true);
            self::_setText('Sua tentativa fracassou!');
            self::_setErrors(array('attempts'=>$attempts));
        }

        return self::getResultToJson();
    }

    public function selectCookie(array $data) {
        $cookie = array();

        $cookie['usercode'] = $this->stash->usercode;
        $cookie['username'] = $this->stash->username;
        $cookie['password'] = $this->stash->password;
        $cookie['fullname'] = $this->stash->fullname;

        self::_setRows($cookie);

        return self::getResultToJson();
    }

    public function selectComein(array $data) {
        $moduleid = $data["module"];
        $passwordData = $data["password"];
        $passwordUser = "NOT VALID ACCESS!";

        try {

            $data['moduleid'] = $moduleid;
            $result = self::jsonToObject($this->selectUserComein($data));
            $modulebuild = $result->modulebuild;

            if($result->records != 0) {
                $passwordUser = $result->rows[0]->password;
            } else {
                $result->text = "O usuário não foi encontrado na base de dados!";
            }

            $result->success = self::tryHash($passwordData,$passwordUser);

            if ($result->success) {
                $this->stash->attempts = 0;
                $this->stash->moduleid = $moduleid;
                $this->stash->backupid = $result->rows[0]->id;
                $this->stash->usercode = $result->rows[0]->id;
                $this->stash->username = $result->rows[0]->username;
                $this->stash->password = $result->rows[0]->password;
                $this->stash->fullname = $result->rows[0]->fullname;
            } else {
                $result->text = sprintf("%s. Usuário não autenticado!",$passwordUser);
            }

            self::_setRows($result->rows);
            self::_setText($result->text);
            self::_setSuccess($result->success);
            self::_set('modulebuild',$modulebuild);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectUserComein(array $data) {
        $username = $data['username'];
        $moduleid = $data['moduleid'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            select
                u.id,
                u.username,
                u.fullname,
                u.password,
                dbo.binary2base64(u.filedata) as filedata,
                u.fileinfo,
                u.isactive,
				m.legalname,
                dbo.binary2base64(m.filedata) as logodata,
                m.fileinfo as logoinfo,
                m.modulebuild
            from
                users u,
				module m
            where u.username = :username
			  and m.name = :moduleid";

        try {

            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":moduleid", $moduleid, \PDO::PARAM_STR);
            $pdo->bindValue(":username", $username, \PDO::PARAM_STR);

            $pdo->execute();
            $rows = $pdo->fetchAll();

            $modulebuild = count($rows) != 0 ? $rows[0]['modulebuild'] : '0.0.0.0';

            self::_setRows($rows);
            self::_set('modulebuild',$modulebuild);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectUserForgot(array $data) {
        $proxy = $this->getStore()->getProxy();
        $username = $data['username'];
        $birthdate = $data['birthdate'];

        $sql = "
                select
                    id,
                    username,
                    fullname,
                    mainmail,
                    replace(convert(varchar(10),birthdate,102),'.','-') as birthdate
                from
                    users
                where username = :username
                  and birthdate = :birthdate";

        try {

            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":username", $username, \PDO::PARAM_STR);
            $pdo->bindValue(":birthdate", $birthdate, \PDO::PARAM_STR);

            $pdo->execute();
            $rows = $pdo->fetchAll();
            $data = $rows[0];

            self::_setRows($rows);
            self::_setText("E-mail enviado com sucesso para: {$data['mainmail']}");

            if(count($rows) === 0) {
                throw new \PDOException("Este Usuário não está cadastrado na nossa base de dados!");
            }

            $id = $data['id'];
            $fullname = $data['fullname'];

            $data['password'] = $password = substr(self::getHash($fullname),8,6);

            $updPwd = "update users set password = '{$password}' where id = {$id}";

            $proxy->exec($updPwd);

            $body = file_get_contents("../../../smart/Mail/tpl/PasswordForgot.html");

            $mail = new PasswordForgot();
            $mail->configEmail($data, $body);
            $mail->Send();

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectUserInvite(array $data) {
        $proxy = $this->getStore()->getProxy();
        $username = $data['username'];
        $password = $data['password'];
        $invitate = $data['invitate'];

        $sql = "
                select
                    id,
                    username,
                    fullname,
                    mainmail,
                    convert(varchar(10),birthdate,101) as birthdate
                from users
                where username = :username
                  and password = :invitate";

        try {

            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":username", $username, \PDO::PARAM_STR);
            $pdo->bindValue(":invitate", $invitate, \PDO::PARAM_STR);

            $pdo->execute();
            $rows = $pdo->fetchAll();
            $data = $rows[0];

            self::_setRows($rows);
            self::_setText("E-mail enviado para {$data['mainmail']} contendo as informações de acesso!");

            if(count($rows) === 0) {
                throw new \PDOException("Este Usuário não está cadastrado na nossa base de dados!");
            }

            $id = $data['id'];
            $data['password'] = $password;
            $pwd = self::getHash($password);

            $updPwd = "update users set password = '{$pwd}' where id = {$id}";

            $proxy->exec($updPwd);

            $body = file_get_contents("../../../smart/Mail/tpl/PasswordInvite.html");

            $mail = new PasswordInvite();
            $mail->configEmail($data, $body);
            $mail->Send();

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

}