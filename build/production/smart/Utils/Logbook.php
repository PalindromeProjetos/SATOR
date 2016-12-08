<?php

namespace Smart\Utils;

use Smart\Setup\Start;
use Smart\Utils\Session;

/**
 * Class Logbook
 * @package Smart\Utils
 *
 * How to use
 *
 * select
 *   lt.id, lt.tablename, lt.operation, lt.eventdate, lt.logbookby,
 *   lf.fieldname, lf.fielddata
 * from
 *   logtables lt
 *   inner join logfields lf on ( lf.logtablesid = lt.id )
 * where lt.tablename = 'sterilizationtype'
 *   and lt.logbookby = 'sator.etimba'
 *   and lt.operation = 'update'
 *   and CONVERT(varchar(02), lt.eventdate, 108) = '07'
 *   and CONVERT(varchar(10), lt.eventdate, 103) = '03/04/2016'
 */
class Logbook extends \Smart\Data\Proxy {

    private $logtables = "
        insert logtables
            ( tablename, operation, logbookby )
        values
            ( :tablename, :operation, :logbookby )";

    private $logfields = "
        insert logfields
            ( logtablesid, fieldname, fielddata )
        values
            ( :logtablesid, :fieldname, :fielddata )";

    /**
     * Instância da Sessão
     *
     * @var null|Session
     */
    public $stash = null;

    public function __construct($model, $logtype = 'setLogFields') {
        $this->submit = $_POST;
        $this->stash = new Session();
        $this->pwd = Start::getPassWord();
        $this->usr = Start::getUserName();
        $this->dns = Start::logConnnect();

        if(!$model->getNotate()->instance->Entity->logbook) {
            exit;
        }

        $link = array( $this->dns, $this->usr, $this->pwd );

        parent::__construct( $link );

        $this->$logtype($model);
    }

    /**
     * Registrando Log da Tabela
     */
    public function setLogTables ($model) {
        $logbookby = $this->stash->username;
        $operation = $model->getSubmit()->getRawValue('action');
        $tablename = $model->getNotate()->instance->Entity->name;

        $pdo = $this->prepare($this->logtables);
        $pdo->bindValue(':tablename',$tablename, \PDO::PARAM_STR);
        $pdo->bindValue(':operation',$operation, \PDO::PARAM_STR);
        $pdo->bindValue(':logbookby',$logbookby, \PDO::PARAM_STR);
        $pdo->execute();

        return $this->lastInsertId();
    }

    /**
     * Registrando Log dos Campos
     */
    public function setLogFields ($model) {
        $rows = $model->getSubmit()->getRow();
        $property = $model->getNotate()->property;
        $logtablesid = $this->setLogTables($model);

        foreach ($rows as $field => $value) {
            $logallow = false;

            if($field == 'id') {
                $logallow = true;
            } else if (array_key_exists($field, $property) && ($property[$field]['Column']['logallow'])) {
                $logallow = true;
            }

            if($logallow == true) {
                $pdo = $this->prepare($this->logfields);
                $pdo->bindValue(':fieldname',$field, \PDO::PARAM_STR);
                $pdo->bindValue(':fielddata',$value, \PDO::PARAM_STR);
                $pdo->bindValue(':logtablesid',$logtablesid, \PDO::PARAM_INT);
                $pdo->execute();
            }
        }
    }

}