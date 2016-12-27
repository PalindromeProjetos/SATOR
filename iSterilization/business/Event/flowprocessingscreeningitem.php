<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingscreeningitem extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingscreeningitem $model
     */
    public function preInsert( \iSterilization\Model\flowprocessingscreeningitem &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningitem $model
     */
    public function posInsert( \iSterilization\Model\flowprocessingscreeningitem &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningitem $model
     */
    public function preUpdate( \iSterilization\Model\flowprocessingscreeningitem &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningitem $model
     */
    public function posUpdate( \iSterilization\Model\flowprocessingscreeningitem &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningitem $model
     */
    public function preDelete( \iSterilization\Model\flowprocessingscreeningitem &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningitem $model
     */
    public function posDelete( \iSterilization\Model\flowprocessingscreeningitem &$model ) {

    }

}