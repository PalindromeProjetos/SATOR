<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingchargeitem as Model;

class flowprocessingchargeitem extends \Smart\Data\Cache {

    public function selectItem(array $data) {
        $query = $data['query'];

        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @flowprocessingchargeid int = :id;
                            
            select
                fpci.*,
                fp.barcode,
                coalesce(ta.name,tb.name) as materialname,
				countitems = ( 
					select
						count(fpsm.id)
					from
						flowprocessingstepmaterial fpsm
					where fpsm.flowprocessingstepid = fps.id
				)                
            from
                flowprocessingchargeitem fpci
                inner join flowprocessingstep fps on ( fps.id = fpci.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                outer apply (
                    select
                        mb.name
                    from
                        materialbox mb
                    where mb.id = fp.materialboxid
                ) ta
                outer apply (
                    select
						ib.name
                    from
                        itembase ib
                    where ib.id = fp.materialid
                ) tb
            where fpci.flowprocessingchargeid = @flowprocessingchargeid;";

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