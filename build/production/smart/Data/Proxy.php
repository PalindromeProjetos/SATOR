<?php

namespace Smart\Data;

use Smart\Setup\Start;
use Smart\Utils\Session;
use Smart\Common\Traits as Traits;

/**
 * Um Proxy de acesso ao banco de dados
 *
 * ex.: "sqlsrv:server=(local);database=fgv"
 *      "mysql:host=localhost;dbname=fgv"
 *
 * @package Smart\Data
 */
class Proxy extends \PDO {
    use Traits\TresultSet,
        Traits\TvalidField,
        Traits\TfileSerialize;

    const
        DML_INSERT = 0,
        DML_SELECT = 1,
        DML_UPDATE = 2,
        DML_DELETE = 3;

    public $session = null;

    public $driverName = null;

    public function __construct(array $link, $data = null) {
        $this->session = ($data) ? Session::getInstance($data) : Session::getInstance();

        list ($dns, $usr, $pwd) = $link;

        Start::setTimeZone();

        try {
			parent::__construct( $dns, $usr, $pwd );
            $this->setAttribute( \PDO::ATTR_ERRMODE, \PDO::ERRMODE_EXCEPTION );
			$this->setAttribute( \PDO::ATTR_DEFAULT_FETCH_MODE, \PDO::FETCH_ASSOC );
            $this->driverName = $this->getAttribute( \PDO::ATTR_DRIVER_NAME );

            /**
             * Use Only SQLServer
             * Char set UTF-8
             * @author: https://www.drupal.org/node/1540686
             */
            if($this->driverName == 'sqlsrv') {
//                $this->setAttribute( \PDO::SQLSRV_ATTR_ENCODING, \PDO::SQLSRV_ENCODING_UTF8);
                $this->setAttribute( \PDO::SQLSRV_ATTR_ENCODING, \PDO::SQLSRV_ENCODING_SYSTEM);
            }

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText('Não foi possível acessar a base de dados!');
			echo self::getResultToJson();
        }
    }

    /**
     * Upload de Arquivos
     *
     * @param object $entity
     * @return array
     */
    public function setUpload(&$entity) {
        $tempName = isset($_FILES["filedata"]) ? $_FILES["filedata"]["tmp_name"] : null;

        if(is_uploaded_file($tempName)) {
            $result = $this->saveFile($entity);
            $entity->getSubmit()->setRowValue('filedata',$result->rows['filedata']);
            $entity->getSubmit()->setRowValue('fileinfo',$result->rows['fileinfo']);
        }
    }

    /**
     * Cria um statement DML select
     *
     * @param object $entity
     * @return null|\PDOStatement
     */
    public function sqlSelect(&$entity) {
        $fields = [];
        $notate = $entity->getNotate();
        $exists = $entity->getNotate()->property;
        $extend = $entity->getNotate()->instance->Entity->name;

        // montando DML
        foreach ($exists as $field => $value) {
            $fields[] = $this->fieldType($notate,$field);
        }

        $sql = "SELECT " . trim(implode(', ', $fields)) . " FROM {$extend} WHERE id = :id";

        return $this->bindField($entity,$sql,self::DML_SELECT);
    }

    /**
     * Cria um statement DML update
     *
     * @param object $entity
     * @return null|\PDOStatement
     */
    public function sqlUpdate(&$entity) {
        $modify = 0;
        $fields = array();
        $submit = $entity->getSubmit();
        $exists = $entity->getNotate()->property;
        $extend = $entity->getNotate()->instance->Entity->name;

        // montando DML
        foreach ($submit['rows'] as $field => $value) {
            if(isset($exists[$field]) && $field !== "id") {
                $column = $exists[$field]['Column'];
                if($column['type'] != 'formula') {
                    $modify++;
                    $fields[] = "$field = :$field";
                }
            }
        }

        $sql = "UPDATE {$extend} SET " . trim(implode(', ', $fields)) . " WHERE id = :id";

        return $modify === 0 ? null : $this->bindField($entity,$sql,self::DML_UPDATE);
    }

    /**
     * Cria um statement DML insert
     *
     * @param object $entity
     * @return null|\PDOStatement
     */
    public function sqlInsert(&$entity) {
        $modify = 0;
        $fields = $values = array();
        $submit = $entity->getSubmit();
        $notate = $entity->getNotate();
        $exists = $notate->property;
        $extend = $notate->instance->Entity->name;

        // montando DML
        foreach ($submit['rows'] as $field => $value) {
            if(isset($exists[$field])) {
                $column = $exists[$field]["Column"];
                $strategy = isset($column['strategy']) ? $column['strategy'] === "AUTO" : false;

                if(($strategy == false)&&($column['type'] != 'formula')) {
                    $modify++;
                    $fields[] = " $field";
                    $values[] = " :$field";
                }
            }
        }

        $sql = "INSERT INTO {$extend} ( " . trim(implode(',', $fields)) . " ) VALUES ( " . trim(implode(',', $values)) . " )";

        return $modify === 0 ? null : $this->bindField($entity,$sql,self::DML_INSERT);
    }

    /**
     * Cria um statement DML delete
     *
     * @param object $entity
     * @return null|\PDOStatement
     */
    public function sqlDelete(&$entity) {
        $extend = $entity->getNotate()->instance->Entity->name;

        // montando DML
        $sql = "DELETE FROM {$extend} WHERE id = :id";

        return $this->bindField($entity,$sql,self::DML_DELETE);
    }

    public function fieldType($notate,$field) {
        $exists = $notate->property;
        $column = $exists[$field]['Column'];

        if($column['type'] == 'formula') {
            $params = explode(',',$column['default']);
            $method = $params[0];
            $field = $this->$method($params);
        }

        return $field;
    }

    /**
     * Prepara a Entity com os valores do submit
     * Monta a DML com os valores achados
     *
     * @param $entity, entidade do banco
     * @param $sql, statement DML
     * @param $type, tipo de statement DML (CRUD)
     * @return null|\PDOStatement
     */
    private function bindField(&$entity,$sql,$type) {
        $commit = $this->prepare($sql);
        $submit = $entity->getSubmit();
        $exists = $entity->getNotate()->property;

        // montando PDO
        foreach ($submit['rows'] as $field => $value) {
            if(isset($exists[$field])) {
                $column = $exists[$field]["Column"];
                $strategy = isset($column['strategy']) ? $column['strategy'] === "AUTO" : false;
                switch ($type) {
                    case self::DML_INSERT:
                        if(($strategy == false)&&($column['type'] != 'formula')) {
                            $method = "get" . strtoupper($field[0]) . substr($field, 1);
                            $commit->bindValue(":$field", $entity->$method(), $this->getParams($column["type"]));
                        }
                        break;
                    case self::DML_DELETE:
                        if($field == 'id') {
                            $method = "get" . strtoupper($field[0]) . substr($field, 1);
                            $commit->bindValue(":$field", $entity->$method(), $this->getParams($column["type"]));
                        }
                        break;
                    case self::DML_SELECT:
                        if($field == 'id') {
                            $method = "get" . strtoupper($field[0]) . substr($field, 1);
                            $commit->bindValue(":$field", $entity->$method(), $this->getParams($column["type"]));
                        }
                        break;
                    default:
                        if($column['type'] != 'formula') {
                            $method = "get" . strtoupper($field[0]) . substr($field, 1);
                            $commit->bindValue(":$field", $entity->$method(), $this->getParams($column["type"]));
                        }
                        break;
                }
            }
        }

        return $commit;
    }

    /**
     * Define o tipo de parametro PDO
     *
     * @param string $paramName Nome do evento chamado
     * @return int
     */
    private function getParams($paramName) {
        switch ($paramName) {
            case is_null($paramName):
                return \PDO::PARAM_NULL;
                break;
            case 'boolean':
                return \PDO::PARAM_BOOL;
                break;
            case 'integer':
                return \PDO::PARAM_INT;
                break;
            default:
                return \PDO::PARAM_STR;
        }
    }

    private function getNameSearch(array $params) {
        $field = $params[1];
        $fieldname = substr_replace($field, '', -2);
        $table = isset($params[2]) ? $params[2] : substr_replace($field, '', -2);

        $result = "{$fieldname}name = ( SELECT name FROM {$table} WHERE id = {$field} )";

        return $result;
    }

    private function getItemSearch(array $params) {
        $field = $params[1];

        $result = "materialname = ( SELECT name FROM itembase WHERE id = {$field} )";

        return $result;
    }

    private function getUserSearch(array $params) {
        $field = $params[1];

        $result = "username = ( SELECT username FROM users WHERE id = {$field} )";

        return $result;
    }

    private function getEnumSearch(array $params) {
        $field = $params[1];

        $result = "dbo.getEnum('{$field}',{$field}) as {$field}description";

        return $result;
    }

    private function binary2base64(array $params) {
        $field = $params[1];

        $result = "dbo.binary2base64({$field}) as {$field}";

        return $result;
    }

    /**
     * Chama o método armazenado no indice <code>action<code/>
     *
     * @return json <code>$result<code/>
     */
    public function callAction() {
        $action = $this->submit['action'];
        return method_exists($this, $action) ? call_user_func(array($this, $action)) : $this->UNEXPECTED_COMMAND;
    }

}
//
//Pagging
//http://stackoverflow.com/questions/13901342/pagination-in-pdo-php
//$page  = 1;
//$limit = 20;
//$start = $page * $limit;
//
//$conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, FALSE);
//$sth = $conn->prepare("SELECT * FROM directory WHERE user_active LIMIT ?,?");
//$sth->execute(array($start,$limit));
//
//declare
//@start int = 0,
//	@limit int = 10;
//
//SELECT
//	id,
//	sterilizationtypeid,
//	areasid,
//	materialid,
//	clientid,
//	username,
//	prioritylevel,
//	dateof,
//	materialboxid,
//	dateto,
//	placeid, flowingid, instrumentatorid, surgicalwarning, patientname, healthinsurance, flowstatus, version, barcode, dataflowstep
//FROM
//[dbo].[flowprocessing]
// ORDER BY id
//
//OFFSET @start*@limit ROWS		-- skip
//FETCH NEXT @limit ROWS ONLY;	-- take