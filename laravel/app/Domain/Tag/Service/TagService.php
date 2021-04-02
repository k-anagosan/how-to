<?php

namespace App\Domain\Tag\Service;

use App\Domain\Tag\Repository\TagNameRepositoryInterface as TagNameRepository;
use App\Domain\Tag\Repository\TagRepositoryInterface as TagRepository;
use Illuminate\Support\Facades\DB;

class TagService
{
    private $tagNameRepository;

    private $tagRepository;

    public function __construct(
        TagNameRepository $tagNameRepository,
        TagRepository $tagRepository
    ) {
        $this->tagNameRepository = $tagNameRepository;
        $this->tagRepository = $tagRepository;
    }

    /**
     * 与えられたTagEntityの配列をそれぞれ永続化していく.
     *
     * @param array $tagEntities
     */
    public function saveTags(array $tagEntities): void
    {
        foreach ($tagEntities as $tagEntity) {
            DB::beginTransaction();

            try {
                $tagNameId = $this->tagNameRepository->findOrSave($tagEntity->getTag());
                $this->tagRepository->save($tagEntity->getPostId(), $tagNameId);
                DB::commit();
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
        }
    }
}
