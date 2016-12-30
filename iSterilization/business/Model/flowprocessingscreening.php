<?php

namespace iSterilization\Model;

/**
 * 
 * @Entity {"name":"flowprocessingscreening", "logbook":true, "cache":"\\iSterilization\\Cache\\flowprocessingscreening", "event":"\\iSterilization\\Event\\flowprocessingscreening"}
 */
class flowprocessingscreening extends \Smart\Data\Model {

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "strategy":"AUTO", "type":"integer", "policy":false, "logallow":true, "default":""}
     */
    private $id;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $areasid;

    /**
     * @Policy {"nullable":false, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $screeninguser;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $screeningdate;

    /**
     * @Policy {"nullable":true, "length":80}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $closedby;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $closeddate;

    /**
     * @Policy {"nullable":false, "length":3}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $screeningflag;

    /**
     * @return type integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param type $id
     * @return \iSterilization\Model\flowprocessingscreening
     */
    public function setId($id) {
        $this->id = $id;
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
     * @return \iSterilization\Model\flowprocessingscreening
     */
    public function setAreasid($areasid) {
        $this->areasid = $areasid;
        return $this;
    }

    /**
     * @return type string
     */
    public function getScreeninguser() {
        return $this->screeninguser;
    }

    /**
     * @param type $screeninguser
     * @return \iSterilization\Model\flowprocessingscreening
     */
    public function setScreeninguser($screeninguser) {
        $this->screeninguser = $screeninguser;
        return $this;
    }

    /**
     * @return type string
     */
    public function getScreeningdate() {
        return $this->screeningdate;
    }

    /**
     * @param type $screeningdate
     * @return \iSterilization\Model\flowprocessingscreening
     */
    public function setScreeningdate($screeningdate) {
        $this->screeningdate = $screeningdate;
        return $this;
    }

    /**
     * @return type string
     */
    public function getClosedby() {
        return $this->closedby;
    }

    /**
     * @param type $closedby
     * @return \iSterilization\Model\flowprocessingscreening
     */
    public function setClosedby($closedby) {
        $this->closedby = $closedby;
        return $this;
    }

    /**
     * @return type string
     */
    public function getCloseddate() {
        return $this->closeddate;
    }

    /**
     * @param type $closeddate
     * @return \iSterilization\Model\flowprocessingscreening
     */
    public function setCloseddate($closeddate) {
        $this->closeddate = $closeddate;
        return $this;
    }

    /**
     * @return type string
     */
    public function getScreeningflag() {
        return $this->screeningflag;
    }

    /**
     * @param type $screeningflag
     * @return \iSterilization\Model\flowprocessingscreening
     */
    public function setScreeningflag($screeningflag) {
        $this->screeningflag = $screeningflag;
        return $this;
    }

}