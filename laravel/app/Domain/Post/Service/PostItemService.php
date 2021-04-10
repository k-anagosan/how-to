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

    /**
     * 与えられたPostItemEntityをもとに永続化を行う.
     * @param PostItemEntity $postItemEntity
     */
    public function saveItem(PostItemEntity $postItemEntity): PostId
    {
        $this->cloudContentRepository->save($postItemEntity->getId(), $postItemEntity->getContent());

        return $this->postRepository->save(
            $postItemEntity->getId(),
            $postItemEntity->getUserId(),
            $postItemEntity->getTitle()
        );
    }

    /**
     * 記事IDをもとに保存されている記事を削除する.
     * @param PostId $postId
     */
    public function deleteItem(PostId $postId): void
    {
        $this->cloudContentRepository->delete($postId);

        $this->postRepository->delete($postId);
    }

    /**
     * 記事IDをもとに記事データを取得する.
     * @param PostId $postId
     */
    public function getArticle(PostId $postId): array
    {
        return $this->postRepository->get($postId);
    }

    /**
     * 記事一覧データを取得する.
     */
    public function getArticleList(): array
    {
        return $this->postRepository->retrieve();
    }
}
