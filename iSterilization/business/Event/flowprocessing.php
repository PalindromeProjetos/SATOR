<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessing extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessing $model
     */
    public function preInsert( \iSterilization\Model\flowprocessing &$model ) {
        Session::hasProfile('','');

        $proxy = $this->getProxy();
        $sterilizationtypeid = $model->getSterilizationtypeid();

        $sql = "
            declare
                @sterilizationtypeid int = :sterilizationtypeid;
                
            select
                authenticate
            from
                sterilizationtype
            where id = @sterilizationtypeid;";

        $pdo = $proxy->prepare($sql);
        $pdo->bindValue(":sterilizationtypeid", $sterilizationtypeid, \PDO::PARAM_INT);
        $callback = $pdo->execute();

        if(!$callback) {
            throw new \PDOException(self::$FAILURE_STATEMENT);
        }

        $rows = $pdo->fetchAll();

        $authenticate = $rows[0]['authenticate'];

        if(intval($authenticate) == 0) {
            throw new \PDOException('<b>O Fluxo</b> selecionado para esta leitura <b>Não Está Autenticado!</b>');
        }

        $sql = "
            declare
                @dateof varchar(20) = :dateof;
                 
            select 
                dbo.getLeftPad(6,'0',count(*)+1) as newcode
            from
                flowprocessing
            where convert(varchar(6),dateof,112) = @dateof";

        $dateof = date("Ym");
        $pdo = $proxy->prepare($sql);
        $pdo->bindValue(":dateof", $dateof, \PDO::PARAM_STR);
        $callback = $pdo->execute();

        if(!$callback) {
            throw new \PDOException(self::$FAILURE_STATEMENT);
        }

        $rows = $pdo->fetchAll();

        $barcode = "P". $dateof . $rows[0]['newcode'];

        $model->set('barcode',$barcode);
    }

    /**
     * @param \iSterilization\Model\flowprocessing $model
     */
    public function posInsert( \iSterilization\Model\flowprocessing &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessing $model
     */
    public function preUpdate( \iSterilization\Model\flowprocessing &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessing $model
     */
    public function posUpdate( \iSterilization\Model\flowprocessing &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessing $model
     */
    public function preDelete( \iSterilization\Model\flowprocessing &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessing $model
     */
    public function posDelete( \iSterilization\Model\flowprocessing &$model ) {

    }

}