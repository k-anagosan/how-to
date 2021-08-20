<?php

namespace App\Domain\ValueObject;

class Email
{
    private $email;

    private function __construct()
    {
    }

    /**
     * emailをプロパティとして保持する自インスタンスを作成.
     *
     * @param string $primitiveEmail
     * @return self
     */
    public static function create(string $primitiveEmail): self
    {
        if ($primitiveEmail === null) {
            throw new \Exception();
        }

        $instance = new self();
        $instance->email = $primitiveEmail;
        return $instance;
    }

    /**
     * 保持しているemailを取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->email;
    }
}
