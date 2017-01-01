<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingscreeningbox as Model;

class flowprocessingscreeningbox extends \Smart\Data\Cache {

    public function getBoxCount(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @materialboxid int = :materialboxid;
            
            select
                count(*) as items,
				a.loads
            from
                materialboxitem
				outer apply (
					select
						count(*) as loads
					from
						flowprocessingscreeningbox
					where materialboxid = @materialboxid
				) a
            where materialboxid = @materialboxid
			group by a.loads;";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":materialboxid", $query, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows[0]);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function getBoxItems(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @materialboxid int = :materialboxid;
            
            select
				a.id,
                count(*) as items
            from
                flowprocessingscreeningitem fpsi
				outer apply (
					select
						id
					from
						flowprocessingscreeningbox
					where materialboxid = @materialboxid
				) a
            where materialboxid = @materialboxid
			group by a.id;";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":materialboxid", $query, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows[0]);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectItem(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @flowprocessingscreeningid int = :flowprocessingscreeningid;
            
            select
                fpsb.*,
                mb.barcode,
                mb.name as materialname,
                fpsb.sterilizationtypeid,
                st.name as sterilizationtypename,
                colorschema = (
                    select stuff
                        (
                            (
                                select
                                    ',#' + tc.colorschema + '|#' + tc.colorstripe
                                from
                                    materialboxtarge mbt
                                    inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                where mbt.materialboxid = fpsb.materialboxid
                                order by mbt.targeorderby desc
                                for xml path ('')
                            ) ,1,1,''
                        )                
                ),
                loads = ( select count(*) from flowprocessingscreeningitem where materialboxid = fpsb.materialboxid )
            from
                flowprocessingscreeningbox fpsb
                inner join materialbox mb on ( mb.id = fpsb.materialboxid )
                inner join sterilizationtype st on ( st.id = fpsb.sterilizationtypeid )
            where fpsb.flowprocessingscreeningid = @flowprocessingscreeningid;";

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