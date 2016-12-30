<?php

namespace iSterilization\Model;

/**
 * 
 * @Entity {"name":"flowprocessingscreeningbox", "logbook":true, "cache":"\\iSterilization\\Cache\\flowprocessingscreeningbox", "event":"\\iSterilization\\Event\\flowprocessingscreeningbox"}
 */
class flowprocessingscreeningbox extends \Smart\Data\Model {

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "strategy":"AUTO", "type":"integer", "policy":false, "logallow":true, "default":""}
     */
    private $id;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $flowprocessingscreeningid;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $materialboxid;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $items;

    /**
     * @return type integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param type $id
     * @return \iSterilization\Model\flowprocessingscreeningbox
     */
    public function setId($id) {
        $this->id = $id;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getFlowprocessingscreeningid() {
        return $this->flowprocessingscreeningid;
    }

    /**
     * @param type $flowprocessingscreeningid
     * @return \iSterilization\Model\flowprocessingscreeningbox
     */
    public function setFlowprocessingscreeningid($flowprocessingscreeningid) {
        $this->flowprocessingscreeningid = $flowprocessingscreeningid;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getMaterialboxid() {
        return $this->materialboxid;
    }

    /**
     * @param type $materialboxid
     * @return \iSterilization\Model\flowprocessingscreeningbox
     */
    public function setMaterialboxid($materialboxid) {
        $this->materialboxid = $materialboxid;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getItems() {
        return $this->items;
    }

    /**
     * @param type $items
     * @return \iSterilization\Model\flowprocessingscreeningbox
     */
    public function setItems($items) {
        $this->items = $items;
        return $this;
    }

}