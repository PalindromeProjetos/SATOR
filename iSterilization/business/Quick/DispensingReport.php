<?php

namespace iSterilization\Quick;

use Smart\Utils\Report;
use Smart\Utils\Session;
use Endroid\QrCode\QrCode;

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
                fp.barcode,
                ami.*,
                t.id,
                t.materialid,
                t.materialcode,
                t.materialname,
                q.materialboxcode,
                q.materialboxname,
                t.proprietaryname,
                dbo.getEnum('boxtype',fp.boxtype) as boxtypedescription,                
                dbo.getEnum('outputtype',ami.outputtype) as outputtypedescription,
				t.items
            from
                armorymovement am
                inner join armorymovementoutput amo on ( amo.id = am.id )
                inner join armorymovementitem ami on ( ami.armorymovementid = am.id )
                inner join flowprocessingstep fps on ( fps.id = ami.flowprocessingstepid )
                inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                cross apply (
                    select
                        max(a.id) as id,
                        m.materialid,
                        m.barcode	as materialcode,
                        m.name		as materialname,
                        m.proprietaryname,
						m.items
                    from
                        flowprocessingstep a
                        cross apply (
                            select
                                fpsm.materialid,
                                ib.barcode,
                                ib.name,
                                p.name as proprietaryname,
								items = (
									select count(id) from flowprocessingstepmaterial where flowprocessingstepid = fpsm.flowprocessingstepid
								)
                            from
                                flowprocessingstepmaterial fpsm
                                inner join itembase ib on ( ib.id = fpsm.materialid )
                                inner join proprietary p on ( p.id = ib.proprietaryid )
                            where fpsm.flowprocessingstepid = a.id
                        ) m
                    where a.flowprocessingid = fp.id
                     and ( a.stepflaglist like '%001%' or a.stepflaglist like '%019%' )
                    group by m.materialid, m.barcode, m.name, m.proprietaryname, m.items
                ) t
                outer apply (
                    select
                        mb.name		as materialboxname,
                        mb.barcode	as materialboxcode
                    from
                        materialbox mb
                    where mb.id = fp.materialboxid
                ) q
            where am.releasestype = 'E'
              and am.movementtype = '002'
              and am.id = @id
            order by ami.id, q.materialboxcode, t.materialcode";

        $pdo = $this->getProxy()->prepare($sql);
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);

        $pdo->execute();
        $this->rows = $pdo->fetchAll();

    }

    public function getHeaderColumns() {
        $sw = $this->squareWidth;

        $this->SetFont('Arial', '', 9);
        $this->SetFillColor(255, 255, 255);

        $this->Cell($sw * 0.7,7,utf8_decode('Processo'),'B',0,'C',1);
        $this->Cell($sw * 3.3,7,utf8_decode('Kit / Material'),'B',0,'L',1);
        $this->Cell($sw * 1.0,7,utf8_decode('Proprietário'),'B',0,'L',1);
        $this->Cell($sw * 1.0,7,utf8_decode('Tipo de Saída'),'B',1,'L',1);
    }

    public function Header() {
        $id = $this->post->id;
        $this->squareWidth = intval($this->getInternalW() / 6);

        $sql = "
            declare
                @id int = :id;
                
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
                c.clienttype,
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
            WHERE am.id = @id
              and am.movementtype = '002'";

        $pdo = $this->getProxy()->prepare($sql);
        $pdo->bindValue(":id", $id, \PDO::PARAM_INT);

        $pdo->execute();
        $rows = $pdo->fetchAll();

        $local = $rows[0]['name'];
        $barcode = $rows[0]['barcode'];
        $surgicalroom = $rows[0]['surgicalroom'];
        $operator = $rows[0]['movementuser'];
        $surgical = $rows[0]['surgical'];
        $dateof = $rows[0]['dateof'];
        $timeof = $rows[0]['timeof'];

        $patientname = $rows[0]['patientname'];
        $surgicalwarning = $rows[0]['surgicalwarning'];

        $datamovimento = new \DateTime("$dateof $timeof");

        $sw = $this->squareWidth;

        $id = str_pad($id, 6, '0', STR_PAD_LEFT);

        $this->configStyleHeader(11);
        $this->Cell($this->squareWidth,5, utf8_decode("HAM - RELAÇÃO DE MATERIAIS RETIRADOS -  #$id"),0,1,'L',false);
        $this->configStyleHeader(10);

        $this->SetLineWidth(.2);
        $this->Cell($this->getInternalW(),3, '','B',1,'C');
        $this->Ln(4);

        $y = $this->y;
        $this->SetFont('Arial', '', 10);
        $this->Cell($sw * 0.7,5,'Cliente:',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($sw * 1.3,5,$local,0,0,'L',0);

        $this->SetFont('Arial', '', 10);
        $this->Cell($sw * 0.5,5,'Local:',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($sw * 1.3,5,"$surgicalroom",0,1,'L',0);

        $this->SetFont('Arial', '', 10);
        $this->Cell($sw * 0.7,5,utf8_decode('Operador:'),0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($sw * 1.3,5,"$operator",0,0,'L',0);

        $this->SetFont('Arial', '', 10);
        $this->Cell($sw * 0.5,5,'Aviso:',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($sw * 1.3,5,"$surgicalwarning $patientname",0,1,'L',0);

        $this->SetFont('Arial', '', 10);
        $this->Cell($sw * 0.7,5,'Data:',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($sw * 1.3,5,$datamovimento->format('d/m/Y H:i'),0,0,'L',0);

        $this->SetFont('Arial', '', 10);
        $this->Cell($sw * 0.5,5,'',0,0,'L',0);
        $this->configStyleHeader(10);
        $this->Cell($sw * 1.3,5,$surgical,0,1,'L',0);

        if(strlen($barcode) != 0) {
            $qrTemp = __DIR__;
            $qrCode = new QrCode();

            $qrFile = "{$qrTemp}{$barcode}.png";

            $qrCode->setText($barcode)
                ->setSize(70)
                ->setPadding(2)
                ->setErrorCorrection('high')
                ->setImageType(QrCode::IMAGE_TYPE_PNG)
                ->render($qrFile);

            $this->Image($qrFile,$sw * 5.7,$y-2);
            unlink($qrFile);
        }

        $this->Ln(1);

        $this->SetLineWidth(.2);
        $this->Cell($this->getInternalW(),3, '','B',1,'C');
        $this->Ln(1);

        $this->getHeaderColumns();
    }

    public function Detail() {
        $sw = $this->squareWidth;

        $lineColor = 1;
        $oldbarcode = '';

        foreach($this->rows as $item) {

            $barcode = "";

            $this->configStyleDetail();
            $this->SetFont('LucidaSans-Typewriter', '', 6);

            $items = $item['items'];
            $newbarcode = $item['barcode'];
            $materialname = $item['materialname'];
            $materialcode = $item['materialcode'];
            $materialboxcode = $item['materialboxcode'];
            $materialboxname = $item['materialboxname'];
            $proprietaryname = $item['proprietaryname'];
            $boxtypedescription = $item['boxtypedescription'];
            $outputtypedescription = $item['outputtypedescription'];

            $lineColor = ($lineColor == 0) ? 1 : 0;

            if($newbarcode != $oldbarcode) {
                $barcode = $newbarcode;
            }

            if(strlen($materialboxcode) != 0) {
                if((strlen($barcode) != 0 || strlen($boxtypedescription) != 0)) {
                    $materialboxname = $boxtypedescription || $materialboxname;
                    $this->Cell($sw * 0.7, 5, $newbarcode, 0, 0, 'C', $lineColor);
                    $this->SetFont('LucidaSans-Typewriter', '', 9);
                    $this->Cell($sw * 3.3, 5, "$materialboxname - $items item(s)", 'L', 0, 'L', $lineColor);
                    $this->SetFont('LucidaSans-Typewriter', '', 6);
                    $this->Cell($sw * 1.0, 5, $proprietaryname, 'L', 0, 'L', $lineColor);
                    $this->Cell($sw * 1.0, 5, $outputtypedescription, 'L', 1, 'L', $lineColor);

                    $this->Cell($sw * 0.7,4, "",0,0,'C',$lineColor);
                    $this->Cell($sw * 3.3,4, "  $materialcode $materialname",'L',0,'L',$lineColor);
                    $this->Cell($sw * 1.0,4, "",'L',0,'L',$lineColor);
                    $this->Cell($sw * 1.0,4, "",'L',1,'L',$lineColor);
                } else {
                    $this->Cell($sw * 0.7,4, "",0,0,'C',$lineColor);
                    $this->Cell($sw * 3.3,4, "  $materialcode $materialname",'L',0,'L',$lineColor);
                    $this->Cell($sw * 1.0,4, "",'L',0,'L',$lineColor);
                    $this->Cell($sw * 1.0,4, "",'L',1,'L',$lineColor);
                }
            } else {
                $this->Cell($sw * 0.7,5, $barcode,0,0,'C',$lineColor);
                $this->Cell($sw * 3.3,5, "$materialcode $materialname",'L',0,'L',$lineColor);
                $this->Cell($sw * 1.0,5, $proprietaryname,'L',0,'L',$lineColor);
                $this->Cell($sw * 1.0,5, $outputtypedescription,'L',1,'L',$lineColor);
            }

            $oldbarcode = $newbarcode;

            if($this->y >= $this->getInternalH() + 10) {
                $this->AddPage();
            }
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