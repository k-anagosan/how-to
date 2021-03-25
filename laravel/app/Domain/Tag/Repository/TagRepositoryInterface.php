<?php

namespace App\Domain\Tag\Repository;

use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\TagNameId;

interface TagRepositoryInterface
{
    /**
     * 引数の情報をTagストアに保存.
     *
     * @param PostId    $postId
     * @param TagNameId $tagNameId
     */
    public function save(PostId $postId, TagNameId $tagNameId): void;
}
