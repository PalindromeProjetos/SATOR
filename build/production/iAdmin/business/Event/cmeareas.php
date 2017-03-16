<?php

namespace iAdmin\Event;

use Smart\Utils\Session;

class cmeareas extends \Smart\Data\Event {

    /**
     * @param $model
     */
    public function preInsert( &$model ) {
		Session::hasProfile('907BDF5C-F83C-47A5-84C1-5D7D2385D081','589F0BF9-0EFA-42B0-8C42-24C4B1BF41E4');

        $areas = new \iAdmin\Coach\areas();
        $areas->getStore()->getModel()->set('areastype','A');
        $areas->update();

        $id = $areas->getStore()->getModel()->getId();
        $model->setId($id);

        if(strlen($id) == 0) {
            throw new \PDOException('Não foi possível inserir o registro!');
        }
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
        Session::hasProfile('907BDF5C-F83C-47A5-84C1-5D7D2385D081','4BF2F3C8-BFC0-4DD8-A491-B2C4C3673C69');
        $areas = new \iAdmin\Coach\areas();
        $areas->update();
    }

    /**
     * @param $model
     */
    public function posUpdate( &$model ) {
        Session::hasProfile('907BDF5C-F83C-47A5-84C1-5D7D2385D081','9583F8C2-9DAA-4687-A673-40053E322A64');
//        select st.name, st.dataflowstep from sterilizationtype st where st.isactive = 1
//        throw new \PDOException('Não foi possível inserir o registro!');
    }

    /**
     * @param $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('907BDF5C-F83C-47A5-84C1-5D7D2385D081','3BFFF554-F6E1-4ED1-9178-0B4FF614B997');
    }

    /**
     * @param $model
     */
    public function posDelete( &$model ) {

    }

}