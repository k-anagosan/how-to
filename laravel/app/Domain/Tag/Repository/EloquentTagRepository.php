<?php

namespace App\Domain\Tag\Repository;

use App\Domain\Tag\Repository\TagRepositoryInterface as TagRepository;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\TagNameId;
use App\Models\Tag;

class EloquentTagRepository implements TagRepository
{
    /**
     * 引数の情報をTagストアに保存.
     *
     * @param PostId    $postId
     * @param TagNameId $tagNameId
     */
    public function save(PostId $postId, TagNameId $tagNameId): void
    {
        $tagOrm = new Tag();

        $tagOrm->post_id = $postId->toString();
        $tagOrm->tag_name_id = $tagNameId->toInt();

        try {
            $tagOrm->save();
        } catch (\Exception $e) {
            throw new \Exception($e);
        }
    }
}
