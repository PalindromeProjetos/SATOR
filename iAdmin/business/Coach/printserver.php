<?php

namespace iAdmin\Coach;

use Smart\Utils\Session;

class printserver extends \Smart\Setup\Setup {

    /**
     * @var \iAdmin\Model\printserver $model
     */
    public $model = '\iAdmin\Model\printserver';

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