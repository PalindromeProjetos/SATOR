<?php

namespace Smart\Setup;

class Start {

    //http://php.net/manual/pt_BR/timezones.america.php

    // private static $pwd = "";
    // private static $usr = "root";
    // private static $sch = "bighero";
    // private static $dtb = "bighero";
    // private static $tmz = "America/Manaus";
    // private static $dns = "mysql:host=localhost;dbname=dtb";	
	
    private static $usr = "sa";
    private static $sch = "dbo";
    private static $pwd = "ms128";

//    private static $dtb = "CMENEW";
//    private static $log = "CMENEW_LOG";

    private static $dtb = "CMENEW_TEST";
    private static $log = "CMENEW_LOG_TEST";

    private static $tmz = "America/Manaus";
    //private static $dns = "sqlsrv:server=(local);database=dtb";
    private static $dns = "sqlsrv:server=(local)\\sqlexpress;database=dtb";


/*
    private static $usr = "sa";
    private static $sch = "dbo";
    private static $pwd = "1844";
    private static $dtb = "CMENEW";
    private static $log = "CMENEW_LOG";
    private static $tmz = "America/Manaus";
    private static $dns = "sqlsrv:server=10.51.26.2;database=dtb";
*/

    public static function tableSchema() {
        return self::$sch;
    }
    public static function getPassWord() {
        return self::$pwd;
    }
    public static function getUserName() {
        return self::$usr;
    }
    public static function getTimeZone() {
        return self::$tmz;
    }
    public static function getDataBase() {
        return self::$dtb;
    }
    public static function areTestBase() {
        return is_numeric(strripos(self::getDataBase(), 'test'));
    }
    public static function setTimeZone() {
        date_default_timezone_set(self::$tmz);
    }
    public static function getConnnect() {
        return str_replace("dtb",self::$dtb,self::$dns);
    }
    public static function logConnnect() {
        return str_replace("dtb",self::$log,self::$dns);
    }

}