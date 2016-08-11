<?php

namespace iAdmin\Cache;

use iAdmin\Model\materialbox as Model;

class materialbox extends \Smart\Data\Cache {

    public function selectLike(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
			select top $limit
			  mb.*,
			  dbo.getEnum('statusbox',mb.statusbox) as statusboxdescription,
			  materialboxitems = (
			    SELECT
			      COUNT(mbi.id)
			    FROM
			      materialboxitem mbi
			    WHERE mbi.materialboxid = mb.id
			      AND mbi.boxitemstatus = 'A'
			  )
			from
				materialbox mb
			where mb.name like :name";

        try {
            $query = "%{$query}%";

            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":name", $query, \PDO::PARAM_STR);

            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        self::_setPage($start, $limit);
        return self::getResultToJson();
    }

}