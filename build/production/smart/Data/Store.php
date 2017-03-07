<?php

namespace Smart\Data;

use Smart\Data\Proxy;
use Smart\Utils\Submit;
use Smart\Utils\Session;
use Smart\Utils\Logbook;
use Smart\Common\Traits as Traits;

/**
 * Um Store para persistencia do Model no Banco
 *
 * Class Store
 * @package Smart\Data
 */
class Store {
    use Traits\TresultSet,
        Traits\TvalidField;

    const
        INVALID_STATEMENT = "Não foi possível criar a declaração DML para a sua requisição!";

    /**
     * Notações para policy, bind, event do model
     *
     * @var array $reserved
     */
    private static $reserved = array(
		'instance'=>array('Entity'),
		'property'=>array('Policy','Column'),
		'function'=>array('PreInsert','PosInsert','PreUpdate','PosUpdate','PreDelete','PosDelete')
	);

    /**
     * Proxy de Acesso ao Banco de Dados
     *
     * @var null|Proxy
     */
    private $proxy = null;

    /**
     * Model de uma Tabela do Banco de Dados
     *
     * @var null|Model
     */
    private $model = null;

    /**
     * Instância da Sessão
     *
     * @var null|Session
     */
    public $stash = null;

    public function __construct(array $link, $model) {
        $this->stash = new Session();
        $this->model = new $model();
        $this->proxy = new Proxy($link);

        $submit = new Submit($this->getRequest());
        $notate = $this->getAnnotations($this->model);

        $this->model->setSubmit($submit);
        $this->model->setNotate($notate);

        $this->setRecord();

        unset($submit);
        unset($notate);
    }

    private function getRequest() {
        $_POST['action'] = !empty($_GET['action']) ? $_GET['action'] : $_POST['action'];
        $_POST['method'] = !empty($_GET['method']) ? $_GET['method'] : ( !empty($_POST['method']) ? $_POST['method'] : null );
        $request = $_POST;
        $rows = !empty($request['rows']) ? $request['rows'] : '{"rows":[]}';
        $request['rows'] = self::jsonToArray($rows);

        return $request;
    }

    // CRUD
    public function select() {

        try {
            $have = $this->stash->have();

            if($have == false) {
                throw new \PDOException("A sua sessão expirou!");
            }

            $pdo = $this->proxy->sqlSelect($this->model);

            if($this->tryNull($pdo)) {
                throw new \PDOException(self::INVALID_STATEMENT);
            }

            $callback = $pdo->execute();

            if(!$callback) {
                throw new \PDOException(self::$FAILURE_STATEMENT);
            }

            $rows = $pdo->fetchAll();

            self::_setRows($rows);

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
//			self::_setRestart(!$have);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }
    public function update() {

        try {
            $have = $this->stash->have();

            if($have == false) {
                throw new \PDOException("A sua sessão expirou!");
            }

            $this->policy();
            self::_setCrud('update');

            $this->fireEvent('PreUpdate');

            $this->model->getSubmit()->setRawValue('action',self::_getCrud());

            $pdo = $this->proxy->sqlUpdate($this->model);

            if($this->tryNull($pdo)) {
                throw new \PDOException(self::INVALID_STATEMENT);
            }

            $callback = $pdo->execute();

            if(!$callback) {
                throw new \PDOException(self::$FAILURE_STATEMENT);
            }

            new Logbook($this->model);
            $this->fireEvent('PosUpdate');

            self::_setRecords($pdo->rowCount());

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
			self::_setRestart(!$have);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }
    public function insert() {

        try {
            $have = $this->stash->have();

            if($have == false) {
                throw new \PDOException("A sua sessão expirou!");
            }

            $this->policy();
            self::_setCrud('insert');

            $this->fireEvent('PreInsert');

            $this->model->getSubmit()->setRawValue('action',self::_getCrud());

            $pdo = $this->proxy->sqlInsert($this->model);

            if($this->tryNull($pdo)) {
                throw new \PDOException(self::INVALID_STATEMENT);
            }

            $callback = $pdo->execute();

            if(!$callback) {
                throw new \PDOException(self::$FAILURE_STATEMENT);
            }

            $id = $this->proxy->lastInsertId();

            if($id == 0) {
                $id = $this->model->getId();
            }

            $this->model->set('id',$id);

            new Logbook($this->model);
            $this->fireEvent('PosInsert');

            self::_setRows($this->getRecord());

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
			self::_setRestart(!$have);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }
    public function delete() {

        try {
            $have = $this->stash->have();

            if($have == false) {
                throw new \PDOException("A sua sessão expirou!");
            }

            self::_setCrud('delete');

            $this->fireEvent('PreDelete');

            $this->model->getSubmit()->setRawValue('action',self::_getCrud());

            $pdo = $this->proxy->sqlDelete($this->model);

            if($this->tryNull($pdo)) {
                throw new \PDOException(self::INVALID_STATEMENT);
            }

            $callback = $pdo->execute();

            if(!$callback) {
                throw new \PDOException(self::$FAILURE_STATEMENT);
            }

            new Logbook($this->model);
            $this->fireEvent('PosDelete');

            self::_setRecords($pdo->rowCount());

        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
			self::_setRestart(!$have);
            self::_setText($e->getMessage());
        }

        return self::getResultToJson();
    }
    // CRUD

    public function policy() {
        $notate = $this->model->getNotate();
        $submit = $this->model->getSubmit()->getToArray();

        $fields = self::arrayToObject($notate->property);

        foreach ($submit['rows'] as $field => $value) {
            $column = isset($fields->$field) ? $fields->$field : false;
            $hasPolicy = ( isset($column) && isset($column->Column->policy) );

            if( $hasPolicy )  {
                foreach ($column->Policy as $key => $policy) {
                    $method = $key . "Policy";
                    $result = $this->$method($policy,$value);
                    if ( $result->passed === false ) {
                        throw new \PDOException("<b>{$column->Column->description}</b> <br/>{$result->message}");
                    }
                }
            }
        }

        unset($submit);
        unset($notate);
    }

    public function getProxy () {
        return $this->proxy;
    }

    public function setProxy (Proxy &$proxy) {
        $this->proxy = $proxy;
        return $this;
    }

    public function getModel () {
        return $this->model;
    }

    public function setModel ($model) {
        $this->model = $model;
        return $this->model;
    }

    public function getCache () {
        $notate = $this->model->getNotate();
        $cache = $notate->instance->Entity->cache;
        return new $cache($this);
    }

    public function getEvent () {
        $notate = $this->model->getNotate();
        $event = $notate->instance->Entity->event;
        return new $event($this->proxy);
    }

    public function getRecord () {
        return $this->model->getRecord();
    }

    public function setRecord () {
        return $this->model->setRecord();
    }

    private function fireEvent($eventName) {
        $model = $this->model;
        $event = $this->getEvent();
        $method = strtolower($eventName[0]) . substr($eventName, 1);

        if(!method_exists($event, $method)) {
            return false;
        }

        $event->$method($model);
        $this->model = $model;

        unset($event);
        unset($model);
    }

    private function getAnnotations($entity) {
        $object = new \stdClass();
        $object->instance = $this->getAnnotationsInstance($entity);
        $object->property = $this->getAnnotationsProperty($entity);
        $object->function = $this->getAnnotationsFunction($entity);
        return $object;
    }

    private function getAnnotationsInstance($entity) {
        $annotation = new \stdClass();
        $reflection = new \ReflectionClass($entity);
        preg_match_all('#@(.*?)\n#s', $reflection->getDocComment(), $comments);

        foreach (self::$reserved['instance'] as $key) {
            foreach ($comments[1] as $index=>$text) {
                if ( preg_match("/^$key/", $text) ) {
                    $params = trim(preg_replace("/^$key/", '', $text));
                    $annotation->$key = json_decode($params);
                }
            }
        }

        return $annotation;
    }

    private function getAnnotationsProperty($entity) {
        $annotation = [];
        $class = new \ReflectionClass($entity);
        $props = $class->getProperties();

        foreach ($props as $table=>$field) {
            $reflection = new \ReflectionProperty($field->class, $field->name);
            preg_match_all('#@(.*?)\n#s', $reflection->getDocComment(), $comments);
            foreach (self::$reserved['property'] as $key) {
                foreach ($comments[1] as $index=>$text) {
                    if ( preg_match("/^$key/", $text) ) {
                        $params = trim(preg_replace("/^$key/", '', $text));
                        $annotation[$field->name][$key] = json_decode($params);
                    }
                }
            }
        }

        return self::objectToArray($annotation);
    }

    private function getAnnotationsFunction($entity) {
        $annotation = [];
        $class = new \ReflectionClass($entity);
        $props = $class->getMethods();

        foreach ($props as $table=>$function) {
            $reflection = new \ReflectionMethod($function->class, $function->name);
            preg_match_all('#@(.*?)\n#s', $reflection->getDocComment(), $comments);

            foreach (self::$reserved['function'] as $key) {
                foreach ($comments[1] as $index=>$text) {
                    if ( preg_match("/^$key/", $text) ) {
                        $params = trim(preg_replace("/^$key/", '', $text));
                        $annotation[$function->name][$key] = json_decode($params);
                    }
                }
            }
        }

        return self::objectToArray($annotation);
    }

}