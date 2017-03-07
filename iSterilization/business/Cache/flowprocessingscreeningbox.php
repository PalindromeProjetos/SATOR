<?php

namespace iSterilization\Cache;

use iSterilization\Model\flowprocessingscreeningbox as Model;

class flowprocessingscreeningbox extends \Smart\Data\Cache {

    public function getBoxCount(array $data) {
        $id = $data['id'];
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @id int = :id,
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
					  and flowprocessingscreeningid = @id
				) a
            where materialboxid = @materialboxid
			group by a.loads;";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":id", $id, \PDO::PARAM_INT);
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
        $id = $data['id'];
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @id int = :id,
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
					  and flowprocessingscreeningid = @id
				) a
            where fpsi.materialboxid = @materialboxid
              and fpsi.flowprocessingscreeningid = @id
			group by a.id;";

        try {
            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":id", $id, \PDO::PARAM_INT);
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
                c.name as clientname,
                mb.barcode,
                mb.name as materialname,
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
                loads = ( select count(*) from flowprocessingscreeningitem where materialboxid = fpsb.materialboxid and flowprocessingscreeningid = fpsb.flowprocessingscreeningid )
            from
                flowprocessingscreeningbox fpsb
                left join client c on ( c.id = fpsb.clientid )
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
	
	public function selectForProcessing(array $data) {
		$query = $data['query'];
		$proxy = $this->getStore()->getProxy();

		$sql = "
            declare
                @flowprocessingscreeningid int = :flowprocessingscreeningid;
            
            select
                fpsb.*,
				c.clienttype,
				amo.clientid,
				amo.patientname,
				amo.surgicalwarning,
                loads = ( select count(*) from flowprocessingscreeningitem where materialboxid = fpsb.materialboxid and flowprocessingscreeningid = fpsb.flowprocessingscreeningid )
            from
                flowprocessingscreeningbox fpsb
                inner join flowprocessingscreeningitem fpsi on ( 
							fpsb.materialid = fpsi.materialid 
						and fpsb.materialboxid = fpsi.materialboxid
						and fpsb.flowprocessingscreeningid = fpsi.flowprocessingscreeningid )
                inner join armorymovementoutput amo on ( amo.id = fpsi.armorymovementoutputid )
                inner join client c on ( c.id = amo.clientid )
            where fpsb.flowprocessingscreeningid = @flowprocessingscreeningid
			order by fpsb.id;";

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