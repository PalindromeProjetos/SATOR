<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingcharge extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function preInsert( \iSterilization\Model\flowprocessingcharge &$model ) {
        Session::hasProfile('','');

        $utimestamp = microtime(true);
        $timestamp = floor($utimestamp);
        $milliseconds = round(($utimestamp - $timestamp) * 1000000);

        $barcode = substr("L" . date("YmdHis") . $milliseconds,0,20);

        $model->set('barcode',$barcode);
//        $model->set('chargeflag','001');
    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function posInsert( \iSterilization\Model\flowprocessingcharge &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function preUpdate( \iSterilization\Model\flowprocessingcharge &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function posUpdate( \iSterilization\Model\flowprocessingcharge &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function preDelete( \iSterilization\Model\flowprocessingcharge &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingcharge $model
     */
    public function posDelete( \iSterilization\Model\flowprocessingcharge &$model ) {

    }

}