<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingscreeningbox extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public function posDelete( &$model ) {

    }

}