<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingcharge extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');

        $utimestamp = microtime(true);
        $timestamp = floor($utimestamp);
        $milliseconds = round(($utimestamp - $timestamp) * 1000000);

        $barcode = substr("L" . date("YmdHis") . $milliseconds,0,20);

        $model->set('barcode',$barcode);
    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function posDelete( &$model ) {

    }

}