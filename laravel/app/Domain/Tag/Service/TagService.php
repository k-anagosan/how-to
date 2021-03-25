<?php

namespace App\Domain\Tag\Service;

use App\Domain\Tag\Repository\TagNameRepositoryInterface as TagNameRepository;
use App\Domain\Tag\Repository\TagRepositoryInterface as TagRepository;

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
            $tagNameId = $this->tagNameRepository->findOrSave($tagEntity->getTag());

            $this->tagRepository->save($tagEntity->getPostId(), $tagNameId);
        }
    }
}
