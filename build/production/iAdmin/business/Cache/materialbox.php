<?php

namespace iAdmin\Cache;

use Smart\Utils\Session;
use iAdmin\Model\materialbox as Model;

class materialbox extends \Smart\Data\Cache {

    public function selectItem(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @id int = :id;
            
            select
                mb.id, 
                ib.name, 
                mb.barcode, 
                mb.itemsize
                dbo.getEnum('itemsize',mb.itemsize) as itemsizedescription,
                mb.statusbox, 
                dbo.getEnum('statusbox',mb.statusbox) as statusboxdescription
            from
                materialbox mb
                inner join itembase ib on ( ib.id = mb.materialid )
            where ib.id = @id";

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
    
    public function selectCode(array $data) {
        $query = $data['query'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @id int = :id;
            
            select
                mb.id, 
                mb.name, 
                mb.barcode, 
                mb.restriction, 
                mb.itemsize, 
                dbo.getEnum('itemsize',mb.itemsize) as itemsizedescription,
                mb.statusbox, 
                dbo.getEnum('statusbox',mb.statusbox) as statusboxdescription,
                mb.packingid, 
                mb.requirepatient,
                p.name as packingname
            from
                materialbox mb
                inner join packing p on ( p.id = mb.packingid )
            where mb.id = @id";

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

    public function selectLike(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $proxy = $this->getStore()->getProxy();

        $sql = "
            declare
                @name varchar(60) = :name,
                @barcode varchar(20) = :barcode;

			select
                mb.*,
                dbo.getEnum('statusbox',mb.statusbox) as statusboxdescription,
				i.proprietaryname,
				i.barcodematerial,
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
                ),
				materialboxitems = (
					select count(*) from materialboxitem where materialboxid = mb.id
				)
			from
				materialbox mb
				outer apply (
					select
						mbi.materialboxid,
						ib.barcode as barcodematerial,
						p.name as proprietaryname
					from
						materialboxitem mbi
						inner join itembase ib on ( ib.id = mbi.materialid )
						inner join proprietary p on ( p.id = ib.proprietaryid )
					where mbi.materialboxid = mb.id
				) i
			where mb.barcode = @barcode
			   or mb.name COLLATE Latin1_General_CI_AI LIKE @name 
			   or i.proprietaryname COLLATE Latin1_General_CI_AI LIKE @name
			   or i.barcodematerial = @barcode;";

        try {

            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);
            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);

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

                    insert into materialbox
                        ( 
                            name, barcode, restriction, 
                            itemsize, statusbox, packingid, 
                            requirepatient, cloned, clonedate, cloneusername
                        )
                    select
                        '(clone) ' + mb.name, 
                        '(clone)' as barcode,
                        mb.restriction, 
                        mb.itemsize, 
                        mb.statusbox, 
                        mb.packingid, 
                        mb.requirepatient,
                        1 as cloned, 
                        getdate() as clonedate, 
                        @username as cloneusername
                    from
                        materialbox mb
                    where mb.id = @id;
            
                    set @nw = ( select @@identity );            
            
                    set @barcode = 'K' + dbo.getLeftPad(7,'0',@nw);
            
                    update materialbox set barcode = @barcode, clonedid = @id where id= @nw;
                       
                    insert into materialboxtarge ( materialboxid, targecolorid, targeorderby )
                    select
                        @nw as materialboxid, mbi.targecolorid, mbi.targeorderby
                    from
                        materialboxtarge mbi
                    where mbi.materialboxid = @id;
                        
                COMMIT TRAN setCloneItem;
            
                set @error_code = 0;
                set @error_text = 'Atualizacoes realizadas com sucesso!';
            
            END TRY
            
            BEGIN CATCH
                ROLLBACK TRAN setCloneItem;
                set @error_code = error_number();
                set @error_text = ' # ' + error_message() + ', ' + cast(error_line() as varchar);
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

    public function selectProprietary(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $proxy = $this->getStore()->getProxy();
        $proprietaryid = isset($data['proprietaryid']) ? $data['proprietaryid'] : null;
        $sql = "
            declare
                @name varchar(60) = :name,
                @barcode varchar(20) = :barcode,
                @proprietaryid int = :proprietaryid;

			select
                mb.*,
                dbo.getEnum('statusbox',mb.statusbox) as statusboxdescription,
				i.materialboxitems,
				i.proprietaryname,
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
			from
				materialbox mb
				cross apply (
					select
						p.name as proprietaryname,
						count(mbi.materialboxid) as materialboxitems
					from
						materialboxitem mbi
						inner join itembase ib on ( ib.id = mbi.materialid )
						inner join proprietary p on ( p.id = ib.proprietaryid and ib.proprietaryid = @proprietaryid )
					where mbi.materialboxid = mb.id
					group by p.name
				) i
			where mb.barcode = @barcode
			   or mb.name COLLATE Latin1_General_CI_AI LIKE @name;";

        try {

            $pdo = $proxy->prepare($sql);

            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
            $pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);
            $pdo->bindValue(":proprietaryid", $proprietaryid, \PDO::PARAM_INT);

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