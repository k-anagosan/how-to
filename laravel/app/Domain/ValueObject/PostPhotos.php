<?php

namespace App\Domain\ValueObject;

class PostPhotos
{
    private $photos;

    private function __construct()
    {
    }

    /**
     * PostPhotoの配列もしくはnullをプロパティとして保持する自インスタンスを作成.
     *
     * @param mixed $primitivePhotos
     * @return self
     */
    public static function create($primitivePhotos): self
    {
        $instance = new self();

        if (is_array($primitivePhotos)) {
            foreach ($primitivePhotos as $primitivePhoto) {
                $instance->photos[] = PostPhoto::create($primitivePhoto);
            }
        }

        return $instance;
    }

    /**
     * 保持しているPostPhotoの配列を取得.
     *
     * @return mixed
     */
    public function toArray()
    {
        return $this->photos;
    }
}
