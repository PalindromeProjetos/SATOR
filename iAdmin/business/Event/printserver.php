<?php

namespace iAdmin\Event;

use Smart\Utils\Session;

class printserver extends \Smart\Data\Event {

    /**
     * @param \iAdmin\Model\printserver $model
     */
    public function preInsert( \iAdmin\Model\printserver &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iAdmin\Model\printserver $model
     */
    public function posInsert( \iAdmin\Model\printserver &$model ) {

    }

    /**
     * @param \iAdmin\Model\printserver $model
     */
    public function preUpdate( \iAdmin\Model\printserver &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iAdmin\Model\printserver $model
     */
    public function posUpdate( \iAdmin\Model\printserver &$model ) {
    }

    /**
     * @param \iAdmin\Model\printserver $model
     */
    public function preDelete( \iAdmin\Model\printserver &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iAdmin\Model\printserver $model
     */
    public function posDelete( \iAdmin\Model\printserver &$model ) {

    }

}