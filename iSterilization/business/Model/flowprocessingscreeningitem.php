<?php

namespace iSterilization\Model;

/**
 * @Entity {"name":"flowprocessingscreeningitem", "logbook":true, "cache":"\\iSterilization\\Cache\\flowprocessingscreeningitem", "event":"\\iSterilization\\Event\\flowprocessingscreeningitem"}
 */
class flowprocessingscreeningitem extends \Smart\Data\Model {

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
    private $materialid;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $materialboxid;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $armorymovementoutputid;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $sterilizationtypeid;

    /**
     * @Policy {"nullable":false, "length":0}
     * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
     */
    private $dataflowstep;

	/**
	 * @Policy {"nullable":true, "length":0}
	 * @Column {"description":"", "type":"string", "policy":true, "logallow":true, "default":""}
	 */
	private $hasexception;

    /**
     * @Policy {"nullable":false}
     * @Column {"description":"", "type":"integer", "policy":true, "logallow":true, "default":""}
     */
    private $clientid;

    /**
     * @Policy {"nullable":true}
     * @Column {"description":"", "type":"formula", "policy":false, "logallow":true, "default":"getNameSearch,clientid,client"}
     */
    private $clientname;

    /**
     * @return type integer
     */
    public function getId() {
        return $this->id;
    }

    /**
     * @param type $id
     * @return \iSterilization\Model\flowprocessingscreeningitem
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
     * @return \iSterilization\Model\flowprocessingscreeningitem
     */
    public function setFlowprocessingscreeningid($flowprocessingscreeningid) {
        $this->flowprocessingscreeningid = $flowprocessingscreeningid;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getMaterialid() {
        return $this->materialid;
    }

    /**
     * @param type $materialid
     * @return \iSterilization\Model\flowprocessingscreeningitem
     */
    public function setMaterialid($materialid) {
        $this->materialid = $materialid;
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
     * @return \iSterilization\Model\flowprocessingscreeningitem
     */
    public function setMaterialboxid($materialboxid) {
        $this->materialboxid = $materialboxid;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getArmorymovementoutputid() {
        return $this->armorymovementoutputid;
    }

    /**
     * @param type $armorymovementoutputid
     * @return \iSterilization\Model\flowprocessingscreeningitem
     */
    public function setArmorymovementoutputid($armorymovementoutputid) {
        $this->armorymovementoutputid = $armorymovementoutputid;
        return $this;
    }

    /**
     * @return type integer
     */
    public function getSterilizationtypeid() {
        return $this->sterilizationtypeid;
    }

    /**
     * @param type $sterilizationtypeid
     * @return \iSterilization\Model\flowprocessingscreeningitem
     */
    public function setSterilizationtypeid($sterilizationtypeid) {
        $this->sterilizationtypeid = $sterilizationtypeid;
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
     * @return \iSterilization\Model\flowprocessingscreeningitem
     */
    public function setDataflowstep($dataflowstep) {
        $this->dataflowstep = $dataflowstep;
        return $this;
    }

	/**
	 * @return type string
	 */
	public function getHasexception() {
		return $this->hasexception;
	}

	/**
	 * @param type $hasexception
	 * @return \iSterilization\Model\flowprocessingscreeningitem
	 */
	public function setHasexception($hasexception) {
		$this->hasexception = $hasexception;
		return $this;
	}

    /**
     * @return type integer
     */
    public function getClientid() {
        return $this->clientid;
    }

    /**
     * @param type $clientid
     * @return \iSterilization\Model\flowprocessingscreeningitem
     */
    public function setClientid($clientid) {
        $this->clientid = $clientid;
        return $this;
    }

}