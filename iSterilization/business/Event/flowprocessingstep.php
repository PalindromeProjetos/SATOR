<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingstep extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingstep $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstep $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingstep $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstep $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingstep $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstep $model
     */
    public function posDelete( &$model ) {

    }

}