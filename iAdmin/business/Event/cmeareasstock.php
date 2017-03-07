<?php

namespace iAdmin\Event;

use Smart\Utils\Session;

class cmeareasstock extends \Smart\Data\Event {

    /**
     * @param $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param $model
     */
    public function posDelete( &$model ) {

    }

}