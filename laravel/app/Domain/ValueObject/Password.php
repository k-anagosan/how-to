<?php

namespace App\Domain\ValueObject;

use Illuminate\Support\Facades\Hash;

class Password
{
    private $password;

    private function __construct()
    {
    }

    /**
     * passwordをプロパティとして保持する自インスタンスを作成.
     *
     * @param string $primitivePassword
     * @return self
     */
    public static function create(string $primitivePassword): self
    {
        if ($primitivePassword === null) {
            throw new \Exception();
        }

        $instance = new self();
        $instance->password = Hash::make($primitivePassword);
        return $instance;
    }

    /**
     * 保持しているpasswordを取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->password;
    }
}
