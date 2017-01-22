<?php

namespace iSterilization\Cache;

use Smart\Data\Black;
use Smart\Common\Traits as Traits;
use iSterilization\Model\flowprocessing as Model;

class flowprocessing extends \Smart\Data\Cache {
    use Traits\TuserHandler;

    public function selectByProcess($query,$proxy) {
        $sql = "
            declare
                @barcode varchar(20) = :barcode;

            select
                ib.barcode
            from
                flowprocessing fp
                inner join itembase ib on ( ib.id = fp.materialid )
            where fp.barcode = @barcode;";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectOpenMaterial(array $data) {
        $query = $data['query'];
        $param = $data['param'];
        $itemgroup = isset($data['itemgroup']) ? $data['itemgroup'] : '000';

        $proxy = $this->getStore()->getProxy();

        if ($param == 'P') {
            $result = self::jsonToObject($this->selectByProcess($query,$proxy));
            if($result->records != 0) {
                $query = $result->rows[0]->barcode;
            }
        }

        $sql = "
            declare
                @name varchar(80) = :name,
                @barcode varchar(20) = :barcode,
                @itemgroup varchar(3) = :itemgroup;
                
            select TOP 5
                ib.id,
                ib.name,
                ib.barcode,
				ib.itemgroup,                
                ib.description,
                a.materialboxid,
                a.materialboxname,
                a.colorschema,
                a.materialboxitems,
                dbo.binary2base64(ib.filedata) as filedata,
                ib.fileinfo,
                st.version,
                pk.name as packingname,
                pt.name as proprietaryname,
                mf.name as manufacturername,
                -- tipo de fluxo e prioridade
                mtf.sterilizationtypeid,
                st.name as sterilizationtypename,
				m.materialstatus,
				st.dataflowstep,
				dbo.getEnum('materialstatus',m.materialstatus) as materialstatusdescription,
				dbo.getEnum('itemgroup',ib.itemgroup) as itemgroupdescription,
                mtf.prioritylevel,
                dbo.areAvailableForProcessing(@barcode,'P') as areavailable,
                dbo.getEnum('prioritylevel',mtf.prioritylevel) as priorityleveldescription,
                st.name +' ('+ dbo.getEnum('prioritylevel',mtf.prioritylevel) +')' as sterilizationpriority,
                areavailable = dbo.areAvailableForProcessing (ib.barcode, 'L')
            from
                itembase ib
                inner join manufacturer mf on ( mf.id = ib.manufacturerid )
                inner join material m on ( m.id = ib.id )
				inner join packing pk on ( pk.id = m.packingid )
                inner join proprietary pt on ( pt.id = ib.proprietaryid )
                inner join materialtypeflow mtf on ( mtf.materialid = m.id and mtf.prioritylevel = 'N' )
                inner join sterilizationtype st on ( st.id = mtf.sterilizationtypeid )
                outer apply (
                    SELECT
						materialboxitems = (
							SELECT
							    COUNT(mbi.id)
							FROM
							    materialboxitem mbi
							WHERE mbi.materialboxid = mb.id
							  --AND mbi.boxitemstatus = 'A'
						),
                        mbi.materialboxid,
						mb.name as materialboxname,
                        colorschema = (
                            select stuff
                                (
                                    (
                                        select
                                            ',#' + tc.colorschema + '|#' + tc.colorstripe
                                        from
                                            materialboxtarge mbt
                                            inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                        where mbt.materialboxid = mb.id
                                        order by mbt.targeorderby asc
                                        for xml path ('')
                                    ) ,1,1,''
                                )                
                        )
                    FROM
                        materialbox mb
                    inner join materialboxitem mbi on ( 
                                    mbi.materialboxid = mb.id
                                AND mbi.materialid = m.id )
                                --AND mbi.boxitemstatus = 'A' )
                    inner join itembase ibt on ( ibt.id = mbi.materialid )
                ) a
            where ib.isactive = 1
              and ( ib.itemgroup = @itemgroup or @itemgroup = '000' )
              and (
                    ib.barcode = @barcode OR
                    ib.name COLLATE Latin1_General_CI_AI LIKE @name
              )";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
            $pdo->bindValue(":name", "{$query}%", \PDO::PARAM_STR);
            $pdo->bindValue(":itemgroup", $itemgroup, \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function getAvailableForProcessing(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @barcode varchar(20) = :barcode;
                
            exec dbo.getAvailableForProcessing @barcode";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectOpenSterilizationType(array $data) {
        $materialid = $data['materialid'];
        $flowtype = isset($data['flowtype']) ? $data['flowtype'] : '001';

        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @flowtype char(3) = :flowtype,
                @materialid int = :materialid;

            select
                st.id,
                st.name,
                mtf.prioritylevel,
                dbo.getEnum('prioritylevel',mtf.prioritylevel) as priorityleveldescription,
                st.name +' ('+ dbo.getEnum('prioritylevel',mtf.prioritylevel) +')' as sterilizationpriority
            from
                itembase ib
                inner join material m on ( m.id = ib.id )
                inner join materialtypeflow mtf on ( mtf.materialid = m.id )
                inner join sterilizationtype st on ( st.id = mtf.sterilizationtypeid )
            where ST.flowtype = @flowtype 
              and mtf.materialid = @materialid";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":flowtype", $flowtype, \PDO::PARAM_STR);
            $pdo->bindValue(":materialid", $materialid, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectOpenSterilizationTypeWoof(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @query varchar(60) = :query;
                
            select
                st.id,
                st.name,
                'N' as prioritylevel,
                dbo.getEnum('prioritylevel','N') as priorityleveldescription,
                st.name +' ('+ dbo.getEnum('prioritylevel','N') +')' as sterilizationpriority
            from
                sterilizationtype st
            where st.flowtype = '002' and st.name COLLATE Latin1_General_CI_AI LIKE @query";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":query", $query, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

	public function selectOpenPatient(array $data) {
		$black = new Black();
		
		return $black->getPatient($data);
	}

    public function selectOpenInput(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $equipmentid = $data['equipmentid'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            SELECT
                ip.id,
                ib.name,
                ip.acronym,
				ip.presentation,
                dbo.getEnum('presentation',ip.presentation) as presentationdescription,
				cas.lotamount,
				cas.datevalidity,
				cas.lotpart,
				cas.lotamount,
				i.hasbatch,
				i.hasstock
            FROM
                itembase ib
                inner join input i on ( i.id = ib.id )
                inner join inputpresentation ip on ( ip.inputid = i.id )
				inner join cmeareasstock cas on ( 
							cas.equipmentid = :equipmentid
						and cas.inputid = ip.inputid
						and cas.presentation = ip.presentation
						)
            WHERE ib.name LIKE :name";

        try {
            $pdo = $proxy->prepare($sql);

            $query = "%{$query}%";

            $pdo->bindValue(":name", $query, \PDO::PARAM_STR);
            $pdo->bindValue(":equipmentid", $equipmentid, \PDO::PARAM_INT);

            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);
            self::_setPage($start,$limit);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectEquipment(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @areasid int = :areasid;
            
            select distinct
                ib.id,
                ib.name as equipmentname
            from
                equipment e
                inner join itembase ib on ( ib.id = e.id )
                inner join equipmentcycle ec on ( ec.equipmentid = ib.id )
                inner join cmesubareas csa on ( csa.cmeareasid = e.cmeareasid )
                inner join cmeareas ca on ( ca.id = csa.cmeareasid )
            where csa.id = @areasid
            --  and ec.id not in (
            --        select
            --            fpc.equipmentcycleid
            --        from
            --            flowprocessingcharge fpc
            --        where fpc.equipmentcycleid = ec.id
            --          and fpc.chargeflag = '001'
            --   )";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":areasid", $query, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectDashFlow(array $data) {
        $dateof = $data['dateof'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            select
                fp.id, 
                fp.sterilizationtypeid, 
                st.name as sterilizationtypename,
                fp.areasid, 
                a.name as areasname,
                fp.materialid, 
                fp.clientid, 
                fp.username, 
                fp.prioritylevel, 
                fp.dateof, 
                fp.flowstatus,
                fp.materialboxid,
                mb.name as materialboxname,
                fp.dateto, 
                fp.surgicalwarning, 
                fp.patientname
            from
                flowprocessing fp
                inner join areas a on ( a.id = fp.areasid )
                left join materialbox mb on ( mb.id = fp.materialboxid )
                inner join sterilizationtype st on ( st.id = fp.sterilizationtypeid )
            where convert(char(10),fp.dateof,126) = :dateof";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":dateof", $dateof, \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectDashStep(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            select
                --fp.id, 
                --fp.sterilizationtypeid, 
                st.name as sterilizationtypename,
                --fp.areasid, 
                --a.name as areasname,
                --fp.materialid, 
                --fp.clientid, 
                --fp.username, 
                fp.prioritylevel, 
                --fp.dateof, 
                --fp.materialboxid,
                mb.name as materialboxname,
                --fp.dateto, 
                fp.surgicalwarning, 
                fp.patientname, 
            from
                flowprocessing fp
                inner join areas a on ( a.id = fp.areasid )
                left join materialbox mb on ( mb.id = fp.materialboxid )
                inner join sterilizationtype st on ( st.id = fp.sterilizationtypeid )
            where fp.id = :id";

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

    public function selectCycle(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @equipmentid int = :equipmentid;

            select
                ec.id, 
                c.name, 
                c.duration,                 
                c.timetoopen,
                c.temperature,
                ec.equipmentid
            from
                equipmentcycle ec
                inner join cycle c on ( c.id = ec.cycleid )
            where ec.equipmentid = @equipmentid";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":equipmentid", $query, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectCharge(array $data) {
        $areasid = $data['areasid'];
        $equipmentid = $data['equipmentid'];
        $equipmentcycleid = $data['equipmentcycleid'];

        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @areasid int = :areasid,
                @equipmentid int = :equipmentid,
                @equipmentcycleid int = :equipmentcycleid;
            
            select distinct
                fpci.id,
                fpsa.flowprocessingstepid,
                fpci.flowprocessingchargeid,
                t.equipmentid,
                t.elementname,
                t.materialname
            from
                flowprocessingstep fps
                inner join flowprocessingstepaction fpsa on ( fpsa.flowprocessingstepid = fps.id )
                left join flowprocessingchargeitem fpci on ( fpci.flowprocessingstepid = fps.id )
                cross apply (
                    select
                        a.equipmentid,
                        a.elementname,
                        coalesce(ta.name,tb.name) as materialname
                    from
                        flowprocessingstep a
                        inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                        inner join equipmentcycle ec on ( ec.equipmentid = a.equipmentid and ec.id = @equipmentcycleid )
                        inner join materialcycle mc on ( mc.cycleid = ec.cycleid )
                        outer apply (
                            select
                                mb.name
                            from
                                materialbox mb
                            where mb.id = fp.materialboxid
                        ) ta
                        outer apply (
                            select top 1
                                ib.name
                            from
                                flowprocessingstepmaterial b
                                inner join itembase ib on ( ib.id = b.materialid )
                            where b.flowprocessingstepid = a.id
                        ) tb
                    where a.flowprocessingid = fps.flowprocessingid
                        and a.id = fps.target
                        and a.equipmentid = @equipmentid
                ) t
            where fps.areasid = @areasid
                and fpsa.isactive = 1
                and fpsa.flowstepaction = '001'
                and fps.stepflaglist like '%016%'
                and not exists (
                    select
                        a.id
                    from
                        flowprocessingchargeitem a
                        inner join flowprocessingcharge b on ( b.id = a.flowprocessingchargeid )
                    where a.flowprocessingstepid = fps.id
                        and a.chargestatus = '001'
                        and b.chargeflag = '001'
                )";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
            $pdo->bindValue(":equipmentid", $equipmentid, \PDO::PARAM_INT);
            $pdo->bindValue(":equipmentcycleid", $equipmentcycleid, \PDO::PARAM_INT);
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