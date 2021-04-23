<?php

namespace App\Domain\Post\Service;

use App\Domain\Post\Entity\PostItemEntity;
use App\Domain\Post\Repository\CloudContentRepositoryInterface as CloudContentRepository;
use App\Domain\Post\Repository\PostRepositoryInterface as PostRepository;
use App\Domain\ValueObject\PostId;
use Illuminate\Support\Facades\DB;

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
        $postId = null;

        DB::beginTransaction();

        try {
            $this->cloudContentRepository->save($postItemEntity->getId(), $postItemEntity->getContent());

            $postId = $this->postRepository->save(
                $postItemEntity->getId(),
                $postItemEntity->getUserId(),
                $postItemEntity->getTitle(),
            );

            $this->postRepository->addTags($postItemEntity->getId(), $postItemEntity->getTags());
            DB::commit();
        } catch (\Exception $e) {
            $this->cloudContentRepository->delete($postItemEntity->getId());
            DB::rollback();
            throw $e;
        }

        return $postId;
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
