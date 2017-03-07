<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingstepinput extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingstepinput $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepinput $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingstepinput $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepinput $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepinput $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepinput $model
     */
    public function posDelete( &$model ) {

    }

}