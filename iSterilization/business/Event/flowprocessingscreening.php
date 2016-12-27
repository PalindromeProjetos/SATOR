<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingscreening extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function preInsert( \iSterilization\Model\flowprocessingscreening &$model ) {
        Session::hasProfile('','');

        $screeningdate = date("Ymd H:i:s");

        $model->set('screeningdate',$screeningdate);
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function posInsert( \iSterilization\Model\flowprocessingscreening &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function preUpdate( \iSterilization\Model\flowprocessingscreening &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function posUpdate( \iSterilization\Model\flowprocessingscreening &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function preDelete( \iSterilization\Model\flowprocessingscreening &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function posDelete( \iSterilization\Model\flowprocessingscreening &$model ) {

    }

}