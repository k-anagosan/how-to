<?php

namespace App\Exceptions;

use Exception;

class FollowInvalidException extends Exception
{
    public $param;

    public $message;

    public function __construct(string $param, string $message)
    {
        $this->message = $message;
        $this->param = $param;
    }
}
