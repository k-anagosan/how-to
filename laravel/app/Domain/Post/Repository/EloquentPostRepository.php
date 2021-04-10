<?php

namespace App\Domain\Post\Repository;

use App\Domain\Post\Repository\PostRepositoryInterface as PostRepository;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\UserAccountId;
use App\Models\Post;
use Illuminate\Support\Facades\DB;

class EloquentPostRepository implements PostRepository
{
    public function save(PostId $postId, UserAccountId $userId, PostTitle $title): PostId
    {
        $postOrm = new Post();

        $postOrm->id = $postId->toString();
        $postOrm->user_id = $userId->toInt();
        $postOrm->title = $title->toString();
        $postOrm->filename = $postId->getFilename();

        DB::beginTransaction();

        try {
            $postOrm->save();
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw new $e;
        }

        return $postId;
    }

    public function delete(PostId $postId): void
    {
        $postOrm = Post::find($postId->toString());

        DB::beginTransaction();

        try {
            $postOrm->delete();
            DB::commit();
        } catch (\Exception $e) {
            throw $e;
            DB::rollback();
        }
    }

    public function get(PostId $postId)
    {
        try {
            $post = Post::where('id', $postId->toString())
                ->with(['author', 'tags.tagName'])
                ->first();
        } catch (\Exception $e) {
            throw $e;
        }

        if ($post === null) {
            return [];
        }

        $post = $post->makeVisible('content')->toArray();

        if ($post['tags'] !== null) {
            $post['tags'] = collect($post['tags'])->map(function ($tag) {
                return $tag['tag_name'];
            })->toArray();
        }

        return $post;
    }
}
