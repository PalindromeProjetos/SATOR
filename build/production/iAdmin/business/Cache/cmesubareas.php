<?php

namespace iAdmin\Cache;

use iAdmin\Model\cmesubareas as Model;

class cmesubareas extends \Smart\Data\Cache {

    public function selectLike(array $data) {
        $p = $f = array();
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $params = json_decode($data['params']);
        $proxy = $this->getStore()->getProxy();

        // set params
        foreach ($params as $key => $value) {
            $p[] = "$value LIKE :$value";
        }

        $sql = "
            SELECT
                a.*,
                cmeareasname = ( SELECT name FROM areas WHERE id = sa.cmeareasid ),
                sa.cmeareasid
            FROM
                areas a
                inner join cmesubareas sa on ( sa.id = a.id )
            WHERE a.areastype = 'S'
              and ( " . implode(' OR ', $p) . " )
              and a.isactive = 1
            order by a.name";

        try {
            $pdo = $proxy->prepare($sql);

            $query = "%{$query}%";

            foreach ($params as $key => $value) {
                $pdo->bindValue(":$value", $query, \PDO::PARAM_STR);
            }

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

    public function selectCode(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            SELECT
                a.*,
                cmeareasname = ( SELECT name FROM areas WHERE id = sa.cmeareasid ),
                sa.isactive,
                sa.orderby
            FROM
                areas a
                inner join cmesubareas sa on ( sa.id = a.id )
            WHERE a.id = :id";

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