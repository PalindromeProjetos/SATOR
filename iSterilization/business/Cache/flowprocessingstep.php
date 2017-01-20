<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingstep as Model;

class flowprocessingstep extends \Smart\Data\Cache {

    public function selectCode(array $data) {
        $query = $data['query'];

        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @flowprocessingid int = :flowprocessingid;
                
            select
                fps.id, 
                fps.flowprocessingid, 
                fps.steplevel, 
                fps.elementtype, 
                fps.elementname, 
                fps.stepflaglist, 
                fps.stepsettings, 
                fps.areasid, 
                fps.equipmentid, 
                fps.steppriority, 
                fps.source, 
                fps.target,
                fps.flowstepstatus,
                dbo.getEnum('flowstepstatus',fps.flowstepstatus) as flowstepstatusdescription
            from
                flowprocessingstep fps
            where fps.flowprocessingid = @flowprocessingid
            order by fps.steplevel, fps.steppriority";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":flowprocessingid", $query, \PDO::PARAM_INT);

            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

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
                @id int = :id;
                
            select
                fps.id,
                fp.barcode,
                fp.version,
                fps.username,
                fps.datestart,
                fps.datefinal,
                fps.stepchoice,
                fps.exceptionby,
                fps.exceptiondo,   
                fps.elementname,
                fps.elementtype,
                fps.stepflaglist,
                fps.stepsettings,
                fps.steppriority,
                fps.flowprocessingid,
                a.name as areasname,
                ib.name as equipmentname,
                st.name as sterilizationtypename,
                c.name as clientname,
                fp.materialboxid,
                mb.name as materialboxname,
                dbo.getEnum('prioritylevel',fp.prioritylevel) as priorityleveldescription,
                fps.flowstepstatus,
                fps.steplevel, 
                fps.areasid, 
                fps.equipmentid,                  
                fps.source, 
                fps.target,
                fps.useppe,
                fps.flowstepstatus,
                fpsa.id as flowprocessingstepactionid,
                dbo.getEnum('flowstepstatus',fps.flowstepstatus) as flowstepstatusdescription,                               
                colorschema = (
                    select stuff
                        (
                            (
                                select
                                    ',#' + tc.colorschema + '|#' + tc.colorstripe
                                from
                                    materialboxtarge mbt
                                    inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                where mbt.materialboxid = fp.materialboxid
                                order by mbt.targeorderby
                                for xml path ('')
                            ) ,1,1,''
                        )                
                ),
				o.originplace
            from
                flowprocessingstepaction fpsa
                inner join flowprocessingstep fps on ( fps.id = fpsa.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                left join areas a on ( a.id = fps.areasid )
                left join itembase ib on ( ib.id = fps.equipmentid )
                left join materialbox mb on ( mb.id = fp.materialboxid )
                inner join sterilizationtype st on ( st.id = fp.sterilizationtypeid )
                inner join client c on ( c.id = fp.clientid )
				outer apply (
					select
						a.elementname as originplace
					from
						flowprocessingstep a
					where a.flowprocessingid = fps.flowprocessingid
					  and a.id = fps.source
				) o
            where fps.id = @id";

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