<?php

namespace iAdmin\Coach;

use Smart\Utils\Session;

class materialcycle extends \Smart\Setup\Setup {

    /**
     * @var \iAdmin\Model\materialcycle $model
     */
    public $model = '\iAdmin\Model\materialcycle';

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