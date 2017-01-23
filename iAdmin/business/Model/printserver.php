<?php

namespace iAdmin\Model;

/**
 * 
 * @Entity {"name":"printserver", "logbook":true, "cache":"\\iAdmin\\Cache\\printserver", "event":"\\iAdmin\\Event\\printserver"}
 */
class printserver extends \Smart\Data\Model {

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "strategy":"AUTO", "type":"integer", "policy":false, "logallow":true, "default":""}
     */
    private $id;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $printlocate;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $description;

    /**
     * @return type integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param type $id
     * @return \iAdmin\Model\printserver
     */
    public function setId($id) {
        $this->id = $id;
        return $this;
    }

    /**
     * @return type string
     */
    public function getPrintlocate() {
        return $this->printlocate;
    }

    /**
     * @param type $printlocate
     * @return \iAdmin\Model\printserver
     */
    public function setPrintlocate($printlocate) {
        $this->printlocate = $printlocate;
        return $this;
    }

    /**
     * @return type string
     */
    public function getDescription() {
        return $this->description;
    }

    /**
     * @param type $description
     * @return \iAdmin\Model\printserver
     */
    public function setDescription($description) {
        $this->description = $description;
        return $this;
    }

}