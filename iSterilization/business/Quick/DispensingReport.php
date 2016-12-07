<?php

namespace iSterilization\Quick;

use Smart\Utils\Report;
use Smart\Utils\Session;

class dispensingreport extends Report {

    public function preConstruct() {

        parent::preConstruct();

        $this->post = (object) self::decodeUTF8($_REQUEST);

        $id = $this->post->id;

        $sizeColumns = array(20,20,20,20,15,15);
        $this->squareWidth = intval($this->getInternalW() / 12);
        $this->sizeColumns = $this->scaleCalc(array_sum($sizeColumns),intval($this->getInternalW()),$sizeColumns);

        $sql = "
            declare
                @id int = :id;

            select
                ami.*,
                fp.barcode,
                t.colorschema,
                t.materialname,
                dbo.getEnum('outputtype',ami.outputtype) as outputtypedescription,
                dbo.getEnum('armorylocal',ami.armorylocal) as armorylocaldescription
            from
                armorymovementitem ami
                inner join flowprocessingstep fps on ( fps.id = ami.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                cross apply (
                    select
                        ta.colorschema,
                        coalesce(ta.name,tb.name) as materialname
                    from
                        flowprocessing a
                        outer apply (
                            select
                                mb.name,
                                colorschema = (
                                    select stuff
                                        (
                                            (
                                                select
                                                    ',#' + tc.colorschema
                                                from
                                                    materialboxtarge mbt
                                                    inner join targecolor tc on ( tc.id = mbt.targecolorid )
                                                where mbt.materialboxid = mb.id
                                                order by mbt.targeorderby asc
                                                for xml path ('')
                                            ) ,1,1,''
                                        )
                                )
                            from
                                materialbox mb
                            where mb.id = a.materialboxid
                        ) ta
                        outer apply (
                            select top 1
                                ib.name
                            from
                                flowprocessingstep b
                                inner join flowprocessingstepmaterial c on ( c.flowprocessingstepid = b.id )
                                inner join itembase ib on ( ib.id = c.materialid )
                            where b.flowprocessingid = fp.id
                              and b.id < fps.id
                              and ( b.stepflaglist like '%001%' or b.stepflaglist like '%019%' )
                        ) tb
                    where a.id = fp.id
                ) t
            where ami.armorymovementid = @id";

        $pdo = $this->getProxy()->prepare($sql);
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);

        $pdo->execute();
        $this->rows = $pdo->fetchAll();

    }

    public function posConstruct() {
        parent::posConstruct();
    }

    public function getHeaderColumns() {
        $sw = $this->squareWidth;

        $this->SetFont('Arial', '', 9);
        $this->SetFillColor(245, 242, 198);

        $this->Cell($sw * 1.0,7,'Material','B',0,'L',1);
        $this->Cell($sw * 2.0,7,utf8_decode('Descricão'),'B',0,'L',1);
        $this->Cell($sw * 3.0,7,'','B',1,'L',1);
    }

    public function Header() {
        $id = $this->post->id;
        $this->squareWidth = intval($this->getInternalW() / 6);

        $sql = "
            SELECT
                am.id,
                am.areasid,
                am.movementuser,
                am.movementdate,
                am.movementtype,
                dbo.getEnum('movementtype',am.movementtype) as movementtypedescription,
                am.releasestype,
                amo.clientid,
                c.name,
                amo.barcode,
                amo.patientname,
                amo.surgicalwarning,
                amo.instrumentator,
                amo.flowing,
                amo.place,
                amo.transportedby,
                amo.surgicalroom,
                amo.surgical,
                amo.dateof,
                amo.timeof
            FROM
                armorymovement am
                INNER JOIN armorymovementoutput amo on (amo.id = am.id)
                INNER JOIN client c on (c.id = amo.clientid)
            WHERE am.id = :id
              and am.movementtype = '002' ";

        $pdo = $this->getProxy()->prepare($sql);
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);

        $pdo->execute();
        $rows = $pdo->fetchAll();

        //print_r($rows);
        //exit;

        $local = $rows[0]['name'];
        $operator = $rows[0]['movementuser'];
        $circulante = 'Circulante Geral';
        $datamovimento = new \DateTime($rows[0]['movementdate']);

        $id = str_pad($id, 6, '0', STR_PAD_LEFT);

        $this->configStyleHeader(11);
        $this->Cell($this->squareWidth/*$this->getInternalW()*/,5, utf8_decode("HAM - RELAÇÃO DE MATERIAIS RETIRADOS -  #$id"),0,1,'L',false);
        $this->configStyleHeader(10);

        $this->SetLineWidth(.2);
        $this->Cell($this->getInternalW(),3, '','B',1,'C');
        $this->Ln(4);

        $this->SetFont('Arial', '', 10);
        $this->Cell($this->squareWidth,5,'LOCAL:',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($this->squareWidth*4,5,"$local",0,1,'L',0);

        $this->SetFont('Arial', '', 10);
        $this->Cell($this->squareWidth,5,utf8_decode('OPERADOR:'),0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($this->squareWidth*4,5,"$operator",0,1,'L',0);

//        $this->SetFont('Arial', '', 10);
//        $this->Cell($this->squareWidth,5,'CIRCULANTE:',0,0,'L',0);
//        $this->configStyleHeader(10);
//        $this->Cell($this->squareWidth*4,5,$circulante,0,1,'L',0);
//        $this->Ln(1);

        $this->SetFont('Arial', '', 10);
        $this->Cell($this->squareWidth,5,'DATA:',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($this->squareWidth*4,5,$datamovimento->format('d/m/Y H:i:s'),0,1,'L',0);
        $this->Ln(1);

        $this->SetLineWidth(.2);
        $this->Cell($this->getInternalW(),3, '','B',1,'C');
        $this->Ln(4);

    }

    public function Detail() {
        $sw = $this->squareWidth;

        $lineColor = 1;

        $this->getHeaderColumns();

        foreach($this->rows as $item) {

            //Control line color
            $lineColor = ($lineColor == 0) ? 1 : 0;

            //Config Style Details
            $this->configStyleDetail();
            $this->SetFont('LucidaSans-Typewriter', '', 8);

            //Print Datas
            $this->Cell($sw * 1.0,5, $item['barcode'],0,0,'L',$lineColor);
            $this->Cell($sw * 2.0,5,$item['materialname'],0,0,'L',$lineColor);
            $this->Cell($sw * 3.0,5,$item['outputtypedescription'],0,1,'L',$lineColor);
        }

        $this->SetLineWidth(.2);
        $this->Cell($this->getInternalW(),3, '','T',1,'C');

//        $this->Ln(20);
//        $this->SetFont('Arial', '', 7);
//        $this->Cell($sw * 2.0,4, utf8_decode("Lançado por"),'T',0,'C');
//        $this->Cell($sw * 2.0,3, '',0,0,'C');
//        $this->Cell($sw * 2.0,4, utf8_decode("Encerrado por"),'T',1,'C');
    }

    public function Footer() {
        $this->loadFooter($this->getInternalW(),true);
    }

}