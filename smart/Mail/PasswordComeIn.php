<?php

namespace Smart\Mail;

use Smart\Utils\SendMail;

class PasswordComeIn extends SendMail {

    /**
     * @param array $data
     * @param $body
     */
    public function configEmail (array $data, $body) {
        parent::configEmail($data,$body);
        $this->Subject = 'Senha Convite!';
    }
}