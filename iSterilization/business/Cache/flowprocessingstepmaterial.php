<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingstepmaterial as Model;

class flowprocessingstepmaterial extends \Smart\Data\Cache {

    public function selectCode(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            select
                fpm.id, 
                fpm.flowprocessingstepid, 
                fpm.materialid, 
                ib.barcode,
                ib.name as materialname,
                fpm.unconformities, 
                p.name as proprietaryname,
                dbo.getEnum('unconformities',fpm.unconformities) as unconformitiesdescription,
                fpm.dateof,
                fpm.dateto,
                dbo.binary2base64(ib.filedata) as filedata,
                ib.fileinfo
            from
                flowprocessingstepmaterial fpm
                inner join itembase ib on ( ib.id = fpm.materialid )
                inner join proprietary p on ( p.id = ib.proprietaryid ) 
            where fpm.flowprocessingstepid = :flowprocessingstepid";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":flowprocessingstepid", $query, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);
            self::_setSuccess(count($rows) != 0);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

}