<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingstepaction as Model;

class flowprocessingstepaction extends \Smart\Data\Cache {

    public function actionTask(array $data) {
        $proxy = $this->getStore()->getProxy();

        $sql = "
			select
				count(*) as rows
			from
				flowprocessingstepaction
			where flowstepaction in ('002','004') and isactive = 1";

        try {
            $rows = $proxy->query($sql)->fetchAll();

            $list = [];
            
//            if(intval($rows[0]['rows']) != 0 ) {
                $list[0]['taskrows'] = str_pad($rows[0]['rows'], 2, '0', STR_PAD_LEFT);
                $list[0]['taskcode'] = '001';
                $list[0]['taskname'] = 'Liberar Processos';
//            }

            $list[1]['taskrows'] = '';
            $list[1]['taskcode'] = '002';
            $list[1]['taskname'] = 'Mensagens de Leitura';

//            $list[2]['taskrows'] = '';
//            $list[2]['taskcode'] = '003';
//            $list[2]['taskname'] = 'Registrar Ciclo';
//
//            $list[3]['taskrows'] = '';
//            $list[3]['taskcode'] = '004';
//            $list[3]['taskname'] = 'Finalizar Ciclo';

            self::_setRows($list);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

	public function actionStep(array $data) {
		$proxy = $this->getStore()->getProxy();
		
		$sql = "
			select
				fpsa.id,
				fpsa.flowprocessingstepid,
				fpsa.flowstepaction,
				fpsa.isactive,
				fpsa.dateof,
				c.name as clientname,
				fps.elementname,
				fpsa.authorizedby,
				substring(convert(varchar(16), fp.dateof, 121),9,8) as timeof,
				fp.barcode,
				o.originplace,
				t.targetplace
			from
				flowprocessingstepaction fpsa
				inner join flowprocessingstep fps on ( fps.id = fpsa.flowprocessingstepid )
				inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
				inner join client c on ( c.id = fp.clientid )
				outer apply (
					select
						a.elementname as originplace
					from
						flowprocessingstep a
					where a.flowprocessingid = fps.flowprocessingid
						and a.id = fps.source
				) o
				outer apply (
					select
						a.elementname as targetplace
					from
						flowprocessingstep a
					where a.flowprocessingid = fps.flowprocessingid
						and a.id = fps.target
				) t
			where fpsa.flowstepaction in ('002','004')
				and fpsa.isactive = 1";

		try {
            $rows = $proxy->query($sql)->fetchAll();

			self::_setRows($rows);

		} catch ( \PDOException $e ) {
			self::_setSuccess(false);
			self::_setText($e->getMessage());
		}

		return self::getResultToJson();

	}

    public function selectCode(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @flowprocessingstepid int = :flowprocessingstepid;
                
            select
                fps.username,
                fps.elementname,
                fpsa.flowstepaction,
                fpsa.flowprocessingstepid,
                dbo.getEnum('flowstepaction',fpsa.flowstepaction) as flowstepactiondescription
            from 
                flowprocessingstepaction fpsa
                inner join flowprocessingstep fps on ( fps.id = fpsa.flowprocessingstepid )
            where fpsa.flowprocessingstepid = @flowprocessingstepid";

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

    public function selectArea(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @areasid int = :areasid;

            select
                fpsa.id,
                'P' as steptype,
                fp.dateof,
                fp.barcode,
                fps.username,
                fps.stepflaglist,
                coalesce(s.flowstepaction,fpsa.flowstepaction) as flowstepaction,
                st.name as sterilizationtypename,
                st.version,
				fps.flowprocessingid,
                fpsa.flowprocessingstepid,
				fpsa.id as flowprocessingstepactionid,
                substring(convert(varchar(16), fp.dateof, 121),9,8) as timeof,
                m.materialname,
				o.originplace,
				t.targetplace,
                items = (
                    select
						dbo.getLeftPad(3,'0',count(*))
					from
						flowprocessingstepmaterial
					where flowprocessingstepid = fps.id
                )
            from 
                flowprocessingstepaction fpsa
                inner join flowprocessingstep fps on ( fps.id = fpsa.flowprocessingstepid and fps.areasid = @areasid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                inner join sterilizationtype st on ( st.id = fp.sterilizationtypeid )
				outer apply (
					select
						a.elementname as originplace
					from
						flowprocessingstep a
					where a.flowprocessingid = fps.flowprocessingid
					  and a.id = fps.source
				) o
				outer apply (
					select
						a.elementname as targetplace
					from
						flowprocessingstep a
					where a.flowprocessingid = fps.flowprocessingid
					  and a.id = fps.target
				) t
				outer apply (
					select
						a.flowstepaction
					from
						flowprocessingstepaction a
					where a.flowprocessingstepid = fps.id
					  and a.flowstepaction = '002'
					  and a.isactive = 1
				) s
                cross apply (
                    select
						coalesce(ta.name,tb.name) as materialname
                    from
						flowprocessing a
                        inner join flowprocessingstep b on ( b.flowprocessingid = a.id and b.id = fps.id )
                        outer apply (
                            select
                                mb.name
                            from
                                materialbox mb
                            where mb.id = a.materialboxid
                        ) ta
                        outer apply (
							select
								ib.name
							from
								itembase ib
								inner join material m on ( m.id = ib.id )
							where ib.id = fp.materialid
                        ) tb
                    where a.id = fp.id
                ) m
            where fpsa.isactive = 1
              and fp.flowstatus = 'I'
			  and fpsa.flowstepaction in ('001','004')
              and not exists (
                    select
                        a.id
                    from
                        flowprocessingchargeitem a
                        inner join flowprocessingcharge b on ( b.id = a.flowprocessingchargeid )
                    where a.flowprocessingstepid = fps.id
                      and b.chargeflag in ('001','002','003','005')
              )

            union all

			select
                fpc.id,
                'C' as steptype,
                fpc.chargedate as dateof,
                fpc.barcode,
                fpc.cyclestartuser as username,
                null as stepflaglist,
                fpc.chargeflag as flowstepaction,
                c.name as sterilizationtypename,
                null as version,
                null as flowprocessingid,
                null as flowprocessingstepid,
                null as flowprocessingstepactionid,
                substring(convert(varchar(16), fpc.chargedate, 121),9,8) as timeof,
                ('T.' + convert(varchar,fpc.temperature) + 'º D.' + convert(varchar,fpc.duration) + 'm A.' + convert(varchar,fpc.timetoopen) +'m' ) as materialname,
				fps.elementname as originplace,
                ta.targetplace,
                items = (
                    select
                        dbo.getLeftPad(3,'0',count(fpci.id))
                    from
                        flowprocessingchargeitem fpci
                    where fpci.flowprocessingchargeid = fpc.id
                )
            from
                flowprocessingcharge fpc
				inner join equipmentcycle ec on ( ec.id = fpc.equipmentcycleid )
				inner join cycle c on ( c.id = ec.cycleid )
				inner join flowprocessingstep fps on ( 
						fps.equipmentid = ec.equipmentid
					and fps.target = fpc.areasid
				)
				outer apply (
					select
						b.elementname as targetplace
					from
						flowprocessingstep b
					where b.id = fps.target
				) ta
            where fpc.chargeflag = '001'
              and fpc.areasid = @areasid

			union all

			select distinct
				ta.id,
				ta.steptype,
				ta.dateof,
				ta.barcode,
				ta.username,
				null as stepflaglist,
				ta.flowstepaction,
				ta.sterilizationtypename,
				null as version,
				null as flowprocessingid,
				null as flowprocessingstepid,
				null as flowprocessingstepactionid,
				ta.timeof,
				ta.materialname,
				ta.originplace,
				ta.targetplace,
				ta.items
			from
				flowprocessingstep fps
				inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
				cross apply (
					select
						fpc.id,
						'T' as steptype,
						fpc.cyclestart as dateof,
						fpc.barcode,
						fpc.cyclestartuser as username,
						fpc.chargeflag as flowstepaction,
						c.name as sterilizationtypename,
						substring(convert(varchar(16), fpc.cyclestart, 121),9,8) as timeof,
						('T.' + convert(varchar,fpc.temperature) + 'º D.' + convert(varchar,fpc.duration) + 'm A.' + convert(varchar,fpc.timetoopen) +'m' ) as materialname,
						a.elementname as originplace,
						i.targetplace,
						items = (
							select
								dbo.getLeftPad(3,'0',count(fpci.id))
							from
								flowprocessingchargeitem fpci
							where fpci.flowprocessingchargeid = fpc.id
						)
					from
						flowprocessingstep a
						inner join flowprocessingchargeitem fpci on ( fpci.flowprocessingstepid = a.source )
						inner join flowprocessingcharge fpc on ( fpc.id = fpci.flowprocessingchargeid )
						inner join equipmentcycle ec on ( ec.id = fpc.equipmentcycleid and ec.equipmentid = a.equipmentid)
						inner join cycle c on ( c.id = ec.cycleid )
						outer apply (
							select
								b.elementname as targetplace
							from
								flowprocessingstep b
							where b.source = a.target
						) i
					where a.target = fps.id
					  and fpc.chargeflag = '002'
				) ta
			where fps.areasid = @areasid
			  and fp.flowstatus = 'I'

			union all

            select
                fpc.id,
                'C' as steptype,
                fpc.chargedate as dateof,
                fpc.barcode,
                fpc.chargeuser as username,
                null as stepflaglist,
                fpc.chargeflag as flowstepaction,
                'Fluxos' as sterilizationtypename,	
                null as version,
                null as flowprocessingid,
                null as flowprocessingstepid,
                null as flowprocessingstepactionid,
                substring(convert(varchar(16), fpc.chargedate, 121),9,8) as timeof,
                'Lote Avulso' as materialname,
                'Diversos' as originplace,
                fpc.chargeuser as targetplace,
                items = (
                    select
                        dbo.getLeftPad(3,'0',count(fpci.id))
                    from
                        flowprocessingchargeitem fpci
                    where fpci.flowprocessingchargeid = fpc.id
                )
            from
                flowprocessingcharge fpc
            where fpc.chargeflag = '005'
              and fpc.areasid = @areasid

            order by 4, 2, 3 desc";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":areasid", $query, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);
            self::_setPage(0,500);
            self::_setSuccess(count($rows) != 0);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectStep(array $data) {
        $query = $data['query'];
		$proxy = $this->getStore()->getProxy();
		
        $sql = "
            declare
                @actionid int = :actionid;
                
            select
                fps.id,
                fps.username,
                fps.datestart,
                fps.elementname,
                fps.elementtype,
                fps.stepflaglist,
                fps.stepsettings,
                fps.steppriority,
                a.name as areasname,
                c.name as clientname,
                ib.name as equipmentname,
                st.name as sterilizationtypename,
                dbo.getEnum('prioritylevel',fp.prioritylevel) as priorityleveldescription,
                fps.flowstepstatus
            from
                flowprocessingstepaction fpsa
                inner join flowprocessingstep fps on ( fps.id = fpsa.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                left join areas a on ( a.id = fps.areasid )
                left join itembase ib on ( ib.id = fps.equipmentid )
                inner join sterilizationtype st on ( st.id = fp.sterilizationtypeid )
                inner join client c on ( c.id = fp.clientid )
            where fpsa.id = @actionid";

        try {
			$pdo = $proxy->prepare($sql);
            $pdo->bindValue(":actionid", $query, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectTask(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @id int = :id;

            select
                fps.id,
                'P' as steptype,
                fps.stepflaglist,
                fps.username,
                fpsa.flowstepaction,
                fpsa.flowprocessingstepid
            from
                flowprocessing fp
                inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                inner join flowprocessingstepaction fpsa on ( fpsa.flowprocessingstepid = fps.id and fpsa.flowstepaction = '001' )
            where fp.id = @id";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":id", $query, \PDO::PARAM_INT);
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

    public function selectTaskArea(array $data) {
        $barcode = $data['barcode'];
        $areasid = $data['areasid'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @areasid int = :areasid,
                @barcode varchar(20) = :barcode;
     
            select distinct
                fps.id,
                @barcode as barcode,
                'P' as steptype,
                'B' as donetype,
                fps.stepflaglist,
                fps.username,
                fpsa.flowstepaction,
                fpsa.flowprocessingstepid
            from
                flowprocessing fp
                inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id and fps.areasid = @areasid )
                inner join flowprocessingstepaction fpsa on ( fpsa.flowprocessingstepid = fps.id and fpsa.flowstepaction = '001' and fpsa.isactive = 1 )
                inner join flowprocessingstepmaterial fpsm on ( fpsm.flowprocessingstepid = fps.id )
                inner join itembase ib on ( ib.id = fpsm.materialid )
            where ( ib.barcode = @barcode
                 or fp.barcode = @barcode )";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
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