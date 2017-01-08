<?php

namespace iAdmin\Model;

/**
 * 
 * @Entity {"name":"areas", "logbook":true, "cache":"\\iAdmin\\Cache\\areas", "event":"\\iAdmin\\Event\\areas"}
 */
class areas extends \Smart\Data\Model {

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
     * @Policy {"nullable":false, "length":20}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $barcode;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $workstation;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":"0"}
     */
    private $startreader;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $printlocate;

    /**
     * @Policy {"nullable":false, "length":1}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":"A"}
     */
    private $areastype;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":""}
     */
    private $sterilizationflow;

    /**
     * @Policy {"nullable":true, "length":20}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $sterilizationname;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":"1"}
     */
    private $isactive;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $orderby;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":"0"}
     */
    private $hasstock;

    /**
     * @return type integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param type $id
     * @return \iAdmin\Model\areas
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
     * @return \iAdmin\Model\areas
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
     * @return \iAdmin\Model\areas
     */
    public function setDescription($description) {
        $this->description = $description;
        return $this;
    }

    /**
     * @return type string
     */
    public function getBarcode() {
        return $this->barcode;
    }

    /**
     * @param type $barcode
     * @return \iAdmin\Model\areas
     */
    public function setBarcode($barcode) {
        $this->barcode = $barcode;
        return $this;
    }

    /**
     * @return type string
     */
    public function getWorkstation() {
        return $this->workstation;
    }

    /**
     * @param type $workstation
     * @return \iAdmin\Model\areas
     */
    public function setWorkstation($workstation) {
        $this->workstation = $workstation;
        return $this;
    }

    /**
     * @return type boolean
     */
    public function getStartreader() {
		return $this->startreader;
    }

    /**
     * @param type $startreader
     * @return \iAdmin\Model\areas
     */
	public function setStartreader($startreader) {
        $this->startreader = $startreader;
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
     * @return \iAdmin\Model\areas
     */
    public function setPrintlocate($printlocate) {
        $this->printlocate = $printlocate;
        return $this;
    }

    /**
     * @return type string
     */
    public function getAreastype() {
        return $this->areastype;
    }

    /**
     * @param type $areastype
     * @return \iAdmin\Model\areas
     */
    public function setAreastype($areastype) {
        $this->areastype = $areastype;
        return $this;
    }

    /**
     * @return type boolean
     */
    public function getSterilizationflow() {
        return $this->sterilizationflow;
    }

    /**
     * @param type $sterilizationflow
     * @return \iAdmin\Model\areas
     */
    public function setSterilizationflow($sterilizationflow) {
        $this->sterilizationflow = $sterilizationflow;
        return $this;
    }

    /**
     * @return type string
     */
    public function getSterilizationname() {
        return $this->sterilizationname;
    }

    /**
     * @param type $sterilizationname
     * @return \iAdmin\Model\areas
     */
    public function setSterilizationname($sterilizationname) {
        $this->sterilizationname = $sterilizationname;
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
     * @return \iAdmin\Model\areas
     */
    public function setIsactive($isactive) {
        $this->isactive = $isactive;
        return $this;
    }

    /**
     * @return type boolean
     */
    public function getHasstock() {
        return $this->hasstock;
    }

    /**
     * @param type $hasstock
     * @return \iAdmin\Model\areas
     */
    public function setHasstock($hasstock) {
        $this->hasstock = $hasstock;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getOrderby() {
        return $this->orderby;
    }

    /**
     * @param type $orderby
     * @return \iAdmin\Model\areas
     */
    public function setOrderby($orderby) {
        $this->orderby = $orderby;
        return $this;
    }	
	
}