<?php

namespace App\Domain\Tag\Repository;

use App\Domain\Tag\Repository\TagNameRepositoryInterface as TagNameRepository;
use App\Domain\ValueObject\PostTag;
use App\Domain\ValueObject\TagNameId;
use App\Models\TagName;

class EloquentTagNameRepository implements TagNameRepository
{
    public function findOrSave(PostTag $postTag): TagNameId
    {
        $tagNameId = TagName::firstOrCreate(['name' => $postTag->toString()])->id;
        return TagNameId::create($tagNameId);
    }
}
