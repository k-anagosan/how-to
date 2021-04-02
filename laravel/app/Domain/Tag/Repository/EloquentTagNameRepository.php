<?php

namespace App\Domain\Tag\Repository;

use App\Domain\Tag\Repository\TagNameRepositoryInterface as TagNameRepository;
use App\Domain\ValueObject\PostTag;
use App\Domain\ValueObject\TagNameId;
use App\Models\TagName;
use Illuminate\Support\Facades\DB;

class EloquentTagNameRepository implements TagNameRepository
{
    public function findOrSave(PostTag $postTag): TagNameId
    {
        DB::beginTransaction();

        try {
            $tagNameId = TagName::firstOrCreate(['name' => $postTag->toString()])->id;
            DB::commit();
            return TagNameId::create($tagNameId);
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }
}
