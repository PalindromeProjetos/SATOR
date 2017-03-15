<?php

namespace iSterilization\Quick;

use Smart\Utils\Report;
use Smart\Utils\Session;

class serviceregistration extends Report {

    public function preConstruct() {

        parent::preConstruct();

        $this->post = (object) self::decodeUTF8($_REQUEST);

        $id = $this->post->id;

        $sizeColumns = array(20,20,20,20,15,15);
        $this->squareWidth = intval($this->getInternalW() / 12);
        $this->sizeColumns = $this->scaleCalc(array_sum($sizeColumns),intval($this->getInternalW()),$sizeColumns);

        $sql = "
            select
                sr.resultvalue,
                coalesce(sr.resultfield,ib.resultfield) as resultfield
            from
                serviceregistration sr
                left join itembase ib on ( ib.id = sr.itembaseid )
            where sr.id = :id
              and coalesce(sr.resultfield,ib.resultfield) is not null";

        $pdo = $this->getProxy()->prepare($sql);
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);

        $pdo->execute();
        $this->rows = $pdo->fetchAll();

        $this->setResultValue();
    }

    public function setResultValue () {

        $rows = $this->rows;

        if(count($rows) != 0) {
            $resultvalue = $rows[0]['resultvalue'];
            $resultfield = $rows[0]['resultfield'];

            $i = 0;
            $json = self::jsonToArray($resultvalue);
            $base = self::jsonToArray($resultfield);

            foreach ($base as $item) {
                $list[$i]['id'] = $i+1;
                $defaultValue = $item['defaultValue'];
                $value = isset($json[$i]['value']) ? $json[$i]['value'] : '';

                $defaultValue = strlen($value) != 0 ? $value : $defaultValue;

                $list[$i]['datavalue'] = $defaultValue;
                $list[$i]['fieldname'] = $item['name'];
                $list[$i]['fieldtext'] = $item['displayName'];
                $list[$i]['reference'] = $item["referenceValue"];
                $list[$i]['formfield'] = self::arrayToJson($item);
                $list[$i]['showorder'] = str_pad($item['showOrder'],2,'0',STR_PAD_LEFT);
                $i++;
            }

            $rows = self::sorterArray($list,'showorder');
        }

        $this->rows = $rows;

        return $rows;
    }

    public function posConstruct() {
        parent::posConstruct();
    }

    public function getHeaderColumns() {
        $sw = $this->squareWidth;

        $this->SetFont('Arial', '', 9);
        $this->SetFillColor(245, 242, 198);

        $this->Cell($sw * 1.0,7,'Campo','B',0,'L',1);
        $this->Cell($sw * 2.0,7,'Resultado','B',0,'L',1);
        $this->Cell($sw * 3.0,7,'Valor Referencia','B',1,'L',1);
    }

    public function Header() {
        $id = $this->post->id;
        $this->squareWidth = intval($this->getInternalW() / 6);

        $sql = "
            SELECT
                ib.id,
                ib.name as itembasename,
                ib.barcode,
                ib.itembasetype,
                dbo.getEnum('servicetype',sr.servicetype) as servicetypedescription,
                dbo.getEnum('itembasetype',ib.itembasetype) as itembasetypedescription,
                ib.registrationanvisa,
                mf.name as manufacturername,
                e.cmeareasid,
                e.cmeareasname
            FROM
                serviceregistration sr
                inner join itembase ib on ( ib.id = sr.itembaseid )
                inner join manufacturer mf on ( mf.id = ib.manufacturerid )
                outer apply (
                    select
                        e.cmeareasid,
                        a.name as cmeareasname
                    from
                        equipment e
                        inner join areas a on ( a.id = e.cmeareasid )
                    where e.id = ib.id
                ) e
            WHERE sr.id = :id";

        $pdo = $this->getProxy()->prepare($sql);
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);

        $pdo->execute();
        $rows = $pdo->fetchAll();

        $cmeareasname = $rows[0]['cmeareasname'];
//        $movimentdate = $rows[0]['movimentdate'];
        $itembasename = $rows[0]['itembasename'];
        $manufacturername = $rows[0]['manufacturername'];
        $registrationanvisa = $rows[0]['registrationanvisa'];
        $servicetypedescription = $rows[0]['servicetypedescription'];
        $itembasetypedescription = $rows[0]['itembasetypedescription'];

//        $date = new \DateTime($movimentdate);
        $id = str_pad($id, 6, '0', STR_PAD_LEFT);

        $this->configStyleHeader(14);
        $this->Cell($this->getInternalW(),6, utf8_decode("Registro de Serviços N# $id"),0,1,'C',false);
        $this->configStyleHeader(10);
        //$this->Cell($this->getInternalW(),6, 'Data: '. $date->format('d/m/Y'),0,1,'C',false);

        $this->SetLineWidth(.2);
        $this->Cell($this->getInternalW(),3, '','B',1,'C');
        $this->Ln(4);

        $this->SetFont('Arial', '', 10);
        $this->Cell($this->squareWidth,5,'Nome do Item:',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($this->squareWidth*4,5,"$itembasename - $manufacturername",0,1,'L',0);

        $this->SetFont('Arial', '', 10);
        $this->Cell($this->squareWidth,5,utf8_decode('Item/Serviço:'),0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($this->squareWidth*4,5,"$itembasetypedescription - $servicetypedescription",0,1,'L',0);

        $this->SetFont('Arial', '', 10);
        $this->Cell($this->squareWidth,5,'CMEArea:',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($this->squareWidth*4,5,$cmeareasname,0,1,'L',0);
        $this->Ln(1);
    }

    public function Detail() {
        $sw = $this->squareWidth;

        $lineColor = 1;

        $this->getHeaderColumns();

        while(list(, $item) = each($this->rows)) {
            extract($item);

            //Control line color
            $lineColor = ($lineColor == 0) ? 1 : 0;

            //Config Style Details
            $this->configStyleDetail();
            $this->SetFont('LucidaSans-Typewriter', '', 8);

            //Print Datas
            $this->Cell($sw * 1.0,5,"$showorder. $fieldtext",0,0,'L',$lineColor);
            $this->Cell($sw * 2.0,5,$datavalue,0,0,'L',$lineColor);
            $this->Cell($sw * 3.0,5,$reference,0,1,'L',$lineColor);
        }

        $this->SetLineWidth(.2);
        $this->Cell($this->getInternalW(),3, '','T',1,'C');

        $this->Ln(20);
        $this->SetFont('Arial', '', 7);
        $this->Cell($sw * 2.0,4, utf8_decode("Lançado por"),'T',0,'C');
        $this->Cell($sw * 2.0,3, '',0,0,'C');
        $this->Cell($sw * 2.0,4, utf8_decode("Encerrado por"),'T',1,'C');
    }

}