<?php

namespace iAdmin\Model;

/**
 * 
 * @Entity {"name":"sterilizationtype", "logbook":true, "cache":"\\iAdmin\\Cache\\sterilizationtype", "event":"\\iAdmin\\Event\\sterilizationtype"}
 */
class sterilizationtype extends \Smart\Data\Model {

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "strategy":"AUTO", "type":"integer", "policy":false, "logallow":true, "default":""}
     */
    private $id;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $name;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $description;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $graphpaper;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $dataflowrule;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $dataflowstep;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":"1"}
     */
    private $authenticate;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":"1"}
     */
    private $isactive;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":"1"}
     */
    private $version;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":"1"}
     */
    private $validity;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":"001"}
     */
    private $flowtype;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"formula", "policy":false, "logallow":true, "default":"getEnumSearch,flowtype"}
     */
    private $flowtypedescription;

    /**
     * @return type integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param type $id
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setId($id) {
        $this->id = $id;
        return $this;
    }

    /**
     * @return type string
     */
    public function getName() {
        return $this->name;
    }

    /**
     * @param type $name
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setName($name) {
        $this->name = $name;
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
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setDescription($description) {
        $this->description = $description;
        return $this;
    }

    /**
     * @return type string
     */
    public function getGraphpaper() {
        return $this->graphpaper;
    }

    /**
     * @param type $graphpaper
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setGraphpaper($graphpaper) {
        $this->graphpaper = $graphpaper;
        return $this;
    }

    /**
     * @return type string
     */
    public function getDataflowrule() {
        return $this->dataflowrule;
    }

    /**
     * @param type $dataflowrule
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setDataflowrule($dataflowrule) {
        $this->dataflowrule = $dataflowrule;
        return $this;
    }

    /**
     * @return type string
     */
    public function getDataflowstep() {
        return $this->dataflowstep;
    }

    /**
     * @param type $dataflowstep
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setDataflowstep($dataflowstep) {
        $this->dataflowstep = $dataflowstep;
        return $this;
    }

    /**
     * @return type boolean
     */
    public function getAuthenticate() {
        return $this->authenticate;
    }

    /**
     * @param type $authenticate
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setAuthenticate($authenticate) {
        $this->authenticate = $authenticate;
        return $this;
    }

    /**
     * @return type boolean
     */
    public function getIsactive() {
        return $this->isactive;
    }

    /**
     * @param type $isactive
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setIsactive($isactive) {
        $this->isactive = $isactive;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getVersion() {
        return $this->version;
    }

    /**
     * @param type $version
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setVersion($version) {
        $this->version = $version;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getValidity() {
        return $this->validity;
    }

    /**
     * @param type $validity
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setValidity($validity) {
        $this->validity = $validity;
        return $this;
    }

    /**
     * @return type string
     */
    public function getFlowtype() {
        return $this->flowtype;
    }

    /**
     * @param type $flowtype
     * @return \iAdmin\Model\sterilizationtype
     */
    public function setFlowtype($flowtype) {
        $this->flowtype = $flowtype;
        return $this;
    }

}