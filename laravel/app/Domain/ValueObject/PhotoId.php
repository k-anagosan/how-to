<?php

namespace App\Domain\ValueObject;

use Illuminate\Support\Str;

class PhotoId
{
    /**
     * IDの長さ.
     */
    private const ID_LENGTH = 20;

    private $id;

    private function __construct()
    {
    }

    /**
     * 自動生成した画像IDをプロパティとして保持する自インスタンスを作成.
     *
     * @return self
     */
    public static function create(): self
    {
        $instance = new self();
        $instance->id = Str::random(self::ID_LENGTH);
        return $instance;
    }

    /**
     * 保持している画像IDを取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->id;
    }
}
