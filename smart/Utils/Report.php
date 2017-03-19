<?php

namespace Smart\Utils;

use fpdf\FPDF;
use Smart\Data\Proxy;
use Smart\Setup\Start;
use Smart\Utils\Session;
use Smart\Common\Traits;

class Report extends FPDF {
    use Traits\TresultSet;

    protected $proxy;
    protected $entity = [];
    protected $margin = 12;

    public $stash = null;

    protected $translate = array(
        'month'=>array(
            1=>'jan',
            2=>'feb',
            3=>'mar',
            4=>'apr',
            5=>'may',
            6=>'jun',
            7=>'jul',
            8=>'aug',
            9=>'sep',
            10=>'oct',
            11=>'nov',
            12=>'dec'
        ),
        'monthly'=>array(
            'jan'=>'Janeiro',
            'feb'=>'Fevereiro',
            'mar'=>'Março',
            'apr'=>'Abril',
            'may'=>'Maio',
            'jun'=>'Junho',
            'jul'=>'Julho',
            'aug'=>'Agosto',
            'sep'=>'Setembro',
            'oct'=>'Outubro',
            'nov'=>'Novembro',
            'dec'=>'Dezembro'
        ),
        'dayweek'=>array(
            'sun'=>'Domingo',
            'mon'=>'Segunda-Feira',
            'tue'=>'Terça-Feira',
            'wed'=>'Quarta-Feira',
            'thu'=>'Quinta-Feira',
            'fri'=>'Sexta-Feira',
            'sat'=>'Sábado'
        )
    );

    public function getTranslate($type,$index) {
        $month = $this->translate['month'][$index];
        return $this->translate[$type][$month];
    }

    protected function weekInMonth($month, $year) {
        $start = mktime(0, 0, 0, $month, 1, $year);
        $end = mktime(0, 0, 0, $month, date('t', $start), $year);
        $start_week = date('W', $start);
        $end_week = date('W', $end);
        if ($end_week < $start_week) {
            return ((52 + $end_week) - $start_week) + 1;
        }
        return ($end_week - $start_week) + 1;
    }

    public function preConstruct() {
        $this->stash = new Session();
        $pwd = Start::getPassWord();
        $usr = Start::getUserName();
        $dns = Start::getConnnect();

        $link = array($dns, $usr, $pwd);
        $this->proxy = new Proxy($link);

        $sql = "
            select top 1
                name,
                legalname,
                cnpjnumber,
                cnesnumber,
                fileinfo,
                dbo.binary2base64(filedata) as filedata
            from entity";

        $rows = $this->proxy->query($sql)->fetchAll();
        $this->entity = (object) $rows[0];
    }

    public function getProxy () {
        return $this->proxy;
    }
    public function getEntity () {
        return $this->entity;
    }

    public function setLogoMark($posX = 20, $posY = 20, $sizeW = 20, $sizeH = 20) {

        $data = $this->entity->filedata;
        $info = json_decode($this->entity->fileinfo);
        $name = $info->fileName;

        $file = base64_decode($data);

        if( file_put_contents($name,$file) !== false ) {
            $this->Image($name,$posX,$posY,$sizeW,$sizeH);
            unlink($name);
        }
    }

    public function setLogoTipo($module, $posX = 20, $posY = 20, $sizeW = 20, $sizeH = 20) {
        $sql = "select dbo.binary2base64(filedata) as filedata, fileinfo from module where name = '{$module}'";

        $rows = $this->proxy->query($sql)->fetchAll();

        $data = $rows[0]["filedata"];
        $info = json_decode($rows[0]["fileinfo"]);
        $name = $info->fileName;

        $file = base64_decode($data);

        if( file_put_contents($name,$file) !== false ) {
            $this->Image($name,$posX,$posY,$sizeW,$sizeH);
            unlink($name);
        }
    }

    public function Detail() {

    }

    public function posConstruct() {
        $this->setAllMarginPage($this->margin);
        $this->AddFont('ArialNarrow','','ARIALN.php');
        $this->AddFont('LucidaSans-Typewriter','','LTYPE.php');
        $this->AliasNbPages();
        $this->AddPage();
        $this->Detail();
        $this->Output(basename(__FILE__), "I");
        ob_clean();
    }

    public function __construct($orientation='P', $unit='mm', $size='A4') {
        $this->preConstruct();

        parent::__construct($orientation,$unit,$size);

        $this->posConstruct();
    }

    public function setAllMarginPage($margin) {
        $this->SetMargins($margin,$margin + 2);
        $this->SetAutoPageBreak(false,$margin);
    }

    function SetDash($black=false, $white=false)
    {
        if($black and $white)
            $s=sprintf('[%.3f %.3f] 0 d', $black*$this->k, $white*$this->k);
        else
            $s='[] 0 d';
        $this->_out($s);
    }

    public function getInternalH() {
        return $this->h - ($this->tMargin + $this->bMargin);
    }

    public function getInternalW() {
        return $this->w - ($this->lMargin + $this->rMargin);
    }

    public function configStyleHeader($sizeFont = 10){
        $this->SetDrawColor(23,45,58);
        $this->SetLineWidth(0.1);
        $this->SetFillColor(230, 230, 230);
        $this->SetFont('Arial', 'B', $sizeFont);
    }

    public function configStyleParameterHeader($sizeFont = 10){
        $this->SetTextColor(100,100,100);
        $this->SetDrawColor(23,45,58);
        $this->SetLineWidth(0.1);
        $this->SetFillColor(230, 230, 230);
        $this->SetFont('Arial', 'B', $sizeFont);
    }

    public function configStyleLabelHeader($sizeFont = 8){
        $this->SetTextColor(23,45,58);
        $this->SetDrawColor(23,45,58);
        $this->SetLineWidth(0.1);
        $this->SetFillColor(230, 230, 230);
        $this->SetFont('Arial','',$sizeFont);
    }

    public function configStyleDetail($sizeFont = 6){
        $this->SetDrawColor(23,45,58);
        $this->SetLineWidth(0.1);
        $this->SetTextColor(36,62,62);
        $this->SetFillColor(252, 248, 232);
        $this->SetFont('Arial','',$sizeFont);
    }

    public function configStyleFooter($sizeFont = 6){
        $this->SetY(-15);
        $this->SetDrawColor(200,200,200);
        $this->SetTextColor(128);
        $this->SetFont('Arial','',$sizeFont);
    }

    public function configStyleTitleHeaderGroup($sizeFont = 9){
        $this->SetTextColor(23,45,58);
        $this->SetFont('Arial','B',$sizeFont);
    }

    public function configStyleDescriptionHeaderGroup($sizeFont = 9){
        $this->SetTextColor(0,0,128);
        $this->SetFont('Arial','B',$sizeFont);
    }

    public function configStyleFooterGroup($sizeFont = 9){
        $this->SetTextColor(0,0,0);
        $this->SetFont('Arial','B',$sizeFont);
    }

    public function loadLabel($columns, $sizeFont = 9){
        $x = $this->GetX();
        $y = $this->GetY();
        $ln = 1;

        $this->SetFont('Arial','',$sizeFont);

        foreach($columns as $c){
            $l = $this->_countLine($c[1], $c[0])+1;
            if($l > $ln) {
                $ln = $l;
            }
        }
        foreach($columns as $c){
            if($y+4*$ln>$this->PageBreakTrigger&&!$this->InFooter){
                $this->addPage($this->CurOrientation);
                $y=$this->GetY();
            }
            $this->SetY($y);
            $this->SetX($x);
            $x=$this->GetX()+$c[0];
            //$y=$this->GetY();

            $c[1] .= str_repeat("\n",$ln-$this->_countLine($c[1], $c[0]));

            $this->MultiCell($c[0],7,$c[1],'B',$c[2],1);

        }
        $this->Cell(15,5,'','',1);
    }

    public function loadHeader($title){

        $left_margin = 60;

        $this->Cell($left_margin);
        $this->Cell(1,4, $title,0,1,'L',false);
        $this->Image("../../../resources/images/appanest/logo-text.png",10,7,52,14,"PNG");
    }

    public function loadHeaderParameters($param, $buttonLineSize = 1000){

        $this->ln(2);

        foreach($param as $p){
            if(empty($p[3])){
                $this->SetX(35);
                $o = 'L';
            } else {
                $this->SetX($p[3]);
                $o = 'R';
            }

            $nl = empty($p[2]) ? 1 : 0;

            $this->Cell(1,4, $p[0].': '.$p[1] , 0, $nl, $o, false);
        }

        $this->ln(1);
        $this->Cell($buttonLineSize,3, '','T',1,'C');
        $this->ln(5);
    }

    public function loadFooter($internalW = 1000, $bottonLine = true) {
        $passport   = $this->stash->username;
        $date       = date("d/m/Y H:i");
        $pageNo     = $this->PageNo();

        if($bottonLine) $this->SetY(-15);
        $this->SetTextColor(7,23,35);
        $this->SetFont('Arial','',6);
        $this->SetLineWidth(.2);
        $this->Cell($internalW,3, '','B',1,'C');
        $this->Cell(0,4, "Sistema CME - impresso em $date, $passport",0,0,'L');
        $this->Cell(0,4, utf8_decode("página $pageNo de {nb}"),0,0,'R');
    }

    public static function scaleCalc($w1, $w2, $arrValues){
        for($i=0; $i < count($arrValues); $i++){
            $xw = $arrValues[$i]*$w2/$w1;
            $arrValues[$i] = $xw;
        }
        return $arrValues;
    }

    public function _countLine($s, $w){
        $s=explode(' ',$s);
        $l = 0;
        $a = 0;
        for($i=0;$i<count($s);$i++){
            $b = count($s)-1==$i ? '': ' ';
            $c = $this->GetStringWidth($s[$i].$b);
            if($c > $w){
                $n=ceil($c/$w);
                $l+=$n;
                $r=ceil( ($c+$n*2)-$n*$w );
                $a+=$r;
                $c=$r+$this->GetStringWidth(' ');
                if( count($s) == 1 ) {
                    $l--;
                }
            }
            $a += $c;
            if($a + 2 > $w){
                $l++;
                $a=$c;
            }
        }
        return $l;
    }

    public function Footer() {
        $this->loadFooter($this->getInternalW(),true);
    }

}