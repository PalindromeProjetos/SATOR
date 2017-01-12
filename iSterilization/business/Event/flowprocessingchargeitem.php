<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingchargeitem extends \Smart\Data\Event {

	public function preInsertBeAvailable( \iSterilization\Model\flowprocessingchargeitem &$model ) {
		$proxy = $this->getProxy();
		$id = $model->getFlowprocessingchargeid();

		$sql = "
            declare
                @id int = :id;

            select
                cyclefinal,
                chargeflag,
                dbo.getEnum('chargeflag',chargeflag) as chargeflagdescription
            from
                flowprocessingcharge
            where id = @id;";

		$pdo = $proxy->prepare($sql);
		$pdo->bindValue(":id", $id, \PDO::PARAM_INT);
		$pdo->execute();
		$rows = $pdo->fetchAll();

		if(count($rows) == 0) {
			throw new \PDOException('O Documento não foi encontrado na base de dados!');
		}

		if($rows[0]['chargeflag'] != '001') {
			$cyclefinaluser = $rows[0]['cyclefinaluser'];
			$chargeflagdescription = $rows[0]['chargeflagdescription'];
			throw new \PDOException("O Documento <b>não pode</b> mais receber modificações! <br/>{$cyclefinaluser}: {$chargeflagdescription}");
		}
	}

    /**
     * @param \iSterilization\Model\flowprocessingchargeitem $model
     */
    public function preInsert( \iSterilization\Model\flowprocessingchargeitem &$model ) {
        Session::hasProfile('','');
		
		//$this->preInsertBeAvailable($model);
    }

    /**
     * @param \iSterilization\Model\flowprocessingchargeitem $model
     */
    public function posInsert( \iSterilization\Model\flowprocessingchargeitem &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingchargeitem $model
     */
    public function preUpdate( \iSterilization\Model\flowprocessingchargeitem &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingchargeitem $model
     */
    public function posUpdate( \iSterilization\Model\flowprocessingchargeitem &$model ) {
    }

	public function preDeleteBeAvailable( \iSterilization\Model\flowprocessingchargeitem &$model ) {
		$proxy = $this->getProxy();
		$id = $model->getId();

		$sql = "
            declare
                @id int = :id;

            select
                a.cyclefinal,
                a.chargeflag,
                dbo.getEnum('chargeflag',a.chargeflag) as chargeflagdescription
            from
                flowprocessingcharge a
                inner join flowprocessingchargeitem b on ( b.flowprocessingchargeid = a.id ) 
            where b.id = @id;";

		$pdo = $proxy->prepare($sql);
		$pdo->bindValue(":id", $id, \PDO::PARAM_INT);
		$pdo->execute();
		$rows = $pdo->fetchAll();

		if(count($rows) == 0) {
			throw new \PDOException('O Documento não foi encontrado na base de dados!');
		}

		if($rows[0]['chargeflag'] != '001') {
			$cyclefinaluser = $rows[0]['cyclefinaluser'];
			$chargeflagdescription = $rows[0]['chargeflagdescription'];
			throw new \PDOException("O Documento <b>não pode</b> mais receber modificações! <br/>{$cyclefinaluser}: {$chargeflagdescription}");
		}
	}

    /**
     * @param \iSterilization\Model\flowprocessingchargeitem $model
     */
    public function preDelete( \iSterilization\Model\flowprocessingchargeitem &$model ) {
        Session::hasProfile('','');
		
		//$this->preDeleteBeAvailable($model);
    }

    /**
     * @param \iSterilization\Model\flowprocessingchargeitem $model
     */
    public function posDelete( \iSterilization\Model\flowprocessingchargeitem &$model ) {

    }

}