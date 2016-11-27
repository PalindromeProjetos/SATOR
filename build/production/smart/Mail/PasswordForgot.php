<?php

namespace Smart\Mail;

use Smart\Utils\SendMail;

class PasswordForgot extends SendMail {

    /**
     * @param array $data
     * @param $body
     */
    public function configEmail (array $data, $body) {
        parent::configEmail($data,$body);
        $this->Subject = 'Recuperar Senha!';
    }
}