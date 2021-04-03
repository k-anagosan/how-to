<?php

namespace App\Domain\ValueObject;

use Illuminate\Support\Str;

class PostId
{
    /**
     * IDの長さ.
     */
    private const ID_LENGTH = 20;

    /**
     * ファイル名生成時の拡張子.
     */
    private const EXTENSION = '.md';

    private $id;

    private function __construct()
    {
    }

    /**
     * 制約に通った記事ID、もしくは自動生成した記事IDをプロパティとして保持する自インスタンスを作成.
     *
     * @param string $primitiveId
     * @return self
     */
    public static function create(string $primitiveId = ''): self
    {
        $instance = new self();

        if ($primitiveId === null) {
            throw new \Exception();
        }

        if (preg_match('/^[a-zA-Z0-9]{20}$/', $primitiveId)) {
            $instance->id = $primitiveId;
        } else {
            $instance->id = Str::random(self::ID_LENGTH);
        }
        return $instance;
    }

    /**
     * 保持している記事IDを取得.
     *
     * @return string
     */
    public function toString(): string
    {
        return $this->id;
    }

    /**
     * 保持している記事IDをもとに、拡張子を伴うファイル名を生成.
     *
     * @return string
     */
    public function getFilename(): string
    {
        return $this->id . self::EXTENSION;
    }
}
