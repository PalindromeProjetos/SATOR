<?php

namespace iSterilization\Cache;

use iSterilization\Model\armorymovementitem as Model;

class armorymovementitem extends \Smart\Data\Cache {

    public function selectItem(array $data) {
        $query = $data['query'];
        $start = isset($data['start']) ? $data['start'] : 0;
        $limit = isset($data['limit']) ? $data['limit'] : 10;
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @id int = :id;
                    
            select
                ami.*,
                fp.barcode,
                t.materialname,
                dbo.getEnum('regresstype','001') as regresstypedescription,
                dbo.getEnum('outputtype',ami.outputtype) as outputtypedescription,
                dbo.getEnum('armorylocal',ami.armorylocal) as armorylocaldescription,
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
                                order by mbt.targeorderby asc
                                for xml path ('')
                            ) ,1,1,''
                        )                
                )
            from
                armorymovementitem ami
                inner join flowprocessingstep fps on ( fps.id = ami.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
				cross apply (
					select 
						coalesce(ta.name,tb.name) as materialname
					from 
						flowprocessing a
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
				) t
            where ami.armorymovementid = @id";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":id", $query, \PDO::PARAM_INT);
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

}