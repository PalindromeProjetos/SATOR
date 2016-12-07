<?php

namespace iSterilization\Model;

/**
 * 
 * @Entity {"name":"flowprocessingcharge", "logbook":true, "cache":"\\iSterilization\\Cache\\flowprocessingcharge", "event":"\\iSterilization\\Event\\flowprocessingcharge"}
 */
class flowprocessingcharge extends \Smart\Data\Model {

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "strategy":"AUTO", "type":"integer", "policy":false, "logallow":true, "default":""}
     */
    private $id;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $equipmentid;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $equipmentcycleid;

    /**
     * @Policy {"nullable":false, "length":20}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $barcode;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $chargeuser;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $chargedate;

    /**
     * @Policy {"nullable":false, "length":3}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":"001"}
     */
    private $chargeflag;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $cyclestart;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $cyclefinal;

    /**
     * @Policy {"nullable":true, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $cyclestartuser;

    /**
     * @Policy {"nullable":true, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $cyclefinaluser;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $duration;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $temperature;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $timetoopen;

    /**
     * @return type integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param type $id
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setId($id) {
        $this->id = $id;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getEquipmentid() {
        return $this->equipmentid;
    }

    /**
     * @param type $equipmentid
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setEquipmentid($equipmentid) {
        $this->equipmentid = $equipmentid;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getEquipmentcycleid() {
        return $this->equipmentcycleid;
    }

    /**
     * @param type $equipmentcycleid
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setEquipmentcycleid($equipmentcycleid) {
        $this->equipmentcycleid = $equipmentcycleid;
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
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setBarcode($barcode) {
        $this->barcode = $barcode;
        return $this;
    }

    /**
     * @return type string
     */
    public function getChargeuser() {
        return $this->chargeuser;
    }

    /**
     * @param type $chargeuser
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setChargeuser($chargeuser) {
        $this->chargeuser = $chargeuser;
        return $this;
    }

    /**
     * @return type string
     */
    public function getChargedate() {
        return $this->chargedate;
    }

    /**
     * @param type $chargedate
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setChargedate($chargedate) {
        $this->chargedate = $chargedate;
        return $this;
    }

    /**
     * @return type string
     */
    public function getChargeflag() {
        return $this->chargeflag;
    }

    /**
     * @param type $chargeflag
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setChargeflag($chargeflag) {
        $this->chargeflag = $chargeflag;
        return $this;
    }

    /**
     * @return type string
     */
    public function getCyclestart() {
        return $this->cyclestart;
    }

    /**
     * @param type $cyclestart
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setCyclestart($cyclestart) {
        $this->cyclestart = $cyclestart;
        return $this;
    }

    /**
     * @return type string
     */
    public function getCyclefinal() {
        return $this->cyclefinal;
    }

    /**
     * @param type $cyclefinal
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setCyclefinal($cyclefinal) {
        $this->cyclefinal = $cyclefinal;
        return $this;
    }

    /**
     * @return type string
     */
    public function getCyclestartuser() {
        return $this->cyclestartuser;
    }

    /**
     * @param type $cyclestartuser
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setCyclestartuser($cyclestartuser) {
        $this->cyclestartuser = $cyclestartuser;
        return $this;
    }

    /**
     * @return type string
     */
    public function getCyclefinaluser() {
        return $this->cyclefinaluser;
    }

    /**
     * @param type $cyclefinaluser
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setCyclefinaluser($cyclefinaluser) {
        $this->cyclefinaluser = $cyclefinaluser;
        return $this;
    }

    /**
     * @return type string
     */
    public function getDuration() {
        return $this->duration;
    }

    /**
     * @param type $duration
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setDuration($duration) {
        $this->duration = $duration;
        return $this;
    }

    /**
     * @return type string
     */
    public function getTemperature() {
        return $this->temperature;
    }

    /**
     * @param type $temperature
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setTemperature($temperature) {
        $this->temperature = $temperature;
        return $this;
    }

    /**
     * @return type string
     */
    public function getTimetoopen() {
        return $this->timetoopen;
    }

    /**
     * @param type $timetoopen
     * @return \iSterilization\Model\flowprocessingcharge
     */
    public function setTimetoopen($timetoopen) {
        $this->timetoopen = $timetoopen;
        return $this;
    }

}