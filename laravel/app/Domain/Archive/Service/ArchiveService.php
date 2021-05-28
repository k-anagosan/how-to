<?php

namespace App\Domain\Archive\Service;

use App\Domain\Archive\Entity\ArchiveEntity;
use App\Domain\Post\Repository\PostRepositoryInterface as PostRepository;
use App\Domain\ValueObject\PostId;

class ArchiveService
{
    private $postRepository;

    public function __construct(PostRepository $postRepository)
    {
        $this->postRepository = $postRepository;
    }

    /**
     * ArchiveEntityをもとに記事をアーカイブする。
     *
     * @param ArchiveEntity $archiveEntity
     * @return null|PostId
     */
    public function putArchive(ArchiveEntity $archiveEntity)
    {
        return $this->postRepository->putArchive($archiveEntity->getPostId(), $archiveEntity->getUserId());
    }

    /**
     * ArchiveEntityをもとにアーカイブ解除を行う。
     *
     * @param ArchiveEntity $archiveEntity
     * @return null|PostId
     */
    public function deleteArchive(ArchiveEntity $archiveEntity)
    {
        return $this->postRepository->deleteArchive($archiveEntity->getPostId(), $archiveEntity->getUserId());
    }
}
