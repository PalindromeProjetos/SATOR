<?php


class Session {
    // const _SESSION_NAME = 'smart';
	const _SESSION_PATH = '/../session/smart/';
	const _SESSION_NAME = 'ARMSApp';
    const _SESSION_DATE = 60*60*24*1;
	
    private static $date = self::_SESSION_DATE;
    private static $name = self::_SESSION_NAME;
    private static $path = self::_SESSION_PATH;

    public function __construct(array $data = null) {
        $root = $_SERVER['DOCUMENT_ROOT'];

		//$lifetime = strtotime('+30 minutes', 0);
		
        @session_save_path($root . self::$path);
		@session_set_cookie_params(self::$date);
        @session_name(self::$name);
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
        return isset($_SESSION[$field]) ? $_SESSION[$field] : null;
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

    public static function hasProfile() {
        $username = isset($_SESSION['username']) ? $_SESSION['username'] : '';
        return $username;
    }

}

$data = array(
            'username'=>'Samuel Oliveira da Silva',
            'password'=>'011295'
        );

$session = new Session($data);

$session->username = 'SamuelOliveira';

echo $session->username . '<br/>';
echo $session->password;
//$session->kilSession();
//echo $session::hasProfile();

// gc_enable();
// gc_collect_cycles();