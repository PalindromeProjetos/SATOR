<?php

namespace Smart\Common;

use Smart\Data\Store;
use Smart\Data\Model;
use Smart\Common\Traits as Traits;

/**
 * Ancestral para as classes do tipo Coach
 *
 * @methods: getStore, getProxy, selectCode, selectLike, selectSame, selectDown, selectLoad
 * @category Coach
 */
class Coach {
    use Traits\TresultSet,
        Traits\TvalidField;

    public $usr = "";
    public $pwd = "";
    public $dns = "";

    /**
     * @var string
     */
    public $model = null;

    /**
     * @var Store $store
     */
    private $store = null;

    public function __construct() {

        $link = array($this->dns, $this->usr, $this->pwd);

        $this->store = new Store($link, $this->model);
    }

    public function getStore () {
        return $this->store;
    }

    public function select() {
        $cache = $this->store->getCache();
        $model = $this->store->getModel();

        $submit = $model->getSubmit();
        $method = $submit->getRawValue('method');

        $data = $submit->getToArray();

        $results = $cache->$method($data);

        return $results;
    }

    public function update() {
        $submit = $this->store->getModel()->getSubmit();

        $id = $submit->getRowValue('id');

        $update = isset($id) ? strlen($id) !== 0 : false;

        if( $update == true ) {
            $results = $this->store->update();
        } else {
            $results = $this->store->insert();
        }

        return self::jsonToObject($results)->success ? $this->store->select() : $results;
    }

    public function upload() {
        $model = $this->store->getModel();
        $proxy = $this->store->getProxy();

        $tempName = isset($_FILES["filedata"]) ? $_FILES["filedata"]["tmp_name"] : null;

        if(is_uploaded_file($tempName)) {
            $submit = $model->getSubmit();

            $record = array(
                "id"=>$submit->getRawValue('id'),
                "tablename"=>$submit->getRawValue('tablename')
            );

            $method = $submit->getRawValue('method');
            $result = $proxy->$method($record);

            self::_setRecords($result);
        }

        return self::getResultToJson();
    }

    public function delete() {
        $results = $this->store->delete();
        return $results;
    }

    public function modify() {
        $cache = $this->store->getCache();
        $model = $this->store->getModel();

        $submit = $model->getSubmit();
        $method = $submit->getRawValue('method');

        $data = $submit->getToArray();

        $results = $cache->$method($data);

        return $results;
    }

    public function getfile() {
        $model = $this->store->getModel();
        $proxy = $this->store->getProxy();
        $method = $model->getSubmit()->getRawValue('method');

        $proxy->$method();
    }

    /**
     * Chama o método armazenado no indice <code>action<code/>
     *
     * @return json <code>$result<code/>
     */
    public function callAction() {
        $action = $this->store->getModel()->getSubmit()->getRawValue('action');
        return method_exists($this, $action) ? call_user_func(array($this, $action)) : $this->UNEXPECTED_COMMAND;
    }

}