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
        $areasid = $data['areasid'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @areasid int = :areasid,
                @materialid int = :materialid;
                            
            select distinct top 4
                fp.id, 
                fp.barcode,
                fp.flowstatus,
                fp.dateof,
                dbo.getEnum('flowstatus',fp.flowstatus) as flowstatusdescription,
                a.stepsettings,
                coalesce(b.chargeid,a.flowprocessingstepid) as flowprocessingstepid,
                b.barcode as charge,
				b.chargeflag,
				dbo.getEnum('chargeflag',b.chargeflag) as chargeflagdescription
            from
                flowprocessingstepmaterial fpm
                inner join flowprocessingstep fps on ( fps.id = fpm.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                outer apply (
                    select
                        a.stepsettings,
                        a.id as flowprocessingstepid
                    from
                        flowprocessingstep a
                    where a.flowprocessingid = fp.id
                      and a.areasid = @areasid
                ) a
				outer apply (
                    select top 1
                        c.id as chargeid,
                        c.barcode,
						c.chargeflag
                    from
                        flowprocessingstep a
						inner join flowprocessingchargeitem b on ( b.flowprocessingstepid = a.id )
						inner join flowprocessingcharge c on ( c.id = b.flowprocessingchargeid and c.chargeflag in ('001','002','003','005','006') )
                    where a.flowprocessingid = fp.id
                      and a.areasid in (@areasid, null)
                    order by c.chargedate desc
                ) b
            where fpm.materialid = @materialid
            order by fp.dateof desc";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
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

    public function selectByMaterialProcesso(array $data) {
        $query = $data['query'];
        $areasid = $data['areasid'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
			SET XACT_ABORT ON
			SET NOCOUNT ON
			SET ANSI_NULLS ON
			SET ANSI_WARNINGS ON       
        
            declare
                @areasid int = :areasid,
                @materialid int = :materialid;
/*
			if object_id('tempdb.dbo.#tmp') is not null drop table #tmp

            select top 10
                fp.id, 
                fp.barcode,
                fp.flowstatus,
                fp.dateof,
				stepsettings = (
					select
						stepsettings
					from
						flowprocessingstep
					where areasid = @areasid
					  and flowprocessingid = fp.id
				),
                dbo.getEnum('flowstatus',fp.flowstatus) as flowstatusdescription,
				fps.id as flowprocessingstepid
				into #tmp
            from
                flowprocessingstepmaterial fpsm
                inner join flowprocessingstep fps on ( fps.id = fpsm.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid and fp.areasid = fps.areasid )
            where fpsm.materialid = @materialid
            order by fp.dateof desc

			select
                id, 
                barcode,
                flowstatus,
                dateof,
				stepsettings,
                flowstatusdescription,
				case row_number() over (order by id desc)
					when 1 then (
						select
							--c.id
							coalesce(c.id,a.id) as id
						from
							flowprocessingstep a
							inner join flowprocessingchargeitem b on ( b.flowprocessingstepid = a.id )
							inner join flowprocessingcharge c on ( c.id = b.flowprocessingchargeid )
						where a.flowprocessingid = #tmp.id
						  --and a.areasid = @areasid
					)
					else flowprocessingstepid
				end as flowprocessingstepid
			from
				#tmp
*/
            select distinct top 4
                fp.id, 
                fp.barcode,
                fp.flowstatus,
                fp.dateof,
                dbo.getEnum('flowstatus',fp.flowstatus) as flowstatusdescription,
                a.stepsettings,
                coalesce(b.chargeid,a.flowprocessingstepid) as flowprocessingstepid,
                b.barcode as charge,
				b.chargeflag,
				dbo.getEnum('chargeflag',b.chargeflag) as chargeflagdescription
            from
                flowprocessingstepmaterial fpm
                inner join flowprocessingstep fps on ( fps.id = fpm.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                outer apply (
                    select
                        a.stepsettings,
                        a.id as flowprocessingstepid
                    from
                        flowprocessingstep a
                    where a.flowprocessingid = fp.id
                      and a.areasid = @areasid
                ) a
				outer apply (
                    select top 1
                        c.id as chargeid,
                        c.barcode,
						c.chargeflag
                    from
                        flowprocessingstep a
						inner join flowprocessingchargeitem b on ( b.flowprocessingstepid = a.id )
						inner join flowprocessingcharge c on ( c.id = b.flowprocessingchargeid and c.chargeflag in ('001','002','003','005','006') )
                    where a.flowprocessingid = fp.id
                      and a.areasid in (@areasid, null)
                    order by c.chargedate desc
                ) b
            where fpm.materialid = @materialid
            order by fp.dateof desc";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
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

    public function selectByMaterialMovimento(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
			SET XACT_ABORT ON
			SET NOCOUNT ON
			SET ANSI_NULLS ON
			SET ANSI_WARNINGS ON       
        
            declare
                @materialid int = :materialid;
                            
			select top 10
                am.id,
				fp.barcode,
                am.movementuser, 
                am.movementdate,
				dbo.getEnum('releasestype',am.releasestype) as releasestypedescription,
				dbo.getEnum('movementtype',am.movementtype) as movementtypedescription
			from
				flowprocessingstepmaterial fpsm
				inner join flowprocessingstep fps on ( fps.id = fpsm.flowprocessingstepid )
				inner join armorymovementitem ami on ( ami.flowprocessingstepid = fps.id )
				inner join armorymovement am on ( am.id = ami.armorymovementid )
				inner join flowprocessing fp on ( fp.id = fps.flowprocessingid ) 
			where fpsm.materialid = @materialid
			order by am.closeddate desc";

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

    public function selectByMaterialLote(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @materialid int = :materialid;
                            
            select top 10
                fpc.id,
                fpc.barcode,
				fpc.chargeflag,
				fpc.chargedate,
				dbo.getEnum('chargeflag',fpc.chargeflag) as chargeflagdescription
            from
                flowprocessingstepmaterial fpm
                inner join flowprocessingstep fps on ( fps.id = fpm.flowprocessingstepid )
				inner join flowprocessingchargeitem fpci on ( fpci.flowprocessingstepid = fps.id )
				inner join flowprocessingcharge fpc on ( fpc.id = fpci.flowprocessingchargeid )
            where fpm.materialid = @materialid
            order by fpc.chargedate desc";

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