<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingstepmaterial extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingstepmaterial $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepmaterial $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingstepmaterial $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');

        $dateto = date("Ymd H:i:s");
        $model->set('dateto',$dateto);
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepmaterial $model
     */
    public function posUpdate( &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingstepmaterial $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepmaterial $model
     */
    public function posDelete( &$model ) {

    }

}