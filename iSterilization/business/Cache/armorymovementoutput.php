<?php

namespace iSterilization\Cache;

use iSterilization\Model\armorymovementoutput as Model;

class armorymovementoutput extends \Smart\Data\Cache {

    public function selectCode(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @id int = :id;
                
            select
                am.*,
                ao.clientid,
                c.name as clientname,
                ao.patientname, 
                ao.surgicalwarning, 
                ao.instrumentator, 
                ao.flowing, 
                ao.transportedby, 
                ao.surgicalroom, 
                ao.surgical, 
                ao.dateof, 
                ao.timeof, 
                ao.hasbox
            from
                armorymovement am
                inner join armorymovementoutput ao on ( ao.id = am.id )
                inner join client c on ( c.id = ao.clientid )
            where am.id = @id";

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