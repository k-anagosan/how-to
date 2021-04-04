<?php

namespace App\Domain\Post\Service;

use App\Domain\Post\Entity\PostItemEntity;
use App\Domain\Post\Repository\CloudContentRepositoryInterface as CloudContentRepository;
use App\Domain\Post\Repository\PostRepositoryInterface as PostRepository;
use App\Domain\ValueObject\PostId;

class PostItemService
{
    private $cloudContentRepository;

    private $postRepository;

    public function __construct(
        CloudContentRepository $cloudContentRepository,
        PostRepository $postRepository
    ) {
        $this->cloudContentRepository = $cloudContentRepository;
        $this->postRepository = $postRepository;
    }

    public function saveItem(PostItemEntity $postItemEntity): PostId
    {
        $this->cloudContentRepository->save($postItemEntity->getId(), $postItemEntity->getContent());

        return $this->postRepository->save(
            $postItemEntity->getId(),
            $postItemEntity->getUserId(),
            $postItemEntity->getTitle()
        );
    }

    public function deleteItem(PostId $postId): void
    {
        $this->cloudContentRepository->delete($postId);

        $this->postRepository->delete($postId);
    }

    public function getArticle(PostId $postId)
    {
        return $this->postRepository->get($postId);
    }
}
