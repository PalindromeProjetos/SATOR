<?php

namespace iAdmin\Event;

use Smart\Utils\Session;

class areas extends \Smart\Data\Event {

    /**
     * @param  $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param  $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param  $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');

        if($model->getWorkstation() == 'update') {
            $guid = '';

            if($this->checUpdatekWorkstation($model,$guid)) {
                throw new \PDOException("Para esta Área já existe uma Estação Configurada!!");
            }
            $model->set('workstation',$guid);
        }

        if($model->getWorkstation() == 'delete') {

            if($this->checDeletekWorkstation($model)) {
                throw new \PDOException("Operação solicitada inválida, Estação diferente da atual!");
            }

            $model->set('workstation','');
        }
    }

    public function checDeletekWorkstation($model) {
        $id = $model->getId();

        $pdo = $this->getProxy()->prepare("select workstation, printlocate from areas where id = :id");
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);

        $pdo->execute();
        $rows = $pdo->fetchAll();

        return (count($rows) == 0);
    }

    public function checUpdatekWorkstation($model,&$guid) {
        $id = $model->getId();

        $pdo = $this->getProxy()->prepare("select workstation, printlocate, newid() as guid from areas where id = :id");
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);

        $pdo->execute();
        $rows = $pdo->fetchAll();
        $data = $rows[0];
        $guid = $data['guid'];
        $workstation = $data['workstation'];

        return (strlen($workstation) != 0);
    }

    /**
     * @param  $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param  $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param  $model
     */
    public function posDelete( &$model ) {

    }

}