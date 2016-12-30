<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingscreeningbox extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function preInsert( \iSterilization\Model\flowprocessingscreeningbox &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function posInsert( \iSterilization\Model\flowprocessingscreeningbox &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function preUpdate( \iSterilization\Model\flowprocessingscreeningbox &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function posUpdate( \iSterilization\Model\flowprocessingscreeningbox &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function preDelete( \iSterilization\Model\flowprocessingscreeningbox &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function posDelete( \iSterilization\Model\flowprocessingscreeningbox &$model ) {

    }

}