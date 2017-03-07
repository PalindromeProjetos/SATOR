<?php

namespace iSterilization\Event;

use Smart\Utils\Session;

class flowprocessingstepaction extends \Smart\Data\Event {

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function preInsert( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function posInsert( &$model ) {

    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function preUpdate( &$model ) {
        Session::hasProfile('','');

        $isactive = $model->getIsactive();

        if($isactive === 'AUTHORIZE') {
            $dateto = date("Ymd H:i:s");
            $model->set('isactive',0);
            $model->set('dateto',$dateto);
        }

        if($isactive === 'TOREVERSE') {
            $dateto = date("Ymd H:i:s");
            $model->set('isactive',0);
            $model->set('flowstepaction','005');
            $model->set('dateto',$dateto);
            $id = $model->getId();
            $this->setReverseProcess($id);
        }
    }

    /**
     * @return bool
     */
    public function setReverseProcess($id) {
        $proxy = $this->getProxy();

        $sql = "
            declare
                @id int = :id;
            
            select top 1 
                @id = fpsa.id
            from
                flowprocessing fp
                inner join flowprocessingstep fps on ( fps.flowprocessingid = fp.id )
                inner join flowprocessingstepaction fpsa on ( 
                    fpsa.flowprocessingstepid = fps.id 
                and fpsa.flowstepaction = '001'
                and fpsa.isactive = 0 )
                cross apply (
                    select
                        c.id
                    from
                        flowprocessingstepaction a
                        inner join flowprocessingstep b on ( b.id = a.flowprocessingstepid )
                        inner join flowprocessing c on ( c.id = b.flowprocessingid and c.id = fp.id )
                    where a.id != @id
                ) t
            where ( fps.stepflaglist like '%001%' or fps.stepflaglist like '%019%' )
            order by fpsa.id desc;

            update 
                t
            set
                t.flowstepstatus = '000'
            from
                flowprocessingstep as t
                inner join flowprocessingstepaction as c on ( 
                    c.flowprocessingstepid = t.id
                and c.id = @id );

            update 
                t
            set
                t.unconformities = '001'
            from
                flowprocessingstepmaterial as t
                inner join flowprocessingstepaction as c on ( 
                    c.flowprocessingstepid = t.flowprocessingstepid
                and c.id = @id );
                
            update flowprocessingstepaction set isactive = 1 where id = @id;";

        $pdo = $proxy->prepare($sql);
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);
        $pdo->execute();
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function posUpdate( &$model ) {
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function preDelete( &$model ) {
        Session::hasProfile('','');
    }

    /**
     * @param \iSterilization\Model\flowprocessingstepaction $model
     */
    public function posDelete( &$model ) {

    }

}