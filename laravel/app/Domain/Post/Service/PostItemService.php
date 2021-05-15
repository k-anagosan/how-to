<?php

namespace App\Domain\Post\Service;

use App\Domain\Post\Entity\PostItemEntity;
use App\Domain\Post\Repository\PostRepositoryInterface as PostRepository;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\UserAccountId;
use App\Domain\ValueObject\Username;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

class PostItemService
{
    private $postRepository;

    public function __construct(
        PostRepository $postRepository
    ) {
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
            $postId = $this->postRepository->save(
                $postItemEntity->getId(),
                $postItemEntity->getUserId(),
                $postItemEntity->getTitle(),
                $postItemEntity->getContent()
            );

            $this->postRepository->addTags($postItemEntity->getId(), $postItemEntity->getTags());
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }

        return $postId;
    }

    /**
     * 記事IDをもとに保存されている記事を削除する.
     * @param PostItemEntity $deleteItem
     * @throws AccessDeniedHttpException|\Execption
     */
    public function deleteItem(PostItemEntity $deleteItem): void
    {
        if (!$this->postRepository->isOwned($deleteItem->getId(), $deleteItem->getUserId())) {
            throw new AccessDeniedHttpException();
        }

        DB::beginTransaction();

        try {
            $this->postRepository->delete($deleteItem->getId());

            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
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

    /**
     * ユーザーごとの記事一覧データを取得する.
     * @param Username $username
     */
    public function getArticleListByUsername(Username $username): array
    {
        return $this->postRepository->retrieveByUsername($username);
    }

    /**
     * ユーザーがいいねした記事一覧データを取得する.
     * @param UserAccountId $userId
     */
    public function getLikedArticleList(UserAccountId $userId): array
    {
        return $this->postRepository->retrieveLikedArticles($userId);
    }

    public function exists($postId): bool
    {
        return $this->postRepository->exists($postId);
    }
}
