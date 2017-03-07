<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class serviceregistration extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\serviceregistration $model
     */
    public function preInsert( &$model ) {
        $date = date('Y-m-d');
        $user = $this->getProxy()->session->username;

        Session::hasProfile('','');

		$model->set('begintime',$date);
		$model->set('resultstate','L');
		$model->set('begintimeusername',$user);
    }

    /**
     * @param \iSterilization\Model\serviceregistration $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\serviceregistration $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\serviceregistration $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param \iSterilization\Model\serviceregistration $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\serviceregistration $model
     */
    public function posDelete( &$model ) {

    }

}