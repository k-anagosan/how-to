<?php

namespace App\Domain\Post\Repository;

use App\Domain\Post\Repository\PostRepositoryInterface as PostRepository;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\UserAccountId;
use App\Models\Post;

class EloquentPostRepository implements PostRepository
{
    public function save(PostId $postId, UserAccountId $userId, PostTitle $title): PostId
    {
        $postOrm = new Post();

        $postOrm->id = $postId->toString();
        $postOrm->user_id = $userId->toInt();
        $postOrm->title = $title->toString();
        $postOrm->content = $postId->getFilename();

        try {
            $postOrm->save();
        } catch (\Exception $e) {
            throw new \Exception($e);
        }

        return $postId;
    }
}
