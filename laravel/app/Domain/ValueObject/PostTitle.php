<?php

namespace App\Domain\ValueObject;

class PostTitle
{
    private string $title;

    private function __construct()
    {
    }

    /**
     * 制約に通った記事タイトルをプロパティとして保存した自インスタンスを作成.
     *
     * @param string $primitiveTitle
     * @return self
     */
    public static function create(string $primitiveTitle): self
    {
        if ($primitiveTitle === null || mb_strlen($primitiveTitle) <= 0) {
            throw new \Exception();
        }

        $instance = new self();
        $instance->title = $primitiveTitle;
        return $instance;
    }

    /**
     * 保持しているタイトルを取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->title;
    }
}
