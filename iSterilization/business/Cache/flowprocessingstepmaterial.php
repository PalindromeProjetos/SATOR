<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingstepmaterial as Model;

class flowprocessingstepmaterial extends \Smart\Data\Cache {

    public function selectCode(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @flowprocessingstepid int = :flowprocessingstepid;
                
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
                fpm.dateto
                --dbo.binary2base64(ib.filedata) as filedata,
                --ib.fileinfo
            from
                flowprocessingstepmaterial fpm
                inner join itembase ib on ( ib.id = fpm.materialid )
                inner join proprietary p on ( p.id = ib.proprietaryid ) 
            where fpm.flowprocessingstepid = @flowprocessingstepid";

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

    public function selectFile(array $data) {
        $materialid = $data['materialid'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @materialid int = :materialid;
                
            select
                ib.id, 
                dbo.binary2base64(ib.filedata) as filedata,
                ib.fileinfo
            from
                itembase ib
            where ib.id = @materialid";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":materialid", $materialid, \PDO::PARAM_INT);
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

    public function insertItem(array $data) {
        $barcode = $data['barcode'];
        $flowprocessingstepid = $data['flowprocessingstepid'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @barcode varchar(20) = :barcode,
                @flowprocessingstepid int = :flowprocessingstepid;
            
                if(left(@barcode, 1) = 'C')
                begin
                    select
                        ib.id,
                        ib.isactive,
                        m.materialstatus
                    from
                        itembase ib
                        inner join material m on ( m.id = ib.id )
                    where ib.barcode = @barcode
                end
            
                if(left(@barcode, 1) = 'P')
                begin
                    select
                        ib.id,
                        ib.isactive,
                        m.materialstatus
                    from
                        flowprocessing fp
                        inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                        inner join flowprocessingstepmaterial fpsm on ( fpsm.flowprocessingstepid = fps.id )
                        inner join itembase ib on ( ib.id = fpsm.materialid )
                        inner join material m on ( m.id = ib.id )
                    where fp.barcode = @barcode
                      and fps.id = @flowprocessingstepid
                end";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
            $pdo->bindValue(":flowprocessingstepid", $flowprocessingstepid, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            if(count($rows) == 0) {
                throw new \PDOException("O Material solicitado não pôde ser encontrado!");
            }

            $date = date("Y-m-d H:i");
            $material = new \iSterilization\Coach\flowprocessingstepmaterial();
            $material->getStore()->getModel()->set('id','');
            $material->getStore()->getModel()->set('dateof',$date);
            $material->getStore()->getModel()->set('dateto',$date);
            $material->getStore()->getModel()->set('unconformities','010');
            $material->getStore()->getModel()->set('flowprocessingstepid',$flowprocessingstepid);
            $material->getStore()->insert();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectByMaterial(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @materialid int = :materialid;
                
            select distinct
                fp.id, 
                fp.barcode,
                fp.flowstatus,
                fp.dateof,
                dbo.getEnum('flowstatus',fp.flowstatus) as flowstatusdescription
            from
                flowprocessingstepmaterial fpm
                inner join flowprocessingstep fps on ( fps.id = fpm.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid ) 
            where fpm.materialid = @materialid";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":materialid", $query, \PDO::PARAM_INT);

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