<?php

namespace iSterilization\Heart;

use Smart\Setup\Start;
use Smart\Common\Traits as Traits;

class heartflowprocessing extends \Smart\Data\Proxy {
    use Traits\TuserHandler;

    public function __construct() {
        $this->submit = $_POST;
        $pwd = Start::getPassWord();
        $usr = Start::getUserName();
        $dns = Start::getConnnect();

        $link = array($dns, $usr, $pwd);

        parent::__construct($link);
    }

    public function callAction() {
        $method = $this->submit['method'];
        return method_exists($this, $method) ? call_user_func(array($this, $method), $this->submit) : $this->UNEXPECTED_COMMAND;
    }

    /**
     * @param \iSterilization\Model\flowprocessing $model
     */
    public function preInsert( $model ) {
        $sterilizationtypeid = $model->getSterilizationtypeid();

        $pdo = $this->prepare("select authenticate from sterilizationtype where id = :sterilizationtypeid");
        $pdo->bindValue(":sterilizationtypeid", $sterilizationtypeid, \PDO::PARAM_INT);

        $pdo->execute();
        $rows = $pdo->fetchAll();
        $authenticate = $rows[0]['authenticate'];

        if(intval($authenticate) == 0) {
            throw new \PDOException('<b>O Fluxo</b> selecionado para esta leitura <b>Não Está Autenticado!</b>');
        }
    }

    /**
     * @param \iSterilization\Model\flowprocessing $model
     */
    public function posInsert( $model ) {
        $result = (object) $this->setFlowStep($model);

        if(!$result->success) {
            throw new \PDOException($result->text);
        }
    }

    public function setFlowStep($model) {
        $id = $model->getId();
        $sterilizationtypeid = $model->getSterilizationtypeid();
        function nullIf ($value) {

            if(!isset($value)) {
                return 'null';
            }

            if (is_numeric($value)) {
            } else {
                $value = utf8_decode((strlen($value) == 0) ? 'null' : "'$value'");
            }

            return $value;
        }

        try {

            $pdo = $this->prepare("select dataflowstep from sterilizationtype where id = :sterilizationtypeid");
            $pdo->bindValue(":sterilizationtypeid", $sterilizationtypeid, \PDO::PARAM_INT);

			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}			
			
            $rows = self::encodeUTF8($pdo->fetchAll());
            $flow = self::jsonToObject($rows[0]['dataflowstep']);

            $fields = [
                'flowprocessingid','steplevel','elementtype',
                'elementname','stepflaglist','stepsettings',
                'steppriority','source','target','areasid','equipmentid',
                'flowchoice', 'flowbreach', 'exceptionby','exceptiondo'
            ];

            foreach ($flow as $step) {
                $data = "insert into flowprocessingstep ("  . trim(implode(', ', $fields)) . ") values ( %d, %d, %s, %s, %s, %s, %s, %s, %s, %s, %s, %d, %d, %s, %s );";

                $list[] =   sprintf(
                    $data,
                    $id,
                    $step->steplevel,
                    nullIf(isset($step->elementtype) ? $step->elementtype : ''),
                    nullIf(isset($step->elementname) ? $step->elementname : ''),
                    nullIf(isset($step->stepflaglist) ? $step->stepflaglist : ''),
                    nullIf(isset($step->stepsettings) ? $step->stepsettings : ''),
                    nullIf(isset($step->steppriority) ? $step->steppriority : ''),
                    nullIf(isset($step->source) ? $step->source : null),
                    nullIf(isset($step->target) ? $step->target : null),
                    nullIf($step->areasid),
                    nullIf($step->equipmentid),
                    nullIf(isset($step->flowchoice) ? $step->flowchoice : 0),
                    nullIf(isset($step->flowbreach) ? $step->flowbreach : 0),
                    nullIf(isset($step->exceptionby) ? $step->exceptionby : ''),
                    nullIf(isset($step->exceptiondo) ? $step->exceptiondo : '')
                );
            }

            $insert = join ("\r\n", $list);

            $sql = "
                SET XACT_ABORT ON
                SET NOCOUNT ON
                SET ANSI_NULLS ON
                SET ANSI_WARNINGS ON

                declare
                    @error_code int = 0, 
                    @error_text nvarchar(200);

                BEGIN TRY

                    {$insert}

                    set @error_code = 0;
                    set @error_text = 'Atualizacoes realizadas com sucesso!';

                END TRY

                BEGIN CATCH
                    set @error_code = error_number();
                    set @error_text = ' # ' +error_message() + ', ' + cast(error_line() as varchar);
                END CATCH

                select @error_code as error_code, @error_text as error_text;";

			$rows = $this->query($sql)->fetchAll();

			$error_text = $rows[0]['error_text'];
			$error_code = intval($rows[0]['error_code']);

			if($error_code != 0) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$sql = "
                declare
                    @id int = {$id};
                    
                update
                    flowprocessingstep
                    set
                        source = (
                            select top 1
                                a.id
                            from
                                flowprocessingstep a
                            where a.flowprocessingid = flowprocessingstep.flowprocessingid
                              and a.steplevel = flowprocessingstep.source
                        ),
                        target = (
                            select top 1
                                a.id
                            from
                                flowprocessingstep a
                            where a.flowprocessingid = flowprocessingstep.flowprocessingid
                              and a.steplevel = flowprocessingstep.target
                        )
                where flowprocessingid = @id";

			$affected = $this->exec($sql);

			if ($affected === false) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$message = $error_text;
			$success = $error_code == 0;

			self::_setRows($rows);
			self::_setText($message);
			self::_setSuccess($success);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResult();
    }

    /**
     * @param array $data
     * @return object|Traits\json|string
     */
    public function newFlowView(array $data) {
		$query = self::jsonToObject($data['query']);

		try {

			$sql = "
                --Gerando BarCode
                declare
                    @dateof varchar(20) = :dateof;
                     
                select 
                    dbo.getLeftPad(6,'0',count(*)+1) as newcode
                from
                    flowprocessing
                where convert(varchar(6),dateof,112) = @dateof";


			$dateof = date("Ym");
			$pdo = $this->prepare($sql);
			$pdo->bindValue(":dateof", $dateof, \PDO::PARAM_STR);

			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$rows = $pdo->fetchAll();

			$barcode = "P". $dateof . $rows[0]['newcode'];
			unset($pdo);
			unset($rows);

			$coach = new \iSterilization\Coach\flowprocessing();

			$this->beginTransaction();

			$coach->getStore()->setProxy($this);
			$coach->getStore()->getModel()->set('barcode',$barcode);
			$coach->getStore()->getModel()->set('version',$query->version);
			$coach->getStore()->getModel()->set('areasid',$query->areasid);
			$coach->getStore()->getModel()->set('clientid',$query->clientid);
			$coach->getStore()->getModel()->set('username',$query->username);
			$coach->getStore()->getModel()->set('materialid',$query->materialid);
			$coach->getStore()->getModel()->set('prioritylevel',$query->prioritylevel);
			$coach->getStore()->getModel()->set('sterilizationtypeid',$query->sterilizationtypeid);

			if(isset($query->materialboxid) && strlen($query->materialboxid) != 0) {
				$coach->getStore()->getModel()->set('materialboxid',$query->materialboxid);
			}

			if($query->clienttype == '004') {
				$coach->getStore()->getModel()->set('patientname',$query->patientname);
				$coach->getStore()->getModel()->set('surgicalwarning',$query->surgicalwarning);
			}

			$model = $coach->getStore()->getModel();
			$this->preInsert($model);

			$result = self::jsonToObject($coach->getStore()->insert());

			if(!$result->success) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			if($result->success) {
				$model = $coach->getStore()->getModel();
				$this->posInsert($model);
			}

			$step = array();

			$step['flowprocessingid'] = $result->rows->id;

			if($result->success) {
				$resultStep = self::jsonToObject($this->newFlowStep($step));
				if(!$resultStep->success) {
					throw new \PDOException(self::$FAILURE_STATEMENT);
				}
			}

			$this->commit();

			$result = self::objectToJson($result);

		} catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
			self::_setSuccess(false);
			self::_setText($e->getMessage());
			$result = self::getResultToJson();
		}

		return $result;
	}

	public function newFlowStep(array $step) {
		$flowprocessingid = $step['flowprocessingid'];

		$sql = "
            -- Metodo Inicia Leitura
            select
                fps.id,  
                fps.steppriority, 
                fps.steplevel, 
                fps.elementtype, 
                fps.elementname, 
                fps.stepflaglist, 
                fps.stepsettings
            from
                flowprocessingstep fps
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
            where fp.flowstatus = 'R'
              and fps.flowstepstatus = '000'
              and fps.elementtype not in ('uml.StartState','uml.EndState')
              and fps.flowprocessingid = :flowprocessingid 
            order by fps.steplevel, fps.steppriority";

		try {

			$pdo = $this->prepare($sql);
			$pdo->bindValue(":flowprocessingid", $flowprocessingid, \PDO::PARAM_INT);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$rows = $pdo->fetchAll();

			$flow = new \iSterilization\Coach\flowprocessing();
			$step = new \iSterilization\Coach\flowprocessingstep();
			$action = new \iSterilization\Coach\flowprocessingstepaction();

			while(list(, $item) = each($rows)) {
				extract($item);

				$pos = strpos($stepflaglist, '001');

				if ($pos !== false) {

					// insert flowprocessingstepaction
					$action->getStore()->setProxy($this);
					$action->getStore()->getModel()->set('flowprocessingstepid',$id);
					$action->getStore()->getModel()->set('flowstepaction','001');
					$action->getStore()->getModel()->set('isactive',1);
					$result = self::jsonToObject($action->getStore()->insert());

					if(!$result->success) {
						throw new \PDOException(self::$FAILURE_STATEMENT);
					}

					// update flowprocessing
					$flow->getStore()->setProxy($this);
					$flow->getStore()->getModel()->set('id',$flowprocessingid);
					$flow->getStore()->getModel()->set('flowstatus','I');
					$result = self::jsonToObject($flow->getStore()->update());

					if(!$result->success) {
						throw new \PDOException(self::$FAILURE_STATEMENT);
					}

					// update flowprocessingstep
					$date = date("Ymd H:i:s");
					$step->getStore()->setProxy($this);
					$step->getStore()->getModel()->set('id',$id);
					$step->getStore()->getModel()->set('datestart',$date);
					$step->getStore()->getModel()->set('flowstepstatus','001');
					$result = self::jsonToObject($step->getStore()->update());

					if(!$result->success) {
						throw new \PDOException(self::$FAILURE_STATEMENT);
					}

					$data = array();
					$data['id'] = $id;

					// insert flowprocessingstepmaterial
					$resultItem = self::jsonToObject($this->newFlowItem($data));
					if(!$resultItem->success) {
						throw new \PDOException(self::$FAILURE_STATEMENT);
					}
					break;
				}
			}

		} catch ( \PDOException $e ) {
			self::_setSuccess(false);
			self::_setText($e->getMessage());
		}

		return self::getResultToJson();
	}

    public function newFlowItem(array $data) {
        $id = $data['id'];

        $sql = "
            declare
                @materialid int,
                @materialboxid int,
                @flowprocessingstepid int = :id;
            
                select
                    @materialid = fp.materialid,
                    @materialboxid = fp.materialboxid
                from
                    flowprocessing fp
                    inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                where fps.id = @flowprocessingstepid;
            
                set @materialid = coalesce(@materialid,0);
                set @materialboxid = coalesce(@materialboxid,0);
            
                if(@materialboxid != 0)
                begin
                    insert into
                        flowprocessingstepmaterial ( flowprocessingstepid, materialid, unconformities ) 
                    select
                        fps.id as flowprocessingstepid,
                        mbi.materialid,
                        '001' as unconformities
                    from
                        flowprocessing fp
                        inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                        inner join materialboxitem mbi on ( mbi.materialboxid = fp.materialboxid and mbi.boxitemstatus = 'A' )
                    where fps.id = @flowprocessingstepid;
            
                    update
                        flowprocessingstepmaterial
                        set unconformities = '010',
                            dateto = getDate()
                    where materialid = @materialid
                      and flowprocessingstepid = @flowprocessingstepid;
                end
                else
                begin
                    insert into
                        flowprocessingstepmaterial ( flowprocessingstepid, materialid, unconformities, dateto ) 
                    values
                        ( @flowprocessingstepid, @materialid, '010', getDate() )
                end";

        try {
			$pdo = $this->prepare($sql);
			$pdo->bindValue(":id", $id, \PDO::PARAM_INT);

			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			self::_setSuccess(true);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResult();
    }

	public function updateUserStep(array $data) {
		$username = $data['username'];
		$flowprocessingstepid = $data['flowprocessingstepid'];
		$step = new \iSterilization\Coach\flowprocessingstep();
		$message = new \iSterilization\Coach\flowprocessingstepmessage();

		try {
			$this->beginTransaction();

			$date = date("Ymd H:i:s");
			$step->getStore()->setProxy($this);
			$step->getStore()->getModel()->set('id',$flowprocessingstepid);
			$step->getStore()->getModel()->set('username',$username);
			$step->getStore()->getModel()->set('datestart',$date);

			$result = self::jsonToObject($step->getStore()->update());

			if(!$result->success) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$message->getStore()->setProxy($this);
			$message->getStore()->getModel()->set('id','');
			$message->getStore()->getModel()->set('flowprocessingstepid',$flowprocessingstepid);
			$message->getStore()->getModel()->set('readercode','001');
			$message->getStore()->getModel()->set('readershow','info');
			$message->getStore()->getModel()->set('readertext','SATOR_INICIAR_LEITURA');

			$result = self::jsonToObject($message->getStore()->insert());

			if(!$result->success) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$this->commit();

			$result = self::objectToJson($result);

		} catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
			self::_setSuccess(false);
			self::_setText($e->getMessage());

			$result = self::getResultToJson();
		}

		return $result;
	}

	public function updatetUnconformities(array $data) {
		$flowprocessingstepid = $data['flowprocessingstepid'];

		$sql = "
            declare
                @flowprocessingstepid int = :flowprocessingstepid;
                
            update
                flowprocessingstepmaterial 
            set unconformities = '001'
            where flowprocessingstepid = @flowprocessingstepid";

		try {
			$this->beginTransaction();

			$pdo = $this->prepare($sql);
			$pdo->bindValue(":flowprocessingstepid", $flowprocessingstepid, \PDO::PARAM_INT);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$this->commit();

		} catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
			self::_setSuccess(false);
			self::_setText($e->getMessage());
		}

		return self::getResultToJson();
	}

    public function getExceptionDo(array $data) {
        $typeid = self::jsonToArray($data['typeid']);
        $flowprocessingid = $data['flowprocessingid'];
        $steplevel = self::jsonToArray($data['steplevel']);

        $typeid = implode(",", $typeid);
        $steplevel = implode(",", $steplevel);

        $sql = "
            declare
                @flowprocessingid int = :flowprocessingid;

            select
                a.id,
                a.name,
                fps.id as stepsource,
                fps.typechoice,
                fps.stepchoice,
                fps.flowbreach,
                fps.flowchoice,
                fps.exceptiondo
            from
                flowprocessingstep fps
                inner join areas a on ( a.id = fps.areasid )
            where fps.flowprocessingid = @flowprocessingid
              and fps.steplevel in ({$steplevel})
              and fps.areasid in ({$typeid})";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":flowprocessingid", $flowprocessingid, \PDO::PARAM_INT);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}
			
            $rows = $pdo->fetchAll();

            self::_setRows($rows);
            self::_setSuccess(count($rows) != 0);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function setExceptionDo(array $data) {
        $flowprocessingid = $data['flowprocessingid'];
        $flowprocessingstepid = $data['flowprocessingstepid'];
        $flowprocessingstepactionid = $data['flowprocessingstepactionid'];

        $params = self::jsonToArray($data['params']);

        $data['params'] = $params;

        try {
			$this->beginTransaction();

            while (list(, $item) = each($params)) {
                extract($item);

                $filtercode = ($elementtype == 'basic.Equipment') ? "and fps.equipmentid = $elementcode" : "and fps.areasid = $elementcode";

                $sql = "
                    declare
                        @id int,
                        @source int,
                        @target int,
                        @steplevel int = :steplevel,
                        @stepchoice int = :stepchoice,
                        @levelsource int = :levelsource,
                        @flowprocessingid int = :flowprocessingid;

                    select
                        @id = fps.id,
                        @source = fps.source,
                        @target = fps.target
                    from
                        flowprocessingstep fps
                    where fps.flowprocessingid = @flowprocessingid
                      and fps.steplevel = @steplevel
                      {$filtercode};

                    update flowprocessingstep set target = @id where id = @source;
                    update flowprocessingstep set source = @source where id = @id;
                    update flowprocessingstep set source = @id where id = @target;
                    update flowprocessingstep set stepchoice = @stepchoice where id = @id;
                    
                    if (@stepchoice = 2)
                    begin
                        insert into 
                            flowprocessingstepaction ( flowprocessingstepid, flowstepaction, isactive )
                        values
                            (@source,'002',1);
                    end";

                $pdo = $this->prepare($sql);
                $pdo->bindValue(":steplevel", $steplevel, \PDO::PARAM_INT);
                $pdo->bindValue(":stepchoice", $stepchoice, \PDO::PARAM_INT);
                $pdo->bindValue(":levelsource", $levelsource, \PDO::PARAM_INT);
                $pdo->bindValue(":flowprocessingid", $flowprocessingid, \PDO::PARAM_INT);
				$callback = $pdo->execute();

				if(!$callback) {
					throw new \PDOException(self::$FAILURE_STATEMENT);
				}
            }

            $list = [];
			$list['hasTran'] = 0;
			$list['flowprocessingid'] = $flowprocessingid;
			$list['flowprocessingstepid'] = $flowprocessingstepid;
			$list['flowprocessingstepactionid'] = $flowprocessingstepactionid;

			$result = self::jsonToObject($this->setEncerrarLeitura($list));

			if(!$result->success) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$this->commit();

        } catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function setEncerrarLeitura (array $data) {
        $flowprocessingid = $data['flowprocessingid'];
        $flowprocessingstepid = $data['flowprocessingstepid'];
        $flowprocessingstepactionid = $data['flowprocessingstepactionid'];
		$hasTran = isset($data['hasTran']) ? intval($data['hasTran']) : 1;

        $result = null;

        try {

            $step = new \iSterilization\Coach\flowprocessingstep();
            $action = new \iSterilization\Coach\flowprocessingstepaction();

            $sql = "
                declare
                    @newid int,
                    @oldid int,
                    @flowprocessingid int = :flowprocessingid,
                    @flowprocessingstepid int = :flowprocessingstepid,
                    @flowstepaction varchar(3);

                select top 1
                    @newid = fps.id,
					@oldid = ta.id,
					@flowstepaction = ta.flowstepaction
                from
                    flowprocessingstep fps
                    inner join areas a on ( a.id = fps.areasid )
					outer apply (
						select
							fpsa.id,
							fpsa.flowstepaction
						from
							flowprocessingstepaction fpsa
						where fpsa.flowprocessingstepid = fps.id
						  and fpsa.flowstepaction = '005'
						  and fpsa.isactive = 0
					) ta
                where fps.flowprocessingid = @flowprocessingid
                    and (( fps.id > @flowprocessingstepid and ( fps.stepflaglist like '%001%' or fps.stepflaglist like '%019%' ) )
					 or ( a.hasstock = 1 ))
			    order by fps.id

                select @newid as newid, @oldid as oldid, @flowstepaction as flowstepaction;";

            $pdo = $this->prepare($sql);
            $pdo->bindValue(":flowprocessingid", $flowprocessingid, \PDO::PARAM_INT);
            $pdo->bindValue(":flowprocessingstepid", $flowprocessingstepid, \PDO::PARAM_INT);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

            $rows = $pdo->fetchAll();
            $newid = $rows[0]['newid'];
            $oldid = $rows[0]['oldid'];
            $flowstepaction = $rows[0]['flowstepaction'];
            unset($pdo);
			
			if($hasTran == 1) {
				$this->beginTransaction();
			}			

            // update flowprocessingstepaction
			$action->getStore()->setProxy($this);
            $action->getStore()->getModel()->set('id', $flowprocessingstepactionid);
            $action->getStore()->getModel()->set('isactive', 0);
			$result = self::jsonToObject($action->getStore()->update());

			if(!$result->success) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

            if(count($rows) != 0) {

                // insert flowprocessingstepaction
                if($flowstepaction != '005') {
					$action->getStore()->setProxy($this);
                    $action->getStore()->getModel()->set('id','');
                    $action->getStore()->getModel()->set('flowprocessingstepid',$newid);
                    $action->getStore()->getModel()->set('flowstepaction','001');
                    $action->getStore()->getModel()->set('isactive',1);
					$result = self::jsonToObject($action->getStore()->insert());

					if(!$result->success) {
						throw new \PDOException(self::$FAILURE_STATEMENT);
					}
                }

                if($flowstepaction == '005') {
					$action->getStore()->setProxy($this);
					$action->getStore()->getModel()->set('id',$oldid);
                    $action->getStore()->getModel()->set('flowstepaction','001');
                    $action->getStore()->getModel()->set('isactive',1);
					$result = self::jsonToObject($action->getStore()->update());

					if(!$result->success) {
						throw new \PDOException(self::$FAILURE_STATEMENT);
					}
                }

                // update flowprocessingstep
                $date = date("Ymd H:i:s");
				$step->getStore()->setProxy($this);
                $step->getStore()->getModel()->set('id',$newid);
                $step->getStore()->getModel()->set('datestart',$date);
                $step->getStore()->getModel()->set('flowstepstatus','001');				
				$result = self::jsonToObject($step->getStore()->update());
				
				if(!$result->success) {
					throw new \PDOException(self::$FAILURE_STATEMENT);
				}

                $sql = "
                    declare
                        @flowprocessingstepid int = :flowprocessingstepid;
                        
                    insert into
                          flowprocessingstepmaterial
                          ( flowprocessingstepid, materialid, unconformities, dateof )  
                    select
                          {$newid} as flowprocessingstepid,
                          materialid,
                          '001' as unconformities,
                          getdate() dateof
                    from
                        flowprocessingstepmaterial
                    where flowprocessingstepid = @flowprocessingstepid;";

                if($flowstepaction != '005') {
                    $pdo = $this->prepare($sql);
                    $pdo->bindValue(":flowprocessingstepid", $flowprocessingstepid, \PDO::PARAM_INT);
					$callback = $pdo->execute();

					if(!$callback) {
						throw new \PDOException(self::$FAILURE_STATEMENT);
					}
                }
            }

			if($hasTran == 1) {
				$this->commit();
			}

            self::_setSuccess(true);

        } catch ( \PDOException $e ) {
			if ($hasTran == 1 && $this->inTransaction()) {
				$this->rollBack();
			}
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function setRemoveCargaLista(array $data) {
		$id = $data['id'];

		try {
			$charge = new \iSterilization\Coach\flowprocessingcharge();

			$charge->getStore()->setProxy($this);
			$charge->getStore()->getModel()->set('id',$id);
			$charge->getStore()->getModel()->set('chargeflag','004');
			$result = self::jsonToObject($charge->getStore()->update());

			if(!$result->success) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$result = self::objectToJson($result);

		} catch ( \PDOException $e ) {
			self::_setSuccess(false);
			self::_setText($e->getMessage());
			$result = self::getResultToJson();
		}

		return $result;
    }

    public function setValidaCargaLista(array $data) {
        $username = $data['username'];
        $duration = $data['duration'];
        $timetoopen = $data['timetoopen'];
        $temperature = $data['temperature'];
        $equipmentcycleid = $data['equipmentcycleid'];

        $utimestamp = microtime(true);
        $timestamp = floor($utimestamp);
        $milliseconds = round(($utimestamp - $timestamp) * 1000000);

        $barcode = substr("L" . date("YmdHis") . $milliseconds,0,20);

        $list = self::jsonToArray($data['list']);

        $charge = new \iSterilization\Coach\flowprocessingcharge();
        $chargeitem = new \iSterilization\Coach\flowprocessingchargeitem();

        try {
			$this->beginTransaction();

			$charge->getStore()->setProxy($this);
            $charge->getStore()->getModel()->set('id','');
            $charge->getStore()->getModel()->set('chargeflag','001');
            $charge->getStore()->getModel()->set('barcode',$barcode);
            $charge->getStore()->getModel()->set('duration',$duration);
            $charge->getStore()->getModel()->set('chargeuser',$username);
            $charge->getStore()->getModel()->set('timetoopen',$timetoopen);
            $charge->getStore()->getModel()->set('temperature',$temperature);
            $charge->getStore()->getModel()->set('equipmentcycleid',$equipmentcycleid);
			$result = self::jsonToObject($charge->getStore()->insert());

			if(!$result->success) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			while (list(, $item) = each($list)) {
				extract($item);

				$chargeitem->getStore()->setProxy($this);
                $chargeitem->getStore()->getModel()->set('id','');
				$chargeitem->getStore()->getModel()->set('chargestatus','001');
				$chargeitem->getStore()->getModel()->set('flowprocessingchargeid',$result->rows->id);
				$chargeitem->getStore()->getModel()->set('flowprocessingstepid',$flowprocessingstepid);
                $resultitem = self::jsonToObject($chargeitem->getStore()->insert());

				if(!$resultitem->success) {
					throw new \PDOException(self::$FAILURE_STATEMENT);
				}
			}

			unset($charge);
			unset($chargeitem);

			$this->commit();

			self::_setSuccess(true);

		} catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
			self::_setSuccess(false);
			self::_setText($e->getMessage());
		}

		return self::getResultToJson();
    }

    public function setValidaCargaAreas(array $data) {
        $username = $data['username'];

        $utimestamp = microtime(true);
        $timestamp = floor($utimestamp);
        $milliseconds = round(($utimestamp - $timestamp) * 1000000);

        $barcode = substr("L" . date("YmdHis") . $milliseconds,0,20);

        $list = self::jsonToArray($data['list']);

        $charge = new \iSterilization\Coach\flowprocessingcharge();
        $chargeitem = new \iSterilization\Coach\flowprocessingchargeitem();

        try {
			$this->beginTransaction();

			$charge->getStore()->setProxy($this);
            $charge->getStore()->getModel()->set('id','');
            $charge->getStore()->getModel()->set('chargeflag','005');
            $charge->getStore()->getModel()->set('barcode',$barcode);
            $charge->getStore()->getModel()->set('chargeuser',$username);
			$result = self::jsonToObject($charge->getStore()->insert());

			if(!$result->success) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

            while (list(, $item) = each($list)) {
                extract($item);

                $chargeitem->getStore()->setProxy($this);
                $chargeitem->getStore()->getModel()->set('id','');
                $chargeitem->getStore()->getModel()->set('chargestatus','001');
                $chargeitem->getStore()->getModel()->set('flowprocessingchargeid',$result->rows->id);
                $chargeitem->getStore()->getModel()->set('flowprocessingstepid',$flowprocessingstepid);
                $resultitem = self::jsonToObject($chargeitem->getStore()->insert());

				if(!$resultitem->success) {
					throw new \PDOException(self::$FAILURE_STATEMENT);
				}
            }

            unset($charge);
            unset($chargeitem);

			$this->commit();

            self::_setSuccess(true);

        } catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function setReverteEtapaArea(array $data) {
        $username = $data['username'];

        $list = self::jsonToObject($data['list']);

        $action = new \iSterilization\Coach\flowprocessingstepaction();

		try {
			$this->beginTransaction();

			foreach ($list as $item) {
				$action->getStore()->setProxy($this);
				$action->getStore()->getModel()->set('id',$item->flowprocessingstepactionid);
				$action->getStore()->getModel()->set('toreversedby',$username);
				$action->getStore()->getModel()->set('flowstepaction','004');
				$result = self::jsonToObject($action->getStore()->update());

				if(!$result->success) {
					throw new \PDOException(self::$FAILURE_STATEMENT);
				}
			}

			unset($action);

			$this->commit();

		} catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
			self::_setSuccess(false);
			self::_setText($e->getMessage());
		}

        return self::getResultToJson();
    }

    public function setStatusCiclo(array $data) {
        $id = $data['id'];
        $username = $data['username'];
        $cyclestatus = $data['cyclestatus'];

        try {

            $sql = "
                declare
                    @id int = :id,
                    @chargeflag varchar(3) = '002',
                    @username varchar(80) = :username,
                    @cyclestatus varchar(5) = :cyclestatus;
             
                if(@cyclestatus = 'START')
                begin
                    update 
                        flowprocessingcharge
                    set
                        chargeflag = @chargeflag,
                        cyclestart = getdate(),
                        cyclestartuser = @username
                    where id = @id;
                end               
                
                if((@cyclestatus = 'FINAL') or (@cyclestatus = 'PRINT'))
                begin                              
                   
                    if(@cyclestatus = 'FINAL') set @chargeflag = '003';
                    if(@cyclestatus = 'PRINT') set @chargeflag = '006';
                               
                    update 
                        flowprocessingcharge
                    set
                        chargeflag = @chargeflag,
                        cyclefinal = getdate(),
                        cyclefinaluser = @username
                    where id = @id;                   
                    
                    update 
                        flowprocessingstepmaterial
                    set
                        dateto = getdate(),
                        unconformities = '010'
                    where flowprocessingstepid in ( select flowprocessingstepid from flowprocessingchargeitem where flowprocessingchargeid = @id );
                    
                    update
                        flowprocessingstepaction
                    set
                        dateto = getdate(),
                        isactive = 0
                    where flowstepaction = '001' 
                      and flowprocessingstepid in ( select flowprocessingstepid from flowprocessingchargeitem where flowprocessingchargeid = @id );
                end;";

			$this->beginTransaction();

            $pdo = $this->prepare($sql);
            $pdo->bindValue(":id", $id, \PDO::PARAM_INT);
            $pdo->bindValue(":username", $username, \PDO::PARAM_STR);
            $pdo->bindValue(":cyclestatus", $cyclestatus, \PDO::PARAM_STR);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

            if(($cyclestatus == 'FINAL') || ($cyclestatus == 'PRINT')) {

                $sql = "
                    declare
                        @id int = :id;
                 
                    select
                        fps.flowprocessingid,
                        fpci.flowprocessingstepid,
                        fpsa.id as flowprocessingstepactionid
                    from
                        flowprocessingchargeitem fpci
                        inner join flowprocessingstep fps on ( fps.id = fpci.flowprocessingstepid )
                        inner join flowprocessingstepaction fpsa on ( fpsa.flowprocessingstepid = fps.id )
                    where fpci.flowprocessingchargeid = @id
                      and fpsa.flowstepaction = '001'";

				$pdo = $this->prepare($sql);
				$pdo->bindValue(":id", $id, \PDO::PARAM_INT);
				$callback = $pdo->execute();

				if(!$callback) {
					throw new \PDOException(self::$FAILURE_STATEMENT);
				}

				$rows = $pdo->fetchAll();

				foreach ($rows as $item) {
					$item['hasTran'] = 0;
					$result = self::jsonToObject($this->setEncerrarLeitura($item));

					if(!$result->success) {
						throw new \PDOException(self::$FAILURE_STATEMENT);
					}					
				}

				self::_setRows($rows);

				$tagprinter['tagprinter'] = $cyclestatus == 'FINAL' ? '002' : '003';

				$data['stepsettings'] = self::arrayToJson($tagprinter);
			}

			$this->commit();

			self::_setSuccess(true);

			if(($cyclestatus == 'FINAL') || ($cyclestatus == 'PRINT')) {
				$this->imprimeEtiqueta($data);
			}

		} catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
			self::_setSuccess(false);
			self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    /**
     *  Cadastros
     *     Material
     *          - Bloqueado     - Inviabiliza Leituras
     *     Kit
     *          - Bloqueado     - Inviabiliza Leituras
     *
     *     Fluxo Atual
     *          - Fecha e não pode avançar para próxima Área
     */
    public function setUnconformities(array $data) {

        $update = self::jsonToArray($data['update']);
        $params = self::jsonToArray($data['params']);

        $materiallist = implode(',',$update);
        $flowprocessingstepid = $params['id'];
        $flowprocessingid = $params['flowprocessingid'];
        $flowprocessingstepactionid = $params['flowprocessingstepactionid'];

        $sql = "
            declare
                @flowprocessingid int = :flowprocessingid, 
                @flowprocessingstepid int = :flowprocessingstepid,
                @flowprocessingstepactionid int = :flowprocessingstepactionid;
    
            update flowprocessing
                set
                    dateto = getdate(),
                    flowstatus = 'A'
            where id = @flowprocessingid;
            
            update flowprocessingstep
                set 
                    datefinal = getdate(),
                    flowstepstatus = '003'
            where id = @flowprocessingstepid;
    
            update flowprocessingstepaction
                set 
                    dateto = getdate(),
                    isactive = 0
            where id = @flowprocessingstepactionid;
                
            update material
                set
                    materialstatus = '005'
            where id in ($materiallist);";

		try {
			$this->beginTransaction();

			$pdo = $this->prepare($sql);
            $pdo->bindValue(":flowprocessingid", $flowprocessingid, \PDO::PARAM_INT);
            $pdo->bindValue(":flowprocessingstepid", $flowprocessingstepid, \PDO::PARAM_INT);
            $pdo->bindValue(":flowprocessingstepactionid", $flowprocessingstepactionid, \PDO::PARAM_INT);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$this->commit();

			self::_setSuccess(true);
        } catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    /**
     * Corrige Material Kit
     */
    public function deleteItem(array $data) {
        $materialid = $data['materialid'];
        $flowprocessingstepid = $data['flowprocessingstepid'];

        $sql = "
            declare
                @hasitem int = 1,
                @materialboxid int,
                @hastext varchar(90),
                @flowprocessingid int,
                @materialid int = :materialid,
                @flowprocessingstepid int = :flowprocessingstepid;

            select 
                @flowprocessingid = fp.id,
                @materialboxid = fp.materialboxid                
            from 
                flowprocessingstep fps
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid ) 
            where fps.id = @flowprocessingstepid;

            select
                @hasitem = count(id)
            from
                materialboxitem
            where materialboxid = @materialboxid
              and materialid = @materialid;
            
            set @hastext = 'O material <b>não pode ser excluido</b> deste processamento!';
            
            if(@hasitem = 0)
            begin
                set @hastext = 'O material foi excluido com sucesso!';
                delete from flowprocessingstepmaterial where flowprocessingstepid = @flowprocessingstepid and materialid = @materialid;
            end
            
            --SET NOCOUNT ON
            
            --select @hasitem as err_code, @hastext as err_text;";

        try {
			$this->beginTransaction();

            $pdo = $this->prepare($sql);
            $pdo->bindValue(":materialid", $materialid, \PDO::PARAM_INT);
            $pdo->bindValue(":flowprocessingstepid", $flowprocessingstepid, \PDO::PARAM_INT);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			//$rows = $pdo->fetchAll();

			$this->commit();

			self::_setSuccess(true);

			//self::_setRows($rows);

        } catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function insertItem(array $data) {
        $flowprocessingstepid = $data['flowprocessingstepid'];

        $sql = "
            declare
                @hasstep int = 0,
                @hasitem int = 1,
                @materialboxid int,
                @hastext varchar(90),
                @flowprocessingid int,
                @flowprocessingstepid int = :flowprocessingstepid;
            
            select 
                @hasstep = count(fpsm.id),
                @flowprocessingid = fp.id,
                @materialboxid = fp.materialboxid
            from 
                flowprocessingstep fps
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                inner join flowprocessingstepmaterial fpsm on ( fpsm.flowprocessingstepid = fps.id )
            where fps.id = @flowprocessingstepid
            group by
                fp.id,
                fp.materialboxid;
            
            select
                @hasitem = count(id)
            from
                materialboxitem
            where materialboxid = @materialboxid;
                        
            if(@hasstep = @hasitem)
            begin
                set @hasitem = 1;
                set @hastext = 'O kit <b>não possui atualizações</b> para este processamento!';            
            end           
            
            if(@hasstep < @hasitem)
            begin
                set @hasitem = 0;
                set @hastext = 'O kit foi atualizado com sucesso!';
            
                insert into flowprocessingstepmaterial (flowprocessingstepid, materialid, unconformities, dateof)
                select
                    @flowprocessingstepid as flowprocessingstepid,
                    materialid,
                    '001' as unconformities,
                    getdate() as dateof
                from
                    materialboxitem
                where materialboxid = @materialboxid
                  and materialid not in (
                    select
                        fpsm.materialid
                    from
                        flowprocessingstepmaterial fpsm
                    where fpsm.flowprocessingstepid = @flowprocessingstepid 
                  );
            end
            
            --SET NOCOUNT ON
            
            --select @hasitem as err_code, @hastext as err_text;";

        try {
			$this->beginTransaction();

            $pdo = $this->prepare($sql);
            $pdo->bindValue(":flowprocessingstepid", $flowprocessingstepid, \PDO::PARAM_INT);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

//			$rows = $pdo->fetchAll();

			$this->commit();

			self::_setSuccess(true);

//			self::_setRows($rows);

        } catch ( \PDOException $e ) {
			if ($this->inTransaction()) {
				$this->rollBack();
			}
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    /**
     * Select
     */
    public function selectEquipment(array $data) {
        $areasid = $data['areasid'];
        $barcode = $data['barcode'];

        $sql = "
            declare
                @areasid int = :areasid,
                @barcode varchar(20) = :barcode;
            
            select distinct
                ib.id,
                ib.name as equipmentname,
				oncharge = (
                    select
                        count(b.id)
                    from
                        flowprocessingcharge a
						inner join equipmentcycle c on ( c.id = a.equipmentcycleid )
						inner join itembase b on ( b.id = c.equipmentid and b.id = ib.id )
                    where a.chargeflag in ('001','005')
				)
            from
                equipment e
                inner join itembase ib on ( ib.id = e.id )
                inner join equipmentcycle ec on ( ec.equipmentid = ib.id )
                inner join cmesubareas csa on ( csa.cmeareasid = e.cmeareasid )
            where csa.id = @areasid
              and ib.barcode = @barcode";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

			$rows = $pdo->fetchAll();

			if(count($rows) == 0) {
				throw new \PDOException('Não foi possível localizar o equipamento!');
			}

			if($rows[0]['oncharge'] != 0) {
				throw new \PDOException('O equipamento já está em Preparo de Carga, favor aguardar o início do Ciclo!');
			}

			self::_setRows($rows[0]);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectCycleList(array $data) {
        $barcode = $data['barcode'];
        $equipmentid = $data['equipmentid'];

        $sql = "
            declare
                @equipmentid int = :equipmentid,
				@barcode varchar(20) = :barcode;

            select
                ec.id, 
                c.name as cyclename, 
                c.duration,                 
                c.timetoopen,
                c.temperature,
                ec.equipmentid
            from
                equipmentcycle ec
                inner join cycle c on ( c.id = ec.cycleid )
            where c.barcode = @barcode
              and ec.equipmentid = @equipmentid";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
            $pdo->bindValue(":equipmentid", $equipmentid, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setSuccess(count($rows) != 0);

            if(count($rows) != 0) {
                self::_setRows($rows[0]);
            }

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectCycleItem(array $data) {
        $areasid = $data['areasid'];
        $barcode = $data['barcode'];
        $equipmentcycleid = $data['equipmentcycleid'];

        $sql = "
            declare
                @barcode_p varchar(20),
                @areasid int = :areasid,
                @barcode varchar(20) = :barcode,
                @equipmentcycleid int = :equipmentcycleid;

            if (substring(@barcode,1,1) = 'C')
            begin
                select top 1
                    @barcode_p = fp.barcode
                from
                    flowprocessing fp
                    inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                    inner join flowprocessingstepmaterial fpsm on ( fpsm.flowprocessingstepid = fps.id )
                    inner join itembase ib on ( ib.id = fpsm.materialid and ib.barcode = @barcode )
                where ib.barcode = @barcode
                  and fp.flowstatus = 'I';
            end
            else
            begin
                set @barcode_p = @barcode;
            end

            select
                fpsa.flowprocessingstepid,
                fp.barcode,
				coalesce(ta.name,tb.name) as materialname,
				coalesce(tb.cycleenabled,0) as cycleenabled,
				oncharge = (
                  select
                      count(a.id)
                  from
                      flowprocessingchargeitem a
                      inner join flowprocessingcharge b on ( b.id = a.flowprocessingchargeid )
                  where a.flowprocessingstepid = fps.id
                    and b.chargeflag in ('001','002','003','005')
				)
            from
                flowprocessing fp
				inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                inner join flowprocessingstepaction fpsa on ( fpsa.flowprocessingstepid = fps.id )
                outer apply (
                    select
                        mb.name
                    from
                        materialbox mb
                    where mb.id = fp.materialboxid
                ) ta
                outer apply (
                    select top 1
						ib.name,
						1 as cycleenabled
                    from
                        flowprocessingstepmaterial b
                        inner join itembase ib on ( ib.id = b.materialid )
						inner join materialcycle mc on ( mc.materialid = b.materialid )
						inner join equipmentcycle ec on ( ec.cycleid = mc.cycleid and ec.id = @equipmentcycleid )
                    where b.flowprocessingstepid = fps.id
                ) tb
            where fps.areasid = @areasid
			  and fp.barcode = @barcode_p
              and fpsa.flowstepaction = '001'
              and fps.stepflaglist like '%016%'";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
            $pdo->bindValue(":equipmentcycleid", $equipmentcycleid, \PDO::PARAM_INT);
			$callback = $pdo->execute();

			if(!$callback) {
				throw new \PDOException(self::$FAILURE_STATEMENT);
			}

            $rows = $pdo->fetchAll();

			if(count($rows) == 0) {
				throw new \PDOException('Não foi possível localizar o material!');
			}

			if($rows[0]['oncharge'] != 0) {
				throw new \PDOException('O material já está em Ciclo/Carga, favor aguardar o término do processo!');
			}

			if($rows[0]['cycleenabled'] == 0) {
				throw new \PDOException('O material não está configurado para este Ciclo!');
			}

			self::_setRows($rows[0]);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectCycleLote(array $data) {
        $areasid = $data['areasid'];
        $barcode = $data['barcode'];

        $sql = "
            declare
                @areasid int = :areasid,
                @barcode varchar(20) = :barcode;

            select distinct
                fp.id,
                fpsm.flowprocessingstepid,
                fpsa.id as flowprocessingstepactionid,
                fp.barcode,
                coalesce(tb.name,ib.name) as materialname
            from
                flowprocessing fp
                inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                inner join flowprocessingstepaction fpsa on ( fpsa.flowprocessingstepid = fps.id and fpsa.flowstepaction = '001' )
                inner join flowprocessingstepmaterial fpsm on ( fpsm.flowprocessingstepid = fps.id )
                inner join itembase ib on ( ib.id = fpsm.materialid )
                outer apply (
                    select
                        mb.name
                    from
                        materialbox mb
                    where mb.id = fp.materialboxid
                ) tb
            where fps.areasid = @areasid
              and ( fp.barcode = @barcode or ib.barcode = @barcode )";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setSuccess(count($rows) != 0);

            if(count($rows) != 0) {
                self::_setRows($rows[0]);
            }

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectAreaStep(array $data) {
        $query = $data['query'];

        return self::getResultToJson();
    }

	public function selectTaskName(array $data) {
		$query = $data['query'];

		$sql = "
            declare
                @username varchar(50) = :username;

            select
                u.id,
                u.username,
                u.fullname,
                u.isactive
            from
                users u
            where u.username = @username";

		try {
			$pdo = $this->prepare($sql);
			$pdo->bindValue(":username", $query, \PDO::PARAM_STR);
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

	public function selectUserCode(array $data) {
		$query = $data['query'];

		$sql = "
            declare
                @username varchar(50) = :username;
                
            select
                u.id,
                u.username,
                u.fullname,
                u.isactive
            from
                users u
            where u.username = @username";

		try {
			$pdo = $this->prepare($sql);
			$pdo->bindValue(":username", $query, \PDO::PARAM_STR);
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

	public function selectUserFlow(array $data) {
		$usercode = str_replace('HAM-','',$data['usercode']);
		$userfail = "Sua tentativa fracassou, o usuário NÂO foi Autenticado!";

        $sql = "
            declare
                @usercode varchar(50) = :usercode;
                
            select
                u.username,
                u.password
            from
                collaborator c
                inner join users u on ( u.id = c.usersid )
            where c.registration = @usercode";

		self::_setSuccess(false);

		if(!is_numeric($usercode)) {
			self::_setText($userfail);
			return self::getResultToJson();
		}

		try {
			$pdo = $this->prepare($sql);
			$pdo->bindValue(":usercode", $usercode, \PDO::PARAM_INT);
			$pdo->execute();
			$rows = $pdo->fetchAll();

			$success = (count($rows) != 0);

			self::_setRows($rows);
			self::_setSuccess($success);
			self::_setText($success ? 'Autenticado com sucesso!' : $userfail);

		} catch ( \PDOException $e ) {
			self::_setSuccess(false);
			self::_setText($e->getMessage());
		}

        return self::getResultToJson();
    }

    public function selectClientId(array $data) {
        $clientid = str_replace('HAM-C','',$data['clientid']);

        $sql = "
			declare
				@clientid int = :clientid;

            select c.id as clientid, c.name as clientname from client c where c.id = @clientid";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":clientid", $clientid, \PDO::PARAM_INT);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            $success = (count($rows) != 0);

            self::_setRows($rows);
            self::_setSuccess($success);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectOpenClient (array $data) {
        $clientid = str_replace('HAM-C','',$data['query']);

        $clientid = $this->tryNumeric($clientid) ? intval($clientid) : $clientid;

        $sql = "
			declare
				@id varchar(20) = :id,
				@name varchar(60) = :name;

            select 
				c.id as clientid, 
				c.name as clientname 
			from 
				client c 
			where convert(varchar(20),c.id) = @id or c.name COLLATE Latin1_General_CI_AI LIKE @name";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":id", $clientid, \PDO::PARAM_STR);
            $pdo->bindValue(":name", "{$clientid}%", \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            $success = (count($rows) != 0);

            self::_setRows($rows);
            self::_setSuccess($success);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectHold(array $data) {
        $areasid = $data['areasid'];
        $start = isset($data['start']) ? $data['start'] : 0;
        $limit = isset($data['limit']) ? $data['limit'] : 10;

        $sql = "
            declare
                @areasid int = :areasid;

            select
                fps.id,
                fp.barcode,
                c.name as clientname,
                m.materialname
            from
                flowprocessingstep fps
				inner join flowprocessingstepaction fpsa on ( fpsa.flowprocessingstepid = fps.id )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                inner join areas a on ( a.id = fps.areasid )
                inner join client c on ( c.id = fp.clientid )
                cross apply (
                    select
                        coalesce(ta.name,tb.name) as materialname
                    from
                        flowprocessing a
                        inner join flowprocessingstep b on ( b.flowprocessingid = a.id and b.id = fps.id )
                        outer apply (
                            select
                                mb.name
                            from
                                materialbox mb
                            where mb.id = a.materialboxid
                        ) ta
                        outer apply (
                            select top 1
                                ib.name
                            from
                                flowprocessingstepmaterial mb
                                inner join itembase ib on ( ib.id = mb.materialid )
                                inner join flowprocessingstep x on ( x.flowprocessingid = a.id and x.id = mb.flowprocessingstepid )
                            where x.id < fps.id
                              and ( x.stepflaglist like '%001%' or x.stepflaglist like '%019%' )
                        ) tb
                    where a.id = fp.id
                ) m
            where fps.areasid = @areasid
              and fps.flowstepstatus = '001'
			  and fpsa.isactive = 1
              and a.hasstock = 1
			  and fps.id not in (
					select
						x.flowprocessingstepid
					from
						armorymovementitem x
						inner join armorymovement z on ( z.id = x.armorymovementid )
					where z.releasestype in ('A','E')
			  )";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
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

    public function selectPreLoad(array $data) {
        $barcode = $data['barcode'];

        $sql = "
            declare
                @barcode varchar(20) = :barcode;
            
            select top 1
                amo.id,
                t.version,
                t.barcode,
                t.items,
                amo.clientid,
				amo.patientname,
				amo.surgicalwarning,
                t.materialid,
                c.clienttype,
				t.colorschema,
                t.materialname,
                t.materialboxid,
                t.prioritylevel,
                c.name as clientname,
                t.sterilizationtypeid,
                t.sterilizationtypename,
				dbo.areAvailableForProcessing(@barcode,'L') as areavailable
            from
                flowprocessing fp
                inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                inner join armorystock st on ( st.flowprocessingstepid = fps.id )
                inner join armorymovementitem ami on ( ami.flowprocessingstepid = st.flowprocessingstepid )
                inner join armorymovementoutput amo on ( amo.id = ami.armorymovementid )
                inner join client c on ( c.id = amo.clientid )
                cross apply (
                    select
                        ta.materialboxid,
						ta.colorschema,
						coalesce(tb.materialid,ta.materialid) as materialid,
                        coalesce(ta.items,tb.items) as items,
                        coalesce(ta.name,tb.name) as materialname,
                        coalesce(ta.barcode,tb.barcode) as barcode,
                        coalesce(ta.version,tb.version) as version,
                        coalesce(ta.prioritylevel,tb.prioritylevel) as prioritylevel,
                        coalesce(ta.sterilizationtypeid,tb.sterilizationtypeid) as sterilizationtypeid,
                        coalesce(ta.sterilizationtypename,tb.sterilizationtypename) as sterilizationtypename
                    from 
                        flowprocessing a
                        outer apply (
                            select
                                mb.name,
                                mb.barcode,
                                stt.version,
								mbi.materialid,
                                mt.prioritylevel,
                                mbi.materialboxid,
                                ( select count(id) from materialboxitem where materialboxid = mb.id ) as items,
                                mt.sterilizationtypeid,
                                stt.name as sterilizationtypename,
								colorschema = (
									select stuff
										(
											(
												select
													',#' + tc.colorschema + '|#' + tc.colorstripe
												from
													materialboxtarge mbt
													inner join targecolor tc on ( tc.id = mbt.targecolorid )
												where mbt.materialboxid = mbi.materialboxid
												order by mbt.targeorderby desc
												for xml path ('')
											) ,1,1,''
										)                
								)
                            from
                                materialbox mb
                                inner join materialboxitem mbi on ( mbi.materialboxid = mb.id )
                                inner join itembase ib on ( ib.id = mbi.materialid and ib.barcode = @barcode )
                                inner join materialtypeflow mt on ( mt.materialid = mbi.materialid and mt.prioritylevel = 'N' )
                                inner join sterilizationtype stt on ( stt.id = mt.sterilizationtypeid )
                            group by 
                                mb.id,
                                mb.name, 
                                mb.barcode, 
                                stt.version,
								mbi.materialid,
                                mt.prioritylevel, 
                                mbi.materialboxid, 
                                stt.name, 
                                mt.sterilizationtypeid
                        ) ta
                        outer apply (
                            select
                                ib.name,
                                ib.barcode,
                                stt.version,
                                mt.materialid,
                                mt.prioritylevel,
                                1 as items,
                                mt.sterilizationtypeid,
                                stt.name as sterilizationtypename
                            from
                                itembase ib
                                inner join materialtypeflow mt on ( mt.materialid = ib.id and mt.prioritylevel = 'N' )
                                inner join sterilizationtype stt on ( stt.id = mt.sterilizationtypeid ) 
                            where ib.id = fp.materialid
                              and ib.barcode = @barcode
                        ) tb
                    where a.id = fp.id
                ) t
            where st.armorystatus = 'E'
            order by amo.id desc";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
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

    public function selectHoldItem(array $data) {
        $barcode = $data['barcode'];

        $sql = "
            declare
                @barcode varchar(20) = :barcode;
            
            select
                a.id, 
                a.flowprocessingstepid, 
                a.armorystatus, 
                a.armorylocal,
                t.materialname,
                dbo.areAvailableForOutput(fp.barcode) as available,
                colorschema = (
                    select stuff
                        (
                            (
                                select
                                    ',#' + tc.colorschema + '|#' + tc.colorstripe
                                from
                                    materialboxtarge mbt
                                    inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                where mbt.materialboxid = fp.materialboxid
                                order by mbt.targeorderby desc
                                for xml path ('')
                            ) ,1,1,''
                        )                
                )				
            from
                armorystock a
                inner join flowprocessingstep fps on ( fps.id = a.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                cross apply (
                    select 
                        coalesce(ta.name,tb.name) as materialname
                    from 
                        flowprocessing a
                        outer apply (
                            select
                                mb.name,
                                mb.armorylocal
                            from
                                materialbox mb
                            where mb.id = a.materialboxid
                        ) ta
                        outer apply (
                            select top 1
                                ib.name,
                                m.armorylocal
                            from
                                flowprocessingstep b
                                inner join flowprocessingstepmaterial c on ( c.flowprocessingstepid = b.id )
                                inner join itembase ib on ( ib.id = c.materialid )
                                inner join material m on ( m.id = ib.id )
                            where b.flowprocessingid = fp.id
                                and b.id < fps.id
                                and ( b.stepflaglist like '%001%' or b.stepflaglist like '%019%' )
                        ) tb
                    where a.id = fp.id
                ) t
            where a.armorystatus = 'A'
              and fp.barcode = @barcode";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function armoryOfQuery(array $data) {
        $areasid = $data['areasid'];
        $barcode = $data['barcode'];

        $sql = "
            declare
                @areasid int = :areasid,
                @barcode varchar(20) = :barcode;

            select
                fp.id,
				fps.id as flowprocessingstepid,
                fp.barcode,
                t.materialname,
				t.armorylocal,
				dbo.getEnum('armorylocal',t.armorylocal) as armorylocaldescription,
                colorschema = (
                    select stuff
                        (
                            (
                                select
                                    ',#' + tc.colorschema + '|#' + tc.colorstripe
                                from
                                    materialboxtarge mbt
                                    inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                where mbt.materialboxid = fp.materialboxid
                                order by mbt.targeorderby desc
                                for xml path ('')
                            ) ,1,1,''
                        )                
                )				
            from
                flowprocessingstep fps
				inner join flowprocessingstepaction fpsa on ( fpsa.flowprocessingstepid = fps.id )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
				inner join areas a on ( a.id = fps.areasid )
				cross apply (
					select 
						coalesce(ta.name,tb.name) as materialname,
						coalesce(ta.armorylocal,tb.armorylocal) as armorylocal
					from 
						flowprocessing a
						outer apply (
							select
								mb.name,
								mb.armorylocal
							from
								materialbox mb
							where mb.id = a.materialboxid
						) ta
						outer apply (
							select top 1
								ib.name,
								m.armorylocal
							from
								flowprocessingstep b
								inner join flowprocessingstepmaterial c on ( c.flowprocessingstepid = b.id )
								inner join itembase ib on ( ib.id = c.materialid )
								inner join material m on ( m.id = ib.id )
							where b.flowprocessingid = fp.id
							  and b.id < fps.id
							  and ( b.stepflaglist like '%001%' or b.stepflaglist like '%019%' )
						) tb
					where a.id = fp.id
				) t
            where fps.areasid = @areasid
              and fps.flowstepstatus = '001'
              and fp.barcode = @barcode
			  and a.hasstock = 1
			  and fps.id not in (
					select
						x.flowprocessingstepid
					from
						armorymovementitem x
						inner join armorymovement z on ( z.id = x.armorymovementid )
					where z.releasestype in ('A','E')
					   and z.movementtype = '001'
			  );";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
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

    public function armoryInQuery(array $data) {
        $barcode = $data['barcode'];

        $sql = "
            declare
                @barcode varchar(20) = :barcode;

		select
			fp.id,
			a.flowprocessingstepid,
			fp.barcode,
			t.materialname,
			a.armorylocal,
			'001' as regresstype,
			dbo.getEnum('regresstype','001') as regresstypedescription,
			dbo.getEnum('armorylocal',a.armorylocal) as armorylocaldescription
		from
			flowprocessing fp
			inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
			inner join armorystock a on ( a.flowprocessingstepid = fps.id )
			inner join armorymovementitem ami on ( ami.flowprocessingstepid = a.flowprocessingstepid )
			inner join armorymovement am on ( am.id = ami.armorymovementid )
			cross apply (
				select 
					coalesce(ta.name,tb.name) as materialname
				from 
					flowprocessing a
					outer apply (
						select
							mb.name
						from
							materialbox mb
						where mb.id = a.materialboxid
					) ta
					outer apply (
						select top 1
							ib.name
						from
							flowprocessingstep b
							inner join flowprocessingstepmaterial c on ( c.flowprocessingstepid = b.id )
							inner join itembase ib on ( ib.id = c.materialid )
						where b.flowprocessingid = fp.id
							and b.id < fps.id
							and ( b.stepflaglist like '%001%' or b.stepflaglist like '%019%' )
					) tb
				where a.id = fp.id
			) t
		where fp.barcode = @barcode
		  and a.armorystatus = 'E'
		  and am.movementtype = '002'";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":barcode", $barcode, \PDO::PARAM_STR);
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

    public function selectInQuery(array $data) {
        $search = $data['search'];
        $movementtype = $data['movementtype'];

        $sql = "
            declare
                @search varchar(60) = :search,
                @movementtype varchar(3) = :movementtype;
            
            select
                am.id,
                a.barcode,	
                am.movementdate,
                am.movementtype,
                dbo.getEnum('movementtype',am.movementtype) as movementtypedescription,
                am.releasestype,
                dbo.getEnum('releasestype',am.releasestype) as releasestypedescription,
                am.movementuser,
                items = ( select count(*) from armorymovementitem where armorymovementid = am.id )
            from
                armorymovementitem ami
                inner join flowprocessingstep fps on ( fps.id = ami.flowprocessingstepid )
                inner join flowprocessingstepmaterial fpsm on ( fpsm.flowprocessingstepid = fps.id )
                inner join itembase ib on ( ib.id = fpsm.materialid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                inner join armorymovement am on ( am.id = ami.armorymovementid )
                outer apply (
                    select
                        o.barcode
                    from
                        armorymovementoutput o
                    where o.id = am.id
                ) a
            where ( ib.barcode = @search or a.barcode = @search or @search = '' )
              and ( am.movementtype = @movementtype or @movementtype = '000' )
            group by
                am.id,
                a.barcode,	
                am.movementdate,
                am.movementtype,
                am.releasestype,
                am.movementuser
            order by am.movementdate desc";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":search", $search, \PDO::PARAM_STR);
            $pdo->bindValue(":movementtype", $movementtype, \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function releasesTypeA(array $data) {
        $areasid = $data['areasid'];

        $sql = "
            declare
                @areasid int = :areasid,
                @releasestype char(1) = :releasestype;

            select
                am.id,
                am.areasid,
                coalesce(o.lineone,(convert(varchar, dbo.getLeftPad(8,'0',am.id)))) as lineone,
                a.name as areasname,
                am.movementuser,
                coalesce(o.patientname, convert(char(10), am.movementdate, 103)) as linetwo,
                am.movementtype,
                dbo.getEnum('movementtype',am.movementtype) as movementtypedescription,
                am.releasestype,
                dbo.getEnum('releasestype',am.releasestype) as releasestypedescription,
                o.patientname,
                o.dateof,
                o.timeof,
                item = ( select count(id) from armorymovementitem where armorymovementid = am.id )
            from
                armorymovement am
                inner join areas a on ( a.id = am.areasid )
                outer apply (
                    select
                        c.name as lineone,
                        amo.patientname,
                        amo.dateof,
                        amo.timeof,
                        amo.barcode
                    from
                        armorymovementoutput amo
                        inner join client c on ( c.id = amo.clientid )
                    where amo.id = am.id
                ) o
            where am.areasid = @areasid
                and am.releasestype = @releasestype;";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":areasid", $areasid, \PDO::PARAM_INT);
            $pdo->bindValue(":releasestype", "A", \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function selectFlowDash(array $data) {
        $query = $data['query'];

        $sql = "
            declare
                @id int = :id;

            select
                fps.id,
                fps.username,
                fps.datestart,
                fps.elementname,
                fps.elementtype,
                fps.stepflaglist,
                fps.stepsettings,
                fps.steppriority,
                a.name as areasname,
                ib.name as equipmentname,
                st.name as sterilizationtypename,
                c.name as clientname,
                fp.materialboxid,
                mb.name as materialboxname,
                dbo.getEnum('prioritylevel',fp.prioritylevel) as priorityleveldescription,
                fps.flowstepstatus,
                colorschema = (
                    select stuff
                        (
                            (
                                select
                                    ',#' + tc.colorschema + '|#' + tc.colorstripe
                                from
                                    materialboxtarge mbt
                                    inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                where mbt.materialboxid = fp.materialboxid
                                order by mbt.targeorderby desc
                                for xml path ('')
                            ) ,1,1,''
                        )                
                )
            from
                flowprocessingstepaction fpsa
                inner join flowprocessingstep fps on ( fps.id = fpsa.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                left join areas a on ( a.id = fps.areasid )
                left join itembase ib on ( ib.id = fps.equipmentid )
                left join materialbox mb on ( mb.id = fp.materialboxid )
                inner join sterilizationtype st on ( st.id = fp.sterilizationtypeid )
                inner join client c on ( c.id = fp.clientid )
            where fpsa.id = @id";

        try {
            $pdo = $this->prepare($sql);
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

    public function selectFlowItem(array $data) {
        $query = $data['query'];

        $sql = "
			declare
				@barcode varchar(20) = :barcode,
				@name varchar(80) = :name;

            select
                ib.id,
                ib.name as materialname,
                ib.barcode,
                ib.description,
                b.materialboxid,
                dbo.binary2base64(ib.filedata) as filedata,
                ib.fileinfo,
                mf.name as manufacturername,
                -- tipo de fluxo e prioridade
                mtf.sterilizationtypeid,
                st.name as sterilizationtypename,
                mtf.prioritylevel,
                dbo.getEnum('prioritylevel',mtf.prioritylevel) as priorityleveldescription,
                st.name +' ('+ dbo.getEnum('prioritylevel',mtf.prioritylevel) +')' as sterilizationpriority
            from
                itembase ib
                inner join manufacturer mf on ( mf.id = ib.manufacturerid )
                inner join material m on ( m.id = ib.id )
                inner join materialtypeflow mtf on ( mtf.materialid = m.id and mtf.prioritylevel = 'N' )
                inner join sterilizationtype st on ( st.id = mtf.sterilizationtypeid )
                outer apply (
					select top 1
						mbi.materialboxid
					from
						materialboxitem mbi
					where mbi.materialid = ib.id
				) b
            where ib.isactive = 1
              and (
                    ib.barcode = :barcode OR
                    ib.name COLLATE Latin1_General_CI_AI LIKE @name
              )";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":barcode", $query, \PDO::PARAM_STR);
            $pdo->bindValue(":name", "%{$query}%", \PDO::PARAM_STR);
            $pdo->execute();
            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    //<editor-fold desc="Etiqueta">

    public function imprimeEtiqueta(array $data) {
        $stepsettings = isset($data['stepsettings']) ? $data['stepsettings'] : null;

        $stepsettings = self::jsonToObject($stepsettings);
        $tagprinter = 'imprimeEtiqueta' . $stepsettings->tagprinter;

        $return = $this->$tagprinter($data);

        return $return;
    }

    public function imprimeEtiqueta001(array $data) {
        $id = $data['id'];
        $printlocate = isset($data['printlocate']) ? $data['printlocate'] : null;

        $ph = $printlocate ? printer_open($printlocate) : null;

        $sql = "
            declare
                @id int = :id;
                 
            select
                fp.barcode,
                t.proprietaryname,
                st.name as sterilizationtypename,
                fps.username,
                fp.dateof,
                st.validity as days,
                dateadd(day,st.validity,fp.dateof) as validity,
                coalesce(mb.name,t.materialname) as materialboxname,
                entityname = ( select top 1 name from entity ),
                quantity = ( select count(*) from flowprocessingstepmaterial where flowprocessingstepid = fps.id )
            from
                flowprocessingstep fps
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                inner join sterilizationtype st on ( st.id = fp.sterilizationtypeid )
                left join materialbox mb on ( mb.id = fp.materialboxid )
                cross apply (
                    select top 1
                        ib.name as materialname,
                        p.name as proprietaryname
                    from
                        flowprocessingstepmaterial fpsm
                        inner join itembase ib on ( ib.id = fpsm.materialid )
                        inner join proprietary p on ( p.id = ib.proprietaryid )
                    where fpsm.flowprocessingstepid = fps.id
                ) t
            where fps.id = @id";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":id", $id, \PDO::PARAM_INT);
            $pdo->execute();
//            $rows = $this->toHexUTF8($pdo->fetchAll());
//            $rows = $this->removeAccents(self::encodeUTF8($pdo->fetchAll()));
            $rows = self::encodeUTF8($pdo->fetchAll());

            $entityname = $rows[0]['entityname'];
            $proprietaryname = $this->toHexUTF8($rows[0]['proprietaryname']);
            $dateof = $rows[0]['dateof'];
            $username = $rows[0]['username'];
            $sterilizationtypename = $this->toHexUTF8($rows[0]['sterilizationtypename']);
            $validity = $rows[0]['validity'];
            $days = $rows[0]['days'];
            $materialboxname = $this->toHexUTF8($rows[0]['materialboxname']);
            $quantity = $rows[0]['quantity'];
            $barcode = $rows[0]['barcode'];

            if($ph) {
                $tpl = "
                    ^XA
                    ^CI28
                    ^CF0,23
                    ^FO50,050^FD$entityname^FS
                    ^FO420,050^FH^FD$proprietaryname^FS
                    ^FO50,080^FDPREPARADO EM: $dateof^FS
                    ^FO50,110^FDOP: $username^FS
                    ^FO50,140^FH^FDPROCESSO: $sterilizationtypename^FS
                    ^FO50,170^FDVALIDADE: $validity ($days)^FS
                    ^FO130,200^FDVIDE ETIQUETA DE LOTE^FS
                    ^FO50,230^FH^FDMATERIAL: $materialboxname ($quantity itens)^FS
                    ^FO260,260^BXN,3,200^FD$barcode^FS^
                    ^FO50,290^FD$barcode^FS^
                    ^XZ";

                printer_set_option($ph, PRINTER_MODE, "RAW");
                printer_write($ph, $tpl);
                printer_close($ph);
            }  else {
                throw new \PDOException('A impressora não pôde ser selecionada corretamente!');
            }

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }

    public function imprimeEtiqueta002(array $data) {
        $id = $data['id'];
        $tagcount = isset($data['tagcount']) ? $data['tagcount'] : 0;
        $printlocate = isset($data['printlocate']) ? $data['printlocate'] : null;

        $ph = $printlocate ? printer_open($printlocate) : null;

        $sql = "
            declare
                @id int = :id;
                 
            select
                fpc.barcode,
                fpc.cyclefinal,
                fpc.cyclefinaluser,
                ib.name as equipmentname,
                c.name as cyclename
            from
                flowprocessingcharge fpc
                left join equipmentcycle ec on ( ec.id = fpc.equipmentcycleid )
                left join cycle c on ( c.id = ec.cycleid )
                left join itembase ib on ( ib.id = ec.equipmentid )
                left join flowprocessingchargeitem fpci on ( fpci.flowprocessingchargeid = fpc.id )
            where fpc.id = @id";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":id", $id, \PDO::PARAM_INT);
            $pdo->execute();
//            $rows = $this->toHexUTF8($pdo->fetchAll());
            $rows = self::encodeUTF8($pdo->fetchAll());

            if($ph) {

                $col = 1;
                $pos = 00;

                $tpl = "^XA^CI28~SD25";

                foreach ($rows as $item) {
                    $barcode = $item['barcode'];
                    $cyclefinal = $item['cyclefinal'];
                    $equipmentname = $this->toHexUTF8($item['equipmentname']);
                    $cyclefinaluser = $item['cyclefinaluser'];
                    $cyclename = $this->toHexUTF8($item['cyclename']);

                    $equipamentcycle = "$equipmentname ($cyclename)";
                    $equipamentcycle = ( $equipamentcycle == " ()") ? "" : $equipamentcycle ;

                    $pos += ( $col == 1 ) ? 10 : 275;
                    $pos = str_pad($pos, 3, '0', STR_PAD_LEFT);
                    $col++;

                    $tpl .= "
                        ^CF0,20
                        ^FO0$pos,050^FDLOTE: $barcode^FS
                        ^CF0,20
                        ^FO0$pos,080^FD$cyclefinal^FS
                        ^FO0$pos,100^FH^FD$equipamentcycle^FS
                        ^FO0$pos,120^FD$cyclefinaluser^FS";

                    if ($col > 3) {
                        $tpl .= "^XZ";
                        printer_set_option($ph, PRINTER_MODE, "RAW");
                        printer_write($ph, $tpl);
                        $tpl = "^XA^CI28~SD25";
                    }
                    $col = $col > 3 ? 1 : $col;
                    $pos = ( $col == 1 ) ? 10 : $pos;

                    if ($tagcount == 1) {
                        break;
                    }
                }
                if ($tpl != "^XA^CI28~SD25") {
                    $tpl .= "^XZ";
                    printer_set_option($ph, PRINTER_MODE, "RAW");
                    printer_write($ph, $tpl);
                }

                printer_close($ph);

            }  else {
                throw new \PDOException('A impressora não pôde ser selecionada corretamente!');
            }

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();

    }

    public function imprimeEtiqueta003(array $data) {
        $id = $data['id'];
        $tagcount = isset($data['tagcount']) ? $data['tagcount'] : 0;

        $printlocate = isset($data['printlocate']) ? $data['printlocate'] : null;

        $ph = $printlocate ? printer_open($printlocate) : null;

        $sql = "
            declare
                @id int = :id;
                 
            select
                fpc.barcode,
                fpc.cyclefinal,
                fpc.cyclefinaluser
            from
                flowprocessingcharge fpc
                inner join flowprocessingchargeitem fpci on ( fpci.flowprocessingchargeid = fpc.id )
            where fpc.id = @id";

        try {
            $pdo = $this->prepare($sql);
            $pdo->bindValue(":id", $id, \PDO::PARAM_INT);
            $pdo->execute();
//            $rows = $this->toHexUTF8($pdo->fetchAll());
            $rows = self::encodeUTF8($pdo->fetchAll());

            if($ph) {

                $col = 1;
                $pos = 00;

                $tpl = "^XA^CI28~SD25";

                foreach ($rows as $item) {
                    $barcode = $item['barcode'];
                    $cyclefinal = $item['cyclefinal'];
                    $cyclefinaluser = $item['cyclefinaluser'];

                    $pos += ( $col == 1 ) ? 10 : 275;
                    $pos = str_pad($pos, 3, '0', STR_PAD_LEFT);
                    $col++;

                    $tpl .= "
                        ^CF0,20
                        ^FO0$pos,050^FDLOTE: $barcode^FS
                        ^CF0,20
                        ^FO0$pos,080^FD$cyclefinal^FS
                        ^FO0$pos,120^FD$cyclefinaluser^FS";

                    if ($col > 3) {
                        $tpl .= "^XZ";
                        printer_set_option($ph, PRINTER_MODE, "RAW");
                        printer_write($ph, $tpl);
                        $tpl = "^XA^CI28~SD25";
                    }
                    $col = $col > 3 ? 1 : $col;
                    $pos = ( $col == 1 ) ? 10 : $pos;

                    if ($tagcount == 1) {
                        break;
                    }

                }
                if ($tpl != "^XA^CI28~SD25") {
                    $tpl .= "^XZ";
                    printer_set_option($ph, PRINTER_MODE, "RAW");
                    printer_write($ph, $tpl);
                }

                printer_close($ph);

            }  else {
                throw new \PDOException('A impressora não pôde ser selecionada corretamente!');
            }

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();

    }

    //</editor-fold>

}