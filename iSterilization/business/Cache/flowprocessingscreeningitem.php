<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingscreeningitem as Model;

class flowprocessingscreeningitem extends \Smart\Data\Cache {

    public function selectItem(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @flowprocessingscreeningid int = :flowprocessingscreeningid;
            
            select
                fpsi.*,
                ib.barcode,
                ib.name as materialname,
                c.name as clientname,
                fpsi.sterilizationtypeid,
                st.name as sterilizationtypename,
                fpsi.dataflowstep,
                colorschema = (
                    select stuff
                        (
                            (
                                select
                                    ',#' + tc.colorschema + '|#' + tc.colorstripe
                                from
                                    materialboxtarge mbt
                                    inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                where mbt.materialboxid = fpsi.materialboxid
                                order by mbt.targeorderby desc
                                for xml path ('')
                            ) ,1,1,''
                        )                
                )
            from
                flowprocessingscreeningitem fpsi
                inner join itembase ib on ( ib.id = fpsi.materialid )
                inner join armorymovementoutput amo on ( amo.id = fpsi.armorymovementoutputid )
                inner join client c on ( c.id = amo.clientid )
                left join sterilizationtype st on ( st.id = fpsi.sterilizationtypeid )
            where fpsi.flowprocessingscreeningid = @flowprocessingscreeningid
            order by fpsi.materialboxid";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":flowprocessingscreeningid", $query, \PDO::PARAM_INT);
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