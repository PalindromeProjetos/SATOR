<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class armorymovementitem extends \Smart\Data\Event {

	public function preInsertBeAvailable( \iSterilization\Model\armorymovementitem &$model ) {
		$proxy = $this->getProxy();
		$id = $model->getArmorymovementid();

		$sql = "
            declare
                @id int = :id;

            select
                closedby,
                releasestype,
                dbo.getEnum('releasestype',releasestype) as releasestypedescription
            from
                armorymovement
            where id = @id;";

		$pdo = $proxy->prepare($sql);
		$pdo->bindValue(":id", $id, \PDO::PARAM_INT);
		$pdo->execute();
		$rows = $pdo->fetchAll();

		if(count($rows) == 0) {
			throw new \PDOException('O Documento não foi encontrado na base de dados!');
		}

		if($rows[0]['releasestype'] != '001') {
			$closedby = $rows[0]['closedby'];
			$releasestypedescription = $rows[0]['releasestypedescription'];
			throw new \PDOException("O Documento <b>não pode</b> mais receber modificações! <br/>{$closedby}: {$releasestypedescription}");
		}
	}


    /**
     * @param \iSterilization\Model\armorymovementitem $model
     */
    public function preInsert( \iSterilization\Model\armorymovementitem &$model ) {
        Session::hasProfile('','');
		
		//$this->preInsertBeAvailable($model);
    }

    /**
     * @param \iSterilization\Model\armorymovementitem $model
     */
    public function posInsert( \iSterilization\Model\armorymovementitem &$model ) {

    }

    /**
     * @param \iSterilization\Model\armorymovementitem $model
     */
    public function preUpdate( \iSterilization\Model\armorymovementitem &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\armorymovementitem $model
     */
    public function posUpdate( \iSterilization\Model\armorymovementitem &$model ) {
    }

	public function preDeleteBeAvailable( \iSterilization\Model\armorymovementitem &$model ) {
		$proxy = $this->getProxy();
		$id = $model->getArmorymovementid();

		$sql = "
            declare
                @id int = :id;

            select
                a.closedby,
                a.releasestype,
                dbo.getEnum('releasestype',a.releasestype) as releasestypedescription
            from
                armorymovement a
				inner join armorymovementitem b on ( b.armorymovementid = a.id ) 
            where id = @id;";

		$pdo = $proxy->prepare($sql);
		$pdo->bindValue(":id", $id, \PDO::PARAM_INT);
		$pdo->execute();
		$rows = $pdo->fetchAll();

		if(count($rows) == 0) {
			throw new \PDOException('O Documento não foi encontrado na base de dados!');
		}

		if($rows[0]['releasestype'] != '001') {
			$closedby = $rows[0]['closedby'];
			$releasestypedescription = $rows[0]['releasestypedescription'];
			throw new \PDOException("O Documento <b>não pode</b> mais receber modificações! <br/>{$closedby}: {$releasestypedescription}");
		}
	}

    /**
     * @param \iSterilization\Model\armorymovementitem $model
     */
    public function preDelete( \iSterilization\Model\armorymovementitem &$model ) {
        Session::hasProfile('','');
		
		//$this->preDeleteBeAvailable($model);
    }

    /**
     * @param \iSterilization\Model\armorymovementitem $model
     */
    public function posDelete( \iSterilization\Model\armorymovementitem &$model ) {

    }

}