<?php

namespace iSterilization\Model;

/**
 * 
 * @Entity {"name":"flowprocessingstep", "logbook":true, "cache":"\\iSterilization\\Cache\\flowprocessingstep", "event":"\\iSterilization\\Event\\flowprocessingstep"}
 */
class flowprocessingstep extends \Smart\Data\Model {

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "strategy":"AUTO", "type":"integer", "policy":false, "logallow":true, "default":""}
     */
    private $id;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $flowprocessingid;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $steppriority;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $steplevel;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $source;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $target;

    /**
     * @Policy {"nullable":true, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $username;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $elementtype;

    /**
     * @Policy {"nullable":true, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $elementname;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $stepflaglist;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $stepsettings;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $areasid;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $equipmentid;

    /**
     * @Policy {"nullable":false, "length":3}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":"'000'"}
     */
    private $flowstepstatus;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $datestart;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $datefinal;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $exceptionby;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $exceptiondo;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":""}
     */
    private $useppe;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $stepchoice;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":""}
     */
    private $flowchoice;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"boolean", "policy":true, "logallow":true, "default":""}
     */
    private $flowbreach;

    /**
     * @return type integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param type $id
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setId($id) {
        $this->id = $id;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getFlowprocessingid() {
        return $this->flowprocessingid;
    }

    /**
     * @param type $flowprocessingid
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setFlowprocessingid($flowprocessingid) {
        $this->flowprocessingid = $flowprocessingid;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getSteppriority() {
        return $this->steppriority;
    }

    /**
     * @param type $steppriority
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setSteppriority($steppriority) {
        $this->steppriority = $steppriority;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getSteplevel() {
        return $this->steplevel;
    }

    /**
     * @param type $steplevel
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setSteplevel($steplevel) {
        $this->steplevel = $steplevel;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getSource() {
        return $this->source;
    }

    /**
     * @param type $source
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setSource($source) {
        $this->source = $source;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getTarget() {
        return $this->target;
    }

    /**
     * @param type $target
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setTarget($target) {
        $this->target = $target;
        return $this;
    }

    /**
     * @return type string
     */
    public function getUsername() {
        return $this->username;
    }

    /**
     * @param type $username
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setUsername($username) {
        $this->username = $username;
        return $this;
    }

    /**
     * @return type string
     */
    public function getElementtype() {
        return $this->elementtype;
    }

    /**
     * @param type $elementtype
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setElementtype($elementtype) {
        $this->elementtype = $elementtype;
        return $this;
    }

    /**
     * @return type string
     */
    public function getElementname() {
        return $this->elementname;
    }

    /**
     * @param type $elementname
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setElementname($elementname) {
        $this->elementname = $elementname;
        return $this;
    }

    /**
     * @return type string
     */
    public function getStepflaglist() {
        return $this->stepflaglist;
    }

    /**
     * @param type $stepflaglist
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setStepflaglist($stepflaglist) {
        $this->stepflaglist = $stepflaglist;
        return $this;
    }

    /**
     * @return type string
     */
    public function getStepsettings() {
        return $this->stepsettings;
    }

    /**
     * @param type $stepsettings
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setStepsettings($stepsettings) {
        $this->stepsettings = $stepsettings;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getAreasid() {
        return $this->areasid;
    }

    /**
     * @param type $areasid
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setAreasid($areasid) {
        $this->areasid = $areasid;
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
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setEquipmentid($equipmentid) {
        $this->equipmentid = $equipmentid;
        return $this;
    }

    /**
     * @return type string
     */
    public function getFlowstepstatus() {
        return $this->flowstepstatus;
    }

    /**
     * @param type $flowstepstatus
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setFlowstepstatus($flowstepstatus) {
        $this->flowstepstatus = $flowstepstatus;
        return $this;
    }

    /**
     * @return type string
     */
    public function getDatestart() {
        return $this->datestart;
    }

    /**
     * @param type $datestart
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setDatestart($datestart) {
        $this->datestart = $datestart;
        return $this;
    }

    /**
     * @return type string
     */
    public function getDatefinal() {
        return $this->datefinal;
    }

    /**
     * @param type $datefinal
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setDatefinal($datefinal) {
        $this->datefinal = $datefinal;
        return $this;
    }

    /**
     * @return type string
     */
    public function getExceptionby() {
        return $this->exceptionby;
    }

    /**
     * @param type $exceptionby
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setExceptionby($exceptionby) {
        $this->exceptionby = $exceptionby;
        return $this;
    }

    /**
     * @return type string
     */
    public function getExceptiondo() {
        return $this->exceptiondo;
    }

    /**
     * @param type $exceptiondo
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setExceptiondo($exceptiondo) {
        $this->exceptiondo = $exceptiondo;
        return $this;
    }

    /**
     * @return type boolean
     */
    public function getUseppe() {
        return $this->useppe;
    }

    /**
     * @param type $useppe
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setUseppe($useppe) {
        $this->useppe = $useppe;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getStepchoice() {
        return $this->stepchoice;
    }

    /**
     * @param type $stepchoice
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setStepchoice($stepchoice) {
        $this->stepchoice = $stepchoice;
        return $this;
    }

    /**
     * @return type boolean
     */
    public function getFlowchoice() {
        return $this->flowchoice;
    }

    /**
     * @param type $flowchoice
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setFlowchoice($flowchoice) {
        $this->flowchoice = $flowchoice;
        return $this;
    }

    /**
     * @return type boolean
     */
    public function getFlowbreach() {
        return $this->flowbreach;
    }

    /**
     * @param type $flowbreach
     * @return \iSterilization\Model\flowprocessingstep
     */
    public function setFlowbreach($flowbreach) {
        $this->flowbreach = $flowbreach;
        return $this;
    }

}