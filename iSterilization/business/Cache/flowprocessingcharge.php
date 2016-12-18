<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingcharge as Model;

class flowprocessingcharge extends \Smart\Data\Cache {

    public function selectCode(array $data) {
        $query = $data['query'];

        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @id int = :id;
                
            select
                fpc.*,
                ec.equipmentid,
                c.name as cyclename,
                ib.name as equipmentname                
            from
                flowprocessingcharge fpc
                left join equipmentcycle ec on ( ec.id = fpc.equipmentcycleid )
                left join itembase ib on ( ib.id = ec.equipmentid )
                left join cycle c on ( c.id = ec.cycleid )
            where fpc.id = @id;";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":id", $query, \PDO::PARAM_INT);

            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

}