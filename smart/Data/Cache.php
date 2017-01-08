<?php

namespace Smart\Data;

use Smart\Utils\Session;
use Smart\Common\Traits as Traits;

/**
 * Ancestral para as classes do tipo Cache
 * 
 * @methods: getStore, selectCode, selectLike, selectSame, selectDown, selectLoad
 * @category Cache
 * 
 */
class Cache {
    use Traits\TresultSet,
        Traits\TvalidField,
        Traits\TuserHandler;

    /**
     * Store de Acesso ao Banco de Dados
     * Permite o Crude e statements SQL´s
     *
     * @var null|Store
     */
    private $store = null;

    /**
     * Instância da Sessão
     */
    public $stash = null;

    /**
     * @param Store $store
     */
    public function __construct( \Smart\Data\Store &$store ) {
        $this->store = $store;
        $this->stash = new Session();
    }

    public function getStore (){
        return $this->store;
    }

    public function selectCode(array $data) {
        return $this->store->select();
    }

    public function selectLike(array $data) {
        $p = $f = array();
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $proxy = $this->getStore()->getProxy();
        $params = json_decode($data['params']);
        $notate = $this->getStore()->getModel()->getNotate();
        $extend = $notate->instance->Entity->name;
        $fields = (isset($data['fields']) && count(json_decode($data['fields'])) !== 0) ? json_decode($data['fields']) : self::objectToArray($notate->property);

        // get fields
        foreach ($fields as $key => $value) {
            $f[] = $proxy->fieldType($notate,$key);
        }

        // get params
        foreach ($params as $key => $value) {
            $p[] = "$value LIKE :$value";
        }

        $sql = "SELECT " .implode(',', $f). " FROM {$extend} WHERE " . implode(' OR ', $p);

        try {

            $query = "%{$query}%";

            $pdo = $proxy->prepare($sql);
            
            // set params
            foreach ($params as $key => $value) {
                $pdo->bindValue(":$value", $query, \PDO::PARAM_STR);
            }

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
    
    public function selectSame(array $data) {
        $p = $f = array();
        $query = $data['query'];
        $start = $data['start'];
        $limit = $data['limit'];
        $proxy = $this->getStore()->getProxy();
		$params = json_decode($data['params']);		
        $notate = $this->getStore()->getModel()->getNotate();
        $extend = $notate->instance->Entity->name;
        $fields = (isset($data['fields']) && count(json_decode($data['fields'])) !== 0) ? json_decode($data['fields']) : self::objectToArray($notate->property);

        // get fields
        foreach ($fields as $key => $value) {
            $f[] = $proxy->getFormula($notate,$key);
        }

        // get params
        foreach ($params as $key => $value) {
            $p[] = "$value = :$value";
        }

        $sql = "SELECT " .implode(',', $f). " FROM {$extend} WHERE " . implode(' AND ', $p);

        try {
            
            $pdo = $proxy->prepare($sql);

            // set params
            foreach ($params as $key => $value) {
                $pdo->bindValue(":$value", "$query", \PDO::PARAM_STR);
            }
            
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
    
    public function selectDown(array $data) {
        $this->downFile($data);
    }

    public function selectLoad(array $data) {
        $this->loadFile($data);
    }
    
}