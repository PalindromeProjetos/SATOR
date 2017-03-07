<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingscreening extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');

        $screeningdate = date("Ymd H:i:s");

        $model->set('screeningdate',$screeningdate);
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreening $model
     */
    public function posDelete( &$model ) {

    }

}