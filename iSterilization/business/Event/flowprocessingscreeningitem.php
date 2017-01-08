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

		// $this->hasBeAvailable($model);

		$materialid = $model->getMaterialid();
        $dataflowstep = $model->getDataflowstep();
		$hasexception = $model->getHasexception();
		$materialboxid = $model->getMaterialboxid();
        $sterilizationtypeid = $model->getSterilizationtypeid();
        $flowprocessingscreeningid = $model->getFlowprocessingscreeningid();

        if($materialboxid == null || strlen($materialboxid) == 0) {
            return false;
        }

        $model->set('dataflowstep', null);
		$model->set('hasexception', null);
        $model->set('sterilizationtypeid', null);

        $proxy = $this->getProxy();

        $box = new \iSterilization\Coach\flowprocessingscreeningbox();

        $box->getStore()->setProxy($proxy);

        $data = self::jsonToObject($box->getStore()->getCache()->getBoxCount(array("query"=>$materialboxid)));

        if($data->rows->loads == 0) {
            $box->getStore()->getModel()->set('items', $data->rows->items);
            $box->getStore()->getModel()->set('dataflowstep', $dataflowstep);
			$box->getStore()->getModel()->set('hasexception', $hasexception);
			$box->getStore()->getModel()->set('materialid', $materialid);
            $box->getStore()->getModel()->set('materialboxid', $materialboxid);
            $box->getStore()->getModel()->set('sterilizationtypeid', $sterilizationtypeid);
            $box->getStore()->getModel()->set('flowprocessingscreeningid', $flowprocessingscreeningid);

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
        $item->getStore()->setProxy($proxy);

        $data = self::jsonToObject($item->getStore()->select());

        $materialboxid = $data->rows[0]->materialboxid;

        if($materialboxid == null || strlen($materialboxid) == 0) {
            return false;
        }

        $box = new \iSterilization\Coach\flowprocessingscreeningbox();

        $box->getStore()->setProxy($proxy);

        $item = self::jsonToObject($box->getStore()->getCache()->getBoxItems(array("query"=>$materialboxid)));

        if($item->rows->items == 1) {
            $box->getStore()->getModel()->set('id', $item->rows->id);
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