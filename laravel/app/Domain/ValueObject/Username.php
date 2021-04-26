<?php

namespace App\Domain\ValueObject;

class Username
{
    private $username;

    private function __construct()
    {
    }

    /**
     * ユーザーネームをプロパティとして保持する自インスタンスを作成.
     *
     * @param string $primitiveUsername
     * @return self
     */
    public static function create(string $primitiveUsername): self
    {
        // if ($primitiveUsername === null || preg_match('/[\w_]*/', $primitiveUsername) !== 1) {
        if ($primitiveUsername === null) {
            throw new \Exception();
        }

        $instance = new self();
        $instance->username = $primitiveUsername;
        return $instance;
    }

    /**
     * 保持しているユーザーネームを取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->username;
    }
}
