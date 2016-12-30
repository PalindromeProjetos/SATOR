<?php

namespace iSterilization\Coach;

use Smart\Utils\Session;

class flowprocessingscreeningbox extends \Smart\Setup\Setup {

    /**
     * @var \iSterilization\Model\flowprocessingscreeningbox $model
     */
    public $model = '\iSterilization\Model\flowprocessingscreeningbox';

    public function select() {
        try {
            Session::hasProfile('','');
            $result = parent::select();
        } catch ( \PDOException $e ) {
            self::_setSuccess(false);
            self::_setText($e->getMessage());
            $result = self::getResultToJson();
        }

        return $result;
    }

}