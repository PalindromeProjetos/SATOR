<?php

namespace iAdmin\Cache;

use iAdmin\Model\materialboxitem as Model;

class materialboxitem extends \Smart\Data\Cache {

	public function selectList(array $data) {

		$data['paged'] = false;
		
		return $this->selectCode($data);
	}

	public function selectCode(array $data) {
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
		$paged = isset($data['paged']) ? $data['paged'] : true;
		
		$proxy = $this->getStore()->getProxy();

		$sql = "
			declare
				@id int = :id;
				
            select
                mbi.id,
                mbi.materialboxid,
                mbi.materialid,
                ib.barcode,
                ib.name as materialname,
                m.numberproceedings,
                m.isconsigned,
                p.name as proprietaryname,
                mb.statusbox,
                mbi.boxitemstatus,
                dbo.getEnum('boxitemstatus',mbi.boxitemstatus) as boxitemstatusdescription
            from
                materialboxitem mbi
                inner join materialbox mb on ( mb.id = mbi.materialboxid )
                inner join itembase ib on ( ib.id = mbi.materialid )
                inner join material m on ( m.id = ib.id )
                inner join proprietary p on ( p.id = ib.proprietaryid )
            where mbi.materialboxid = @id";

		try {
			$pdo = $proxy->prepare($sql);

			$pdo->bindValue(":id", $query, \PDO::PARAM_INT);

			$pdo->execute();
			$rows = $pdo->fetchAll();

			self::_setRows($rows);
			
			if($paged == true) {				
				self::_setPage($start,$limit);
			}

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
		$packingid = $data['packingid'];
		$proxy = $this->getStore()->getProxy();

		$sql = "
			declare
				@barcode varchar(20) = :barcode,
				@packingid int = :packingid,
				@name varchar(80) = :name;

			select top 7
				ib.id,
				ib.name,
				ib.barcode,
				ib.description,
				mf.name as manufacturername,
                dbo.binary2base64(ib.filedata) as filedata,
                ib.fileinfo
			from
				itembase ib
				inner join material m on ( m.id = ib.id and m.packingid = @packingid )
				inner join manufacturer mf on ( mf.id = ib.manufacturerid )
			where ib.id not in ( select materialid from materialboxitem where boxitemstatus = 'A' )
			  and ib.isactive = 1
              and (
                    ib.barcode = @barcode OR
                    ib.name COLLATE Latin1_General_CI_AI LIKE @name
              )";

		try {
			$pdo = $proxy->prepare($sql);

			$pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
			$pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);
			$pdo->bindValue(":packingid", $packingid, \PDO::PARAM_INT);

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

	public function selectItem(array $data) {
		$query = $data['query'];
		$start = $data['start'];
		$limit = $data['limit'];
		$materialboxid = $data['materialboxid'];
		$proxy = $this->getStore()->getProxy();

		$sql = "
			declare
				@materialboxid int = :materialboxid,
				@barcode varchar(20) = :barcode,
				@name varchar(80) = :name;
				
            select
				ib.id,
				ib.name
            from
                materialboxitem mbi
                inner join itembase ib on ( ib.id = mbi.materialid )
            where mbi.materialboxid = @materialboxid
			  and (
				ib.barcode = @barcode OR
				ib.name COLLATE Latin1_General_CI_AI LIKE @name
			  )";

		try {
			$pdo = $proxy->prepare($sql);

			$pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
			$pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);
			$pdo->bindValue(":materialboxid", $materialboxid, \PDO::PARAM_INT);

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

	public function filterItem(array $data) {
		$start = $data['start'];
		$limit = $data['limit'];
		$materialid = $data['materialid'];
		$materialboxid = $data['materialboxid'];

		$proxy = $this->getStore()->getProxy();

		$sql = "
			declare
				@materialid int = :materialid,
				@materialboxid int = :materialboxid;
				
            select
                mbi.id,
                mbi.materialboxid,
                mbi.materialid,
                ib.barcode,
                ib.name as materialname,
                m.numberproceedings,
                m.isconsigned,
                p.name as proprietaryname,
                mb.statusbox,
                mbi.boxitemstatus,
                dbo.getEnum('boxitemstatus',mbi.boxitemstatus) as boxitemstatusdescription
            from
                materialboxitem mbi
                inner join materialbox mb on ( mb.id = mbi.materialboxid )
                inner join itembase ib on ( ib.id = mbi.materialid )
                inner join material m on ( m.id = ib.id )
                inner join proprietary p on ( p.id = ib.proprietaryid )
            where mbi.materialid = @materialid
              and mbi.materialboxid = @materialboxid";

		try {
			$pdo = $proxy->prepare($sql);

			$pdo->bindValue(":materialid", $materialid, \PDO::PARAM_INT);
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

	public function selectFile(array $data) {
		$materialid = $data['materialid'];
		$proxy = $this->getStore()->getProxy();

		$sql = "
            declare
                @materialid int = :materialid;
                
            select
                ib.id, 
                dbo.binary2base64(ib.filedata) as filedata,
                ib.fileinfo
            from
                itembase ib
            where ib.id = @materialid";

		try {
			$pdo = $proxy->prepare($sql);
			$pdo->bindValue(":materialid", $materialid, \PDO::PARAM_INT);
			$pdo->execute();
			$rows = $pdo->fetchAll();

			self::_setRows($rows);
			self::_setSuccess(count($rows) != 0);

		} catch ( \PDOException $e ) {
			self::_setSuccess(false);
			self::_setText($e->getMessage());
		}

		return self::getResultToJson();
	}

}