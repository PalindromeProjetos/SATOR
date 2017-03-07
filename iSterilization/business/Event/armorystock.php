<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class armorystock extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\armorystock $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\armorystock $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\armorystock $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\armorystock $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param \iSterilization\Model\armorystock $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\armorystock $model
     */
    public function posDelete( &$model ) {

    }

}