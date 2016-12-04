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
 *      $session = Session::getInstance();
 * </code>
 */
class Session {
    use Traits\TresultSet;

    const _SESSION_NAME = 'smart';
    const _SESSION_PATH = "/../tmp/sator/";

    const _SESSION_STARTED = true;
    const _SESSION_NOT_STARTED = false;

    // THE only instance of the class
    private static $instance = null;

    // The configs params
    private static $name = self::_SESSION_NAME;
    private static $path = self::_SESSION_PATH;

    // The state of the session
    private $sessionState = self::_SESSION_NOT_STARTED;

    private function __construct() {}

    /**
     *    Returns THE instance of 'Session'.
     *    The session is automatically initialized if it wasn't.
     *
     *    @return    object
     */
    public static function getInstance(array $data = null) {

        if( isset($data['name']) ) {
            self::$name = $data['name'];
        }

        if( isset($data['path']) ) {
            self::$path = $data['path'];
        }

        if ( !isset(self::$instance) ) {
            self::$instance = new self;
        }

        self::$instance->startSession();

        return self::$instance;
    }

    /**
     *    (Re)starts the session.
     *
     *    @return    bool    TRUE if the session has been initialized, else FALSE.
     */
    public function startSession() {
        $path = $_SERVER['DOCUMENT_ROOT'] . self::$path;

        if ( $this->sessionState == self::_SESSION_NOT_STARTED ) {
            $expireto = 60*60*24*1; // 1 day

            //session_save_path($path);

            ini_set('session.save_path',$path);
            ini_set('session.gc_maxlifetime', $expireto);

            session_set_cookie_params($expireto,$path);
            session_name(isset($_SERVER["HTTP_REFERER"]) ? basename($_SERVER["HTTP_REFERER"]) : self::$name);
            $this->sessionState = session_start();
        }

        return $this->sessionState;
    }

    /**
     *    Stores datas in the session.
     *    Example: $instance->foo = 'bar';
     *
     *    @param    name    Name of the datas.
     *    @param    value    Your datas.
     *    @return   void
     */
    public function __set( $name, $value ) {
        $_SESSION[$name] = $value;
    }

    /**
     *    Gets datas from the session.
     *    Example: echo $instance->foo;
     *
     *    @param    name    Name of the datas to get.
     *    @return   mixed    Datas stored in session.
     */
    public function __get( $name ) {
        if (isset($_SESSION[$name])) {
            return $_SESSION[$name];
        }
    }

    public function __isset( $name ) {
        return isset($_SESSION[$name]);
    }

    public function __unset( $name ) {
        unset($_SESSION[$name]);
    }

    /**
     *    Destroys the current session.
     *
     *    @return    bool    TRUE is session has been deleted, else FALSE.
     */
    public function destroy() {
        if ( $this->sessionState == self::_SESSION_STARTED ) {
            $this->sessionState = !session_destroy();

            unset( $_SESSION );

            return !$this->sessionState;
        }

        return false;
    }

    public function slay() {
        unset(self::$instance->usercode);
    }

    public function have() {
        return ( strlen(self::$instance->username) !== 0 );
    }

    public function hasProfile($menu, $action, $goback = false, $msgerror = null) {
        $username = self::$instance->username;

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