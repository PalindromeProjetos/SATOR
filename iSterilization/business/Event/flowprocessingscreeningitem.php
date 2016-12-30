<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingscreeningitem extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingscreeningitem $model
     * @return bool
     */
    public function preInsert( \iSterilization\Model\flowprocessingscreeningitem &$model ) {
        Session::hasProfile('','');

        $materialboxid = $model->getMaterialboxid();
        $flowprocessingscreeningid = $model->getFlowprocessingscreeningid();

        if($materialboxid == null || strlen($materialboxid) == 0) {
            return false;
        }

        $proxy = $this->getProxy();

        $box = new \iSterilization\Coach\flowprocessingscreeningbox();

        $box->getStore()->setProxy($proxy);

        $data = self::jsonToObject($box->getStore()->getCache()->getBoxCount(array("query"=>$materialboxid)));

        if($data->rows->loads == 0) {
            $box->getStore()->getModel()->set('flowprocessingscreeningid', $flowprocessingscreeningid);
            $box->getStore()->getModel()->set('materialboxid', $materialboxid);
            $box->getStore()->getModel()->set('items', $data->rows->items);
            $result = self::jsonToObject($box->getStore()->insert());

            if(!$result->success) {
                throw new \PDOException(self::$FAILURE_STATEMENT);
            }
        }
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
     * @return bool
     */
    public function preDelete( \iSterilization\Model\flowprocessingscreeningitem &$model ) {
        Session::hasProfile('','');

        $proxy = $this->getProxy();

        $item = new \iSterilization\Coach\flowprocessingscreeningitem();

        $data = self::jsonToObject($item->getStore()->setProxy($proxy)->select());

        $materialboxid = $data->rows[0]->materialboxid;

        if($materialboxid == null || strlen($materialboxid) == 0) {
            return false;
        }

        $box = new \iSterilization\Coach\flowprocessingscreeningbox();

        $box->getStore()->setProxy($proxy);

        $data = self::jsonToObject($box->getStore()->getCache()->getBoxItems(array("query"=>$materialboxid)));

        if($data->rows->items == 1) {
            $box->getStore()->getModel()->set('id', $data->rows->id);
            $result = self::jsonToObject($box->getStore()->delete());

            if(!$result->success) {
                throw new \PDOException(self::$FAILURE_STATEMENT);
            }
        }
    }

    /**
     * @param \iSterilization\Model\flowprocessingscreeningitem $model
     */
    public function posDelete( \iSterilization\Model\flowprocessingscreeningitem &$model ) {

    }

}