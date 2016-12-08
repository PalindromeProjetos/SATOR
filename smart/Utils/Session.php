<?php

namespace Smart\Utils;

use Smart\Data\Proxy;
use Smart\Setup\Start;
use Smart\Common\Traits as Traits;

/**
 * Session
 *
 * Realiza o controle de autenticação do Usuário no servidor
 *
 * Validar permissões de acesso - Profile
 *
 * <code>
 *      $session = new Session();
 * </code>
 */
class Session {
    use Traits\TresultSet;

    const _SESSION_NAME = 'smart';
    const _SESSION_DATE = 60*60*24*1;
    const _SESSION_PATH = '/../session/smart/';

    private static $name = self::_SESSION_NAME;
    private static $date = self::_SESSION_DATE;
    private static $path = self::_SESSION_PATH;

	/**
	 * http://www.scriptcase.com.br/forum/index.php?topic=4849.0
	 * http://forum.wmonline.com.br/topic/157538-session-cache-expire;/
	 * https://groups.google.com/forum/#!topic/php-brasil/nfoW0Bdx9Bc
	 */
    public function __construct(array $data = null) {
        $path = $_SERVER['DOCUMENT_ROOT'] . self::$path;
        $name = isset($_SERVER["HTTP_REFERER"]) ? basename($_SERVER["HTTP_REFERER"]) : self::$name;

		@session_set_cookie_params(self::$date);
        @session_save_path($path);
        @session_name($name);
        @session_start();

        if(!is_array($data)) return true;

        foreach ($data as $field => $value) {
            $this->$field = $value;
        }
    }

    public function destroy() {
        @session_unset();
        @session_destroy();
    }

    public function __set( $field, $value ) {
        $_SESSION[$field] = $value;
    }

    public function __get( $field ) {
        return isset($_SESSION[$field]) ? $_SESSION[$field] : '';
    }

    public function have() {
        return (strlen($this->username) !== 0);
    }

    public function slay() {
        unset($this->usercode);
    }

    public function __isset( $field ) {
        return isset($_SESSION[$field]);
    }

    public function __unset( $field ) {
        unset($_SESSION[$field]);
    }

    public static function hasProfile($menu, $action, $goback = false, $msgerror = null) {
        $username = isset($_SESSION['username']) ? $_SESSION['username'] : '';

        if(strlen($menu) == 0 || strlen($action) == 0) {
            return true;
        }

        $dns = Start::getConnnect();
        $pwd = Start::getPassWord();
        $usr = Start::getUserName();

        $proxy = new Proxy(array($dns, $usr, $pwd));

        $sql = "
			declare
				@mguid varchar(36) = :mguid,
				@aguid varchar(36) = :aguid,
				@uname varchar(20) = :uname;

            select distinct
			   0 as priority,
               u.isactive,
               a.negation,
               uma.expireto
            from
               users u
               inner join usersmenu um on ( um.usersid = u.id )
               inner join menuaction ma on ( ma.menuid = um.menuid )
               inner join action a on ( a.id = ma.actionid )
               inner join menu m on ( m.id = ma.menuid )
               inner join usersmenuaction uma on ( uma.usersmenuid = um.id and uma.menuactionid = ma.id )
			where m.guid = @mguid
			  and a.guid = @aguid
              and u.username = @uname

			union all

			select
                1 as priority,
                u.isactive,
                a.negation,
                pma.expireto
            from
                users u
                inner join usersprofile up on ( up.usersid = u.id )
                inner join profile p on ( p.id = up.profileid )
                inner join profilemenu pm on ( pm.profileid = p.id )
                inner join menu m on ( m.id = pm.menuid )
                inner join profilemenuaction pma on ( pma.profilemenuid = pm.id )
                inner join menuaction ma on ( ma.menuid = m.id and ma.id = pma.menuactionid )
                inner join action a on ( a.id = ma.actionid )			 
			where m.guid = @mguid
			  and a.guid = @aguid
              and u.username = @uname

			order by 1";

        try {

            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":mguid", $menu, \PDO::PARAM_STR);
            $pdo->bindValue(":aguid", $action, \PDO::PARAM_STR);
            $pdo->bindValue(":uname", $username, \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        $credential = (object) self::getResult();

        if($goback === true) {
            return $credential;
        }

        if(count($rows) == 0) {
            throw new \PDOException($msgerror || 'Não existe permissão habilitada para esta ação no seu perfil!');
        }

        $isactive = $rows[0]['isactive'];
        $negation = $rows[0]['negation'];
        $expireto = $rows[0]['expireto'];

        if($isactive != 1) {
            throw new \PDOException($msgerror || ($negation . '.<br/><br/> O seu usuário não é mais válido!'));
        }

        $format = "Y-m-d";
        $date1  = \DateTime::createFromFormat($format, $expireto);
        $date2  = \DateTime::createFromFormat($format, date("Y-m-d"));

        if($date1 < $date2) {
            throw new \PDOException($msgerror || ($negation . '.<br/> <br/>A data para esta ação expirou!'));
        }

    }

}