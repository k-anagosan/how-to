<?php

namespace App\Domain\ValueObject;

use Illuminate\Http\UploadedFile;

class PostPhoto
{
    /**
     * 1ファイルあたりの最大バイト数.
     */
    private const MAX_SIZE = 1024 * 1024;

    private $photo;

    private $extension;

    private function __construct()
    {
    }

    /**
     * 制約に通ったUploadedFileをプロパティとして保存した自インスタンスを作成.
     *
     * @param UploadedFile $primitivePhoto
     */
    public static function create(UploadedFile $primitivePhoto): self
    {
        if (!in_array($primitivePhoto->extension(), ['jpg', 'jpeg', 'png', 'gif'], true)) {
            throw new \Exception();
        }

        if ($primitivePhoto->getSize() > self::MAX_SIZE) {
            throw new \Exception();
        }

        $instance = new self();
        $instance->photo = $primitivePhoto;
        $instance->extension = $primitivePhoto->extension();
        return $instance;
    }

    /**
     * 保持している画像インスタンスを取得.
     *
     * @return UploadedFile
     */
    public function getPhoto(): UploadedFile
    {
        return $this->photo;
    }

    /**
     * 保持している画像インスタンスの拡張子を取得.
     *
     * @return string
     */
    public function getExtension(): string
    {
        return $this->extension;
    }
}
