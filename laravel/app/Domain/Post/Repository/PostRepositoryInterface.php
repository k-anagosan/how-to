<?php

namespace App\Domain\Post\Repository;

use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\UserAccountId;

interface PostRepositoryInterface
{
    /**
     * 引数の情報をPostストアに保存.
     *
     * @param PostId        $postId
     * @param UserAccountId $userId
     * @param PostTitle     $title
     *
     * @return PostId
     */
    public function save(PostId $postId, UserAccountId $userId, PostTitle $title): PostId;
}
