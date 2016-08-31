<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingstepaction extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function preInsert( \iSterilization\Model\flowprocessingstepaction &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function posInsert( \iSterilization\Model\flowprocessingstepaction &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function preUpdate( \iSterilization\Model\flowprocessingstepaction &$model ) {
        Session::hasProfile('','');
        $authorizedby = $model->getAuthorizedby();

        if((isset($authorizedby)) && (strlen($authorizedby) != 0)) {
            $dateto = date("Ymd H:i:s");
            $model->set('dateto',$dateto);
        }
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function posUpdate( \iSterilization\Model\flowprocessingstepaction &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function preDelete( \iSterilization\Model\flowprocessingstepaction &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function posDelete( \iSterilization\Model\flowprocessingstepaction &$model ) {

    }

}