<?php

namespace App\Domain\ValueObject;

class PostTag
{
    private $tag;

    private function __construct()
    {
    }

    /**
     * 制約に通ったタグをプロパティとして保存した自インスタンスを作成.
     *
     * @param string $primitiveTag
     */
    public static function create(string $primitiveTag): self
    {
        if ($primitiveTag === null || mb_strlen($primitiveTag) <= 0) {
            throw new \Exception();
        }

        $instance = new self();
        $instance->tag = $primitiveTag;
        return $instance;
    }

    /**
     * 保持しているタグを取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->tag;
    }
}
