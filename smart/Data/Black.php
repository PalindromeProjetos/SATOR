<?php

namespace Smart\Data;

use Smart\Setup\Start;
use Smart\Utils\Session;
use Smart\Common\Traits as Traits;

/**
 * Um Proxy de acesso ao banco de dados "Caixa Preta"
 *
 * ex.: "sqlsrv:server=(local);database=fgv"
 *      "mysql:host=localhost;dbname=fgv"
 *
 * @package Smart\Data
 */
class Black extends \PDO {
    use Traits\TresultSet;

//    private static $pwd = "";
//    private static $usr = "root";
//    private static $dtb = "bighero";
//    private static $dns = "mysql:host=localhost;dbname=dtb";
//
//    public function __construct() {
//
//        $dns = self::getConnnect();
//        $usr = self::getUserName();
//        $pwd = self::getPassWord();
//
//        Start::setTimeZone();
//
//        try {
//            parent::__construct( $dns, $usr, $pwd );
//            $this->setAttribute( \PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION );
//            $this->setAttribute( \PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC );
//        } catch ( \PDOException $e ) {
//            self::_setSuccess(false);
//            self::_setText('Não foi possível acessar a base de dados de terceiros!');
//            echo self::getResultToJson();
//        }
//    }

    private static $pwd = "dbaadv";
    private static $usr = "dbaadv";
    private static $dtb = "prdmv";
    private static $dns = "oci:dbname= (DESCRIPTION =(ADDRESS_LIST =(ADDRESS = (PROTOCOL = TCP) (HOST = 10.51.26.60)(PORT = 1521)))(CONNECT_DATA = (SID = dtb)))";

    public function __construct() {

        $dns = self::getConnnect();
        $usr = self::getUserName();
        $pwd = self::getPassWord();

        Start::setTimeZone();

        try {
            parent::__construct( $dns, $usr,$pwd );
            $this->setAttribute( \PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION );
            $this->setAttribute( \PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC );
        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText('Não foi possível acessar a base de dados de terceiros!');
            echo self::getResultToJson();
        }
    }

    public static function getConnnect() {
        return str_replace("dtb",self::$dtb,self::$dns);
    }
    public static function getPassWord() {
        return self::$pwd;
    }
    public static function getUserName() {
        return self::$usr;
    }

    public function getPatient(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];

        $sql = "
        SELECT AVISO_CIRURGIA.CD_AVISO_CIRURGIA as id
              ,PACIENTE.CD_PACIENTE as id_patient
              ,PACIENTE.NM_PACIENTE as name
              ,CONVENIO.NM_CONVENIO as health_insurance
              ,SAL_CIR.DS_SAL_CIR as surgical_room              
              ,CIRURGIA.DS_CIRURGIA as surgical_procedure
              ,TO_CHAR( AVISO_CIRURGIA.DT_PREV_INTER, 'YYYY-MM-DD' ) as dateof
              ,TO_CHAR( AVISO_CIRURGIA.DT_PREV_INTER, 'hh24:mi' ) as timeof              
              ,AVISO_CIRURGIA.TP_SITUACAO as surgical_status
              ,AVISO_CIRURGIA.TP_CIRURGIAS as surgical_type
        FROM AVISO_CIRURGIA
            ,PACIENTE
            ,SAL_CIR
            ,CONVENIO
            ,ATENDIME
            ,CIRURGIA
            ,CIRURGIA_AVISO
        WHERE AVISO_CIRURGIA.CD_PACIENTE      = PACIENTE.CD_PACIENTE
        AND AVISO_CIRURGIA.CD_SAL_CIR         = SAL_CIR.CD_SAL_CIR
        AND AVISO_CIRURGIA.CD_ATENDIMENTO     = ATENDIME.CD_ATENDIMENTO(+)
        AND PACIENTE.CD_PACIENTE              = ATENDIME.CD_PACIENTE(+)
        AND CONVENIO.CD_CONVENIO(+)              = ATENDIME.CD_CONVENIO
        AND AVISO_CIRURGIA.CD_AVISO_CIRURGIA  = CIRURGIA_AVISO.CD_AVISO_CIRURGIA
        AND CIRURGIA.CD_CIRURGIA              = CIRURGIA_AVISO.CD_CIRURGIA		
        AND CIRURGIA_AVISO.SN_PRINCIPAL       = 'S'
       -- AND AVISO_CIRURGIA.TP_SITUACAO       != 'C'
        AND DT_AVISO_CIRURGIA > (sysdate - 30)
        AND (
        UPPER(AVISO_CIRURGIA.CD_AVISO_CIRURGIA) LIKE UPPER('%".$query."%')
        OR
        UPPER(PACIENTE.NM_PACIENTE) LIKE UPPER('%".$query."%') )";

        try {

            $pdo = $this->prepare($sql);
            $pdo->execute();
            $rows =  $pdo->fetchAll();
            $list = array();

            foreach ($rows as $item) {
                $list[] = array_change_key_case($item,CASE_LOWER);
            }

            $rows = $list;

            self::_setRows( $rows );
            self::_setPage($start,$limit);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
   }

//    public function getPatient(array $data) {
//        $query = $data['query'];
//        $start = $data['start'];
//        $limit = $data['limit'];
//
//        $sql = "
//            select
//                AVISO_CIRURGIA as id,
//                COD_PACIENTE as id_patient,
//                PACIENTE as name,
//                CONVENIO as health_insurance
//            from
//                avisocirurgia
//            where AVISO_CIRURGIA like :AVISO_CIRURGIA or PACIENTE like :PACIENTE";
//
//        try {
//
//            $query = "%{$query}%";
//
//            $pdo = $proxy->prepare($sql);
//            $pdo->bindValue(":PACIENTE", $query, \PDO::PARAM_STR);
//            $pdo->bindValue(":AVISO_CIRURGIA", $query, \PDO::PARAM_STR);
//            $pdo->execute();
//            $rows = $pdo->fetchAll();
//
//            self::_setRows($rows);
//            self::_setPage($start,$limit);
//
//        } catch ( \PDOException $e ) {
//            self::_setSuccess(false);
//            self::_setText($e->getMessage());
//        }
//
//        return self::getResultToJson();
//    }


}