<?php

namespace App\Domain\ValueObject;

class PostContent
{
    private $content;

    private function __construct()
    {
    }

    /**
     * 制約に通った記事本文をプロパティとして保存した自インスタンスを作成.
     *
     * @param string $primitiveContent
     * @return self
     */
    public static function create(string $primitiveContent): self
    {
        if ($primitiveContent === null || mb_strlen($primitiveContent) <= 0) {
            throw new \Exception();
        }

        $instance = new self();
        $instance->content = $primitiveContent;
        return $instance;
    }

    /**
     * 保持している記事本文を取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->content;
    }
}
