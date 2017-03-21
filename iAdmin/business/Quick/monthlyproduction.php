<?php

namespace iAdmin\Quick;

use Smart\Utils\Report;
use Smart\Utils\Session;

class monthlyproduction extends Report {

    public function preConstruct() {

        parent::preConstruct();

        $this->post = (object) self::decodeUTF8($_REQUEST);

        $sizeColumns = array(20,20,20,20,15,15);
        $this->squareWidth = intval($this->getInternalW() / 12);
        $this->sizeColumns = $this->scaleCalc(array_sum($sizeColumns),intval($this->getInternalW()),$sizeColumns);

        $sql = "
            declare
                @year	int = :year,
                @month	int = :month;

            select
                m.code,
                m.name,
                [target] = (
                    select
                        sum(t.items) total
                    from
                        armorymovement am
                        inner join armorymovementoutput amo on ( amo.id = am.id and amo.clientid = m.id )
                        inner join armorymovementitem ami on ( ami.armorymovementid = am.id )
                        inner join flowprocessingstep fps on ( fps.id = ami.flowprocessingstepid )
                        inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
                        cross apply (
                            select
                                max(a.id) as id,
                                m.items
                            from
                                flowprocessingstep a
                                cross apply (
                                    select
                                        count(id) as items
                                    from
                                        flowprocessingstepmaterial fpsm
                                    where fpsm.flowprocessingstepid = a.id
                                ) m
                            where a.flowprocessingid = fp.id
                              and ( a.stepflaglist like '%001%' or a.stepflaglist like '%019%' )
                            group by m.items
                        ) t
                    where year(am.closeddate) = @year
                      and month(am.closeddate) = @month
                      and am.releasestype = 'E'
                      and am.movementtype = '002'
                ),
                [source] = (
                    select
                        sum(o.items) total
                    from
                        armorymovement am
                        inner join armorymovementitem ami on ( ami.armorymovementid = am.id )
                        inner join flowprocessingstep fps on ( fps.id = ami.flowprocessingstepid )
                        inner join flowprocessing fp on ( fp.id = fps.flowprocessingid )
            
                        cross apply (
                            select top 1
                                c.clientid,
                                max(b.id) as id
                            from
                                armorymovementitem a
                                inner join armorymovement b on ( 
                                            b.id = a.armorymovementid
                                        and b.releasestype = 'E'
                                        and b.movementtype = '002'
                                        and b.id < am.id
                                    )
                                inner join armorymovementoutput c on ( 
                                                c.id = b.id 
                                            and c.clientid = m.id
                                        )
                            where a.flowprocessingstepid = ami.flowprocessingstepid
                            group by c.clientid
                        ) t
            
                        cross apply (
                            select
                                m.items,
                                max(a.id) as id
                            from
                                flowprocessingstep a
                                cross apply (
                                    select
                                        count(id) as items
                                    from
                                        flowprocessingstepmaterial fpsm
                                    where fpsm.flowprocessingstepid = a.id
                                ) m
                            where a.flowprocessingid = fp.id
                              and ( a.stepflaglist like '%001%' or a.stepflaglist like '%019%' )
                            group by m.items
                        ) o
            
                    where year(am.closeddate) = @year
                      and month(am.closeddate) = @month
                      and am.releasestype = 'E'
                      and am.movementtype = '003'
                )
            from
                client m
			where m.clienttype != '003'
            order by m.name";

        $pdo = $this->getProxy()->prepare($sql);
        $pdo->bindValue(":year", $this->post->year, \PDO::PARAM_INT);
        $pdo->bindValue(":month", $this->post->month, \PDO::PARAM_INT);

        $pdo->execute();
        $this->rows = $pdo->fetchAll();

    }

    public function Header() {
        $year = $this->post->year;
        $month = $this->post->month;
        $this->squareWidth = intval($this->getInternalW() / 6);
        $monthTrans = utf8_decode($this->getTranslate('monthly',$month));
        $sw = $this->squareWidth;

        $this->SetY(5.0);
        $this->SetDrawColor(179,134,0);
        $this->SetLineWidth(.2);
        $this->Cell($sw * 4.3,15,'','R',0,'');

        $this->SetY(10.0);
        $this->SetFont('ArialNarrow', '', 9);
        $this->SetTextColor(179,134,0);
        $this->Cell($sw * 4.3,5, utf8_decode("O primeiro hospital do Amazonas"),0,1,'R',false);
        $this->Cell($sw * 4.3,4, utf8_decode("certificado pela Organização Nacional de Acreditação"),0,1,'R',false);

        $this->Image(__DIR__ . "/../../../resources/images/sator/HAM_ALTA.png",12,7,40,0,"PNG");
        $this->Image(__DIR__ . "/../../../resources/images/acreditacao.png",148,5,50,0,"PNG");

        $this->SetDrawColor(0,0,0);
        $this->Cell($this->getInternalW(),3,'','B',1,'C');

        $this->Ln(4);
        $this->SetFont('Arial', '', 14);
        $this->SetTextColor(0,0,0);
		$this->Cell($this->getInternalW(),5, utf8_decode("CME - Materiais Processados"),0,1,'C',false);
        $this->SetFont('Arial', '', 10);
        $this->Cell($this->getInternalW(),5, "{$monthTrans}/{$year}",0,1,'C',false);
		$this->Ln(2);
    }

    public function getHeaderColumns() {
        $sw = $this->squareWidth;

        $this->SetFont('Arial', '', 9);
        $this->SetFillColor(255, 255, 255);

		$this->SetLineWidth(.2);
		$this->Cell($this->getInternalW(),1, '','B',1,'C');
		$this->Cell($sw * 0.5,10,utf8_decode('Código'),'R',0,'C',0);
		$this->Cell($sw * 3.8,10,utf8_decode('Setor'),'R',0,'L',0);
		$this->Cell($sw * 1.7,5,utf8_decode('T O T A I S'),'B',1,'C',0);
		$this->SetFont('Arial', '', 7);
		$this->Cell($sw * 4.3,5,'','',0,'C',0);
		$this->Cell($sw * 0.5,5,utf8_decode('Dispensado'),'R',0,'C',0);
		$this->Cell($sw * 0.4,5,utf8_decode('Retorno'),0,0,'C',0);
        $this->Cell($sw * 0.3,5,utf8_decode('%'),'R',0,'C',0);
		$this->Cell($sw * 0.5,5,utf8_decode('Produzido'),'',1,'C',0);
		$this->Cell($this->getInternalW(),0.3, '','T',1,'C');
    }

    public function nullIf($value,$char) {
        return $value == $char ? '' : $value;
    }

    public function Detail() {
        $sw = $this->squareWidth;

        $lineColor = 1;
		$targetSum = 0;
		$sourceSum = 0;

        $this->getHeaderColumns();
	
        while(list(, $item) = each($this->rows)) {
            extract($item);

            $lineColor = ($lineColor == 0) ? 1 : 0;

            $this->configStyleDetail();
			$this->SetFont('LucidaSans-Typewriter', '', 7);

			$targetSum += intval($target);
			$sourceSum += intval($source);
            $perc = $target == 0 ? 0.00 : ($source*100)/$target;

			$perc = number_format((float)$perc, 2, ',', '');

            $this->SetLineWidth(.2);
			$this->Cell($sw * 0.5,5, $code,'',0,'C',$lineColor);
            $this->Cell($sw * 3.8,5, $name,'L',0,'L',$lineColor);
            $this->Cell($sw * 0.5,5, $this->nullIf(number_format($target,0,'','.'),0),'L',0,'R',$lineColor);
            $this->Cell($sw * 0.4,5, $this->nullIf(number_format($source,0,'','.'),0),'L',0,'R',$lineColor);
            $this->SetLineWidth(.1);
            $this->Cell($sw * 0.3,5, $this->nullIf($perc,0),'L',0,'R',$lineColor);
            $this->SetLineWidth(.2);
            $this->Cell($sw * 0.5,5, $this->nullIf(number_format($target-$source,0,'','.'),0),'L',1,'R',$lineColor);
        }

        $this->SetLineWidth(.2);
		$this->Cell($this->getInternalW(),1, '','T',1,'C');

        $perc = $targetSum == 0 ? 0.00 : ($sourceSum*100)/$targetSum;

        $perc = number_format((float)$perc, 2, ',', '');

		//Totais
		$this->SetFont('Arial', 'B', 8);
		$this->Cell($sw * 4.3,5, utf8_decode("TOTAL GERAL"),'',0,'R',0);
		$this->Cell($sw * 0.5,5, number_format($targetSum,0,'','.'),0,0,'R',0);
		$this->Cell($sw * 0.4,5, number_format($sourceSum,0,'','.'),0,0,'R',0);
        $this->Cell($sw * 0.3,5, $perc,0,0,'R',0);
		$this->Cell($sw * 0.5,5, number_format(intval($targetSum)-intval($sourceSum),0,'','.'),0,1,'R',0);
		
        $this->Ln(20);
        $this->SetFont('Arial', '', 7);
        $this->Cell($sw * 2.0,4, utf8_decode("Conferido por 01"),'T',0,'C');
        $this->Cell($sw * 2.0,3, '',0,0,'C');
        $this->Cell($sw * 2.0,4, utf8_decode("Conferido por 02"),'T',1,'C');
    }

}