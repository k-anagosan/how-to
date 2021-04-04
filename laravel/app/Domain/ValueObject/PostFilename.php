<?php

namespace App\Domain\ValueObject;

class PostFilename
{
    private $filename;

    private function __construct()
    {
    }

    /**
     * 制約に通った記事ファイル名をプロパティとして保持する自インスタンスを作成.
     *
     * @param string $primitiveFilename
     * @return self
     */
    public static function create(string $primitiveFilename): self
    {
        $instance = new self();

        if ($primitiveFilename === null) {
            throw new \Exception();
        }

        if (preg_match('/^[0-9a-zA-Z]{20}.md$/', $primitiveFilename) !== 1) {
            throw new \Exception();
        }

        $instance->filename = $primitiveFilename;
        return $instance;
    }

    /**
     * 保持している画像ファイル名を取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->filename;
    }
}
