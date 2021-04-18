<?php

namespace App\Domain\Like\Service;

use App\Domain\Like\Entity\LikeEntity;
use App\Domain\Post\Repository\PostRepositoryInterface as PostRepository;
use App\Domain\ValueObject\PostId;

class LikeService
{
    private $postRepository;

    public function __construct(PostRepository $postRepository)
    {
        $this->postRepository = $postRepository;
    }

    /**
     * LikeEntityをもとにいいねを付与する。。
     *
     * @param LikeEntity $likeEntity
     */
    public function putLike(LikeEntity $likeEntity): PostId
    {
        return $this->postRepository->putLike($likeEntity->getPostId(), $likeEntity->getUserId());
    }

    /**
     * LikeEntityをもとにいいねを削除する。
     *
     * @param LikeEntity $likeEntity
     */
    public function deleteLike(LikeEntity $likeEntity): PostId
    {
        return $this->postRepository->deleteLike($likeEntity->getPostId(), $likeEntity->getUserId());
    }
}
