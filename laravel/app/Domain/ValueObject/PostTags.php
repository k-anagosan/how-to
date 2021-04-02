<?php

namespace App\Domain\ValueObject;

class PostTags
{
    private $tags;

    private function __construct()
    {
    }

    /**
     * PostTagsの配列もしくはnullをプロパティとして保持する自インスタンスを作成.
     *
     * @param mixed $primitiveTags
     */
    public static function create($primitiveTags): self
    {
        $instance = new self();

        if (is_array($primitiveTags) && count($primitiveTags) > 0) {
            foreach ($primitiveTags as $tag) {
                $instance->tags[] = PostTag::create($tag);
            }
        }

        return $instance;
    }

    /**
     * 保持しているPostTagの配列を取得.
     *
     * @return mixed
     */
    public function toArray()
    {
        return $this->tags;
    }
}
