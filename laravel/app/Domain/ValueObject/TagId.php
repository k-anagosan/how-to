<?php

namespace App\Domain\ValueObject;

class TagId
{
    private $id;

    private function __construct()
    {
    }

    /**
     * タグIDをプロパティとして保持する自インスタンスを作成.
     *
     * @param int $primitiveId
     */
    public static function create(int $primitiveId): self
    {
        if ($primitiveId === null || $primitiveId <= 0) {
            throw new \Exception();
        }

        $instance = new self();
        $instance->id = $primitiveId;
        return $instance;
    }

    /**
     * 保持しているタグIDを取得.
     *
     * @return int
     */
    public function toInt(): int
    {
        return $this->id;
    }
}
