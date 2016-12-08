<?php

namespace iAdmin\Cache;

use iAdmin\Model\usersmenu as Model;

class usersmenu extends \Smart\Data\Cache {

    public function selectCode(array $data) {
        $menuid = $data["menuid"];
        $usersid = $data["usersid"];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            select
                um.id,
                :usersid as usersid,
                m.id as menuid,
                m.name
            from
                menu m
                left join usersmenu um on ( um.menuid = m.id and um.usersid = :id )
            where m.id = :menuid";

        try {

            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":id", $usersid, \PDO::PARAM_INT);
            $pdo->bindValue(":menuid", $menuid, \PDO::PARAM_INT);
            $pdo->bindValue(":usersid", $usersid, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectTree(array $data) {
        $module = $data["module"];
        $usersid = $data["usersid"];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            select
                mm.id,
                coalesce(mn.glyph,mm.glyph) as glyph,
                mn.router,
                mm.parentid,
                coalesce(mn.name,mm.name) as text,
                :usersid as usersid,
                um.id as usersmenuid,
                mn.id as menuid,
                mm.orderby,
                mn.menutype,
                case coalesce(len(mn.router),0) when 0 then 0 else 1 end as leaf
            from
                modulemenu mm
                inner join module md on ( md.id = mm.moduleid )
                left join menu mn on ( mn.id = mm.menuid )
                left join usersmenu um on ( um.menuid = mn.id and um.usersid = :id )
            where md.name = :module
            order by mm.orderby, mm.id, mm.parentid;";

        try {

            $pdo = $proxy->prepare($sql);
            $pdo->bindValue(":id", $usersid, \PDO::PARAM_INT);
            $pdo->bindValue(":module", $module, \PDO::PARAM_STR);
            $pdo->bindValue(":usersid", $usersid, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            $root = self::buildNode($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
            return self::getResultToJson();
        }

        return self::objectToJson($root);
    }

}