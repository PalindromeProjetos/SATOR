<?php

namespace Smart\Utils;

use PHPMailer;
use SMTP;

class SendMail extends PHPMailer {

    public function __construct() {
        parent::__construct();

        $this->IsSMTP();							                // telling the class to use SMTP
        $this->SMTPDebug  = 0;                                      // enables SMTP debug information (for testing)
                                                                    //  - 1 = errors and messages
                                                                    //  - 2 = messages only

        //== Set Config Server
        $this->SMTPOptions = array(
            'ssl' => array(
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true
            )
        );

        $this->Host = 'mail.palindrome.com.br';                 // Specify main and backup SMTP servers
        $this->SMTPAuth = true;                                 // Enable SMTP authentication
        $this->Username = 'noreply@palindrome.com.br';          // SMTP username
        $this->Password = 'c6c36KYye3';                         // SMTP password
        $this->SMTPSecure = 'tls';                              // Enable TLS encryption, `ssl` also accepted
        $this->Port = 587;                                      // TCP port to connect to

        $this->setFrom('noreply@palindrome.com.br', 'Palindrome Projetos (No Reply)');

        $this->IsHTML(true);
    }

    /**
     * @param array $data
     * @param $body
     */
    public function configEmail (array $data, $body) {

        foreach($data as $field=>$value) {
            $body = str_replace( '$'.$field, $value, $body );
        }

        $this->MsgHTML($body);
        $this->AddAddress($data["mainmail"]);
    }

}