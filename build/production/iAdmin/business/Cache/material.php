<?php

namespace iAdmin\Cache;

use Smart\Utils\Session;
use iAdmin\Model\material as Model;

class material extends \Smart\Data\Cache {

    public function selectType(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $filtertype = $data['filtertype'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @name varchar(60) = :name,
                @filtertype int = :filtertype;
	
	        if(@filtertype = 1)
	        begin
	            select
	                id, name, @filtertype as filtertype
	            from
	                materialbox
	            where name COLLATE Latin1_General_CI_AI LIKE @name
	            order by name
	        end
	
	        if(@filtertype = 2)
	        begin
	            select
	                id, name, @filtertype as filtertype
	            from
	                proprietary
	            where name COLLATE Latin1_General_CI_AI LIKE @name
	            order by name
	        end";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);
            $pdo->bindValue(":filtertype", $filtertype, \PDO::PARAM_INT);

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

    public function selectLike(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $proxy = $this->getStore()->getProxy();
        $total = isset($data['totalresults']) ? $data['totalresults'] : 10;

        $sql = "
            declare
                @name varchar(60) = :name,
                @barcode varchar(20) = :barcode;
	
            SELECT top $total  
                ib.name,
                ib.description,
                ib.barcode,
                ib.itembasetype,
                ib.proprietaryid,
                ib.manufacturerid,
                ib.dateacquisition,
                ib.patrimonialcode,
                ib.registrationanvisa,
                ib.isactive,
                ib.itemgroup,
                dbo.getEnum('itemsize',m.itemsize) as itemsizedescription,
                dbo.getEnum('itemgroup',ib.itemgroup) as itemgroupdescription,
                a.materialboxname,
                a.colorschema,
                m.*,
                dbo.getEnum('materialstatus',m.materialstatus) as materialstatusdescription,
                pk.name as packingname,
                pt.name as proprietaryname,
                mf.name as manufacturername
            FROM
                itembase ib
                inner join material m on ( m.id = ib.id )
                inner join packing pk on ( pk.id = m.packingid )
                inner join proprietary pt on ( pt.id = ib.proprietaryid )
                inner join manufacturer mf on ( mf.id = ib.manufacturerid )
                outer apply (
                    SELECT
                        mb.name as materialboxname,
                        colorschema = (
                            select stuff
                                (
                                    (
                                        select
                                            ',#' + tc.colorschema + '|#' + tc.colorstripe
                                        from
                                            materialboxtarge mbt
                                            inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                        where mbt.materialboxid = mb.id
                                        order by mbt.targeorderby asc
                                        for xml path ('')
                                    ) ,1,1,''
                                )                
                        )
                    FROM
                        materialbox mb
                    inner join materialboxitem mbi on ( 
                                    mbi.materialboxid = mb.id
                                AND mbi.materialid = m.id )
                    inner join itembase ibt on ( ibt.id = mbi.materialid )
                ) a
            WHERE ib.barcode = @barcode
               OR ib.name COLLATE Latin1_General_CI_AI LIKE @name";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
            $pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);

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
            declare
                @id int = :id;

            SELECT
                ib.name,
                ib.description,
                ib.barcode,
                ib.itembasetype,
                coalesce(ib.resultfield,'{}') as resultfield,
                ib.proprietaryid,
                ib.manufacturerid,
                ib.dateacquisition,
                ib.patrimonialcode,
                ib.registrationanvisa,
                ib.isactive,
                ib.itemgroup,
                dbo.getEnum('itemsize',m.itemsize) as itemsizedescription,
                dbo.getEnum('itemgroup',ib.itemgroup) as itemgroupdescription,
                dbo.binary2base64(ib.filedata) as filedata,
                ib.fileinfo,
                materialboxname = (
                  SELECT TOP 1
                    mb.name
                  FROM
                    materialbox mb
                    inner join materialboxitem mbi on ( 
                                            mbi.materialboxid = mb.id
                                        AND mbi.materialid = m.id
                                        AND mbi.boxitemstatus = 'A' )
                    inner join itembase ibt on ( ibt.id = mbi.materialid )
                ),
                m.*,
                dbo.getEnum('armorylocal',m.armorylocal) as armorylocaldescription,
                dbo.getEnum('materialstatus',m.materialstatus) as materialstatusdescription,
                pk.name as packingname,
                pt.name as proprietaryname,
                mf.name as manufacturername
            FROM
                itembase ib
                inner join material m on ( m.id = ib.id )
                inner join packing pk on ( pk.id = m.packingid )
                inner join proprietary pt on ( pt.id = ib.proprietaryid )
                inner join manufacturer mf on ( mf.id = ib.manufacturerid )
            WHERE ib.id = @id";

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

    public function insertCopy(array $data) {
        $id = $data['id'];
        $username = $this->stash->username;
        $proxy = $this->getStore()->getProxy();


        $sql = "
            SET XACT_ABORT ON
            SET NOCOUNT ON
            SET ANSI_NULLS ON
            SET ANSI_WARNINGS ON
            
            declare
                @nw int,
                @id int = {$id},
                @barcode varchar(20), 
                @error_code int = 0, 
                @error_text nvarchar(200),
                @username varchar(80) = '{$username}';
            
            BEGIN TRY
            
                BEGIN TRAN setCloneItem;
            
                    insert into itembase
                        (
                            name, barcode, description, resultfield, proprietaryid,
                            manufacturerid, dateacquisition, patrimonialcode,
                            registrationanvisa, itembasetype, filedata, fileinfo, isactive, itemgroup
                        )
                    select
                        '(clone) ' + ib.name, 
                        '(clone)' as barcode,
                        ib.description, 
                        ib.resultfield, 
                        ib.proprietaryid, 
                        ib.manufacturerid, 
                        ib.dateacquisition, 
                        ib.patrimonialcode, 
                        ib.registrationanvisa, 
                        ib.itembasetype, 
                        ib.filedata, 
                        ib.fileinfo, 
                        ib.isactive, 
                        ib.itemgroup
                    from
                        itembase ib
                    where ib.id = @id;
            
                    set @nw = ( select @@identity );
            
                    insert into material
                        (
                            id, materialstatus, packingid, numberproceedings, 
                            datedisposal, isconsigned, itemsize, itemlength, 
                            itemcubiclength, cloned, clonedate, cloneusername
                        )
                    select
                        @nw as id,
                        m.materialstatus, 
                        m.packingid, 
                        m.numberproceedings, 
                        m.datedisposal, 
                        m.isconsigned, 
                        m.itemsize, 
                        m.itemlength, 
                        m.itemcubiclength, 
                        1 as cloned, 
                        getdate() as clonedate, 
                        @username as cloneusername
                    from
                        material m
                    where m.id = @id;
            
                    set @barcode = 'C' + dbo.getLeftPad(7,'0',@nw);
            
                    update materialbox set barcode = @barcode, clonedid = @id where id= @nw;
            
                    insert into itembaseservicetype ( itembaseid, servicetype )
                    select
                        @nw as itembaseid, servicetype
                    from
                        itembaseservicetype ist
                    where ist.itembaseid = @id;
            
                    insert into materialcycle ( materialid, cycleid )
                    select
                        @nw as materialid, cycleid
                    from
                        materialcycle mc
                    where mc.materialid = @id;
            
                    insert into materialtypeflow ( materialid, sterilizationtypeid, prioritylevel )
                    select
                        @nw as materialid, sterilizationtypeid, prioritylevel
                    from
                        materialtypeflow mtf
                    where mtf.materialid = @id;
            
                COMMIT TRAN setCloneItem;
            
                set @error_code = 0;
                set @error_text = 'Atualizacoes realizadas com sucesso!';
            
            END TRY
            
            BEGIN CATCH
                ROLLBACK TRAN setCloneItem;
                set @error_code = error_number();
                set @error_text = ' # ' +error_message() + ', ' + cast(error_line() as varchar);
            END CATCH
            
            select @nw as id, @error_code as error_code, @error_text as error_text;";

        try {
            $proxy->beginTransaction();
            $rows = $proxy->query($sql)->fetchAll();

            $message = $rows[0]['error_text'];
            $success = intval($rows[0]['error_code']) == 0;

            if($success == true) {
                $proxy->commit();
                $data['query'] = $rows[0]['id'];
                $result = $this->selectCode($data);
                return $result;
            }

            self::_setRows($rows);
            self::_setText($message);
            self::_setSuccess($success);

            if($success == false) {
                throw new \PDOException($rows[0]['error_text']);
            }
        } catch ( \PDOException $e ) {
            $proxy->rollBack();
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectBox(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $proxy = $this->getStore()->getProxy();
        $materialboxid = isset($data['filterid']) ? $data['filterid'] : null;
        $sql = "
            declare
                @name varchar(60) = :name,
                @barcode varchar(20) = :barcode,
                @materialboxid int = :materialboxid;

            SELECT
                ib.name,
                ib.description,
                ib.barcode,
                ib.itembasetype,
                ib.proprietaryid,
                ib.manufacturerid,
                ib.dateacquisition,
                ib.patrimonialcode,
                ib.registrationanvisa,
                ib.isactive,
                ib.itemgroup,
                dbo.getEnum('itemsize',m.itemsize) as itemsizedescription,
                dbo.getEnum('itemgroup',ib.itemgroup) as itemgroupdescription,
                a.materialboxname,
                a.colorschema,
                m.*,
                --ms.name as materialstatusname,
                dbo.getEnum('materialstatus',m.materialstatus) as materialstatusdescription,
                pk.name as packingname,
                pt.name as proprietaryname,
                mf.name as manufacturername
            FROM
                itembase ib
                inner join material m on ( m.id = ib.id )
                --inner join materialstatus ms on ( ms.id = m.materialstatusid )
                inner join packing pk on ( pk.id = m.packingid )
                inner join proprietary pt on ( pt.id = ib.proprietaryid )
                inner join manufacturer mf on ( mf.id = ib.manufacturerid )
                inner join materialboxitem mbi on ( mbi.materialid = m.id and mbi.materialboxid = @materialboxid )
                outer apply (
                    SELECT
                        mb.name as materialboxname,
                        colorschema = (
                            select stuff
                                (
                                    (
                                        select
                                            ',#' + tc.colorschema + '|#' + tc.colorstripe
                                        from
                                            materialboxtarge mbt
                                            inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                        where mbt.materialboxid = mb.id
                                        order by mbt.targeorderby asc
                                        for xml path ('')
                                    ) ,1,1,''
                                )                
                        )
                    FROM
                        materialbox mb
                    inner join materialboxitem mbi on ( 
                                    mbi.materialboxid = mb.id
                                AND mbi.materialid = m.id )
                    inner join itembase ibt on ( ibt.id = mbi.materialid )
                ) a
            WHERE ib.barcode = @barcode
               OR ib.name COLLATE Latin1_General_CI_AI LIKE @name;";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);
            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
            $pdo->bindValue(":materialboxid", $materialboxid, \PDO::PARAM_INT);

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

    public function selectProprietary(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $proxy = $this->getStore()->getProxy();
        $proprietaryid = isset($data['filterid']) ? $data['filterid'] : null;
        $sql = "
            declare
                @name varchar(60) = :name,
                @barcode varchar(20) = :barcode,
                @proprietaryid int = :proprietaryid;

            SELECT
                ib.name,
                ib.description,
                ib.barcode,
                ib.itembasetype,
                ib.proprietaryid,
                ib.manufacturerid,
                ib.dateacquisition,
                ib.patrimonialcode,
                ib.registrationanvisa,
                ib.isactive,
                ib.itemgroup,
                dbo.getEnum('itemsize',m.itemsize) as itemsizedescription,
                dbo.getEnum('itemgroup',ib.itemgroup) as itemgroupdescription,
                a.materialboxname,
                a.colorschema,
                m.*,
                --ms.name as materialstatusname,
                dbo.getEnum('materialstatus',m.materialstatus) as materialstatusdescription,
                pk.name as packingname,
                pt.name as proprietaryname,
                mf.name as manufacturername
            FROM
                itembase ib
                inner join material m on ( m.id = ib.id )
                --inner join materialstatus ms on ( ms.id = m.materialstatusid )
                inner join packing pk on ( pk.id = m.packingid )
                inner join proprietary pt on ( pt.id = ib.proprietaryid and ib.proprietaryid = @proprietaryid )
                inner join manufacturer mf on ( mf.id = ib.manufacturerid )
                left join materialboxitem mbi on ( mbi.materialid = m.id )
                outer apply (
                    SELECT
                        mb.name as materialboxname,
                        colorschema = (
                            select stuff
                                (
                                    (
                                        select
                                            ',#' + tc.colorschema + '|#' + tc.colorstripe
                                        from
                                            materialboxtarge mbt
                                            inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                        where mbt.materialboxid = mb.id
                                        order by mbt.targeorderby asc
                                        for xml path ('')
                                    ) ,1,1,''
                                )                
                        )
                    FROM
                        materialbox mb
                    inner join materialboxitem mbi on ( 
                                    mbi.materialboxid = mb.id
                                AND mbi.materialid = m.id )
                    inner join itembase ibt on ( ibt.id = mbi.materialid )
                ) a
            WHERE ib.barcode = @barcode
               OR ib.name COLLATE Latin1_General_CI_AI LIKE @name;";

        try {
            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);
            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
            $pdo->bindValue(":proprietaryid", $proprietaryid, \PDO::PARAM_INT);

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