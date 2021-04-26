<?php

namespace App\Domain\Post\Repository;

use App\Domain\Post\Repository\PostRepositoryInterface as PostRepository;
use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTag;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;
use App\Domain\ValueObject\TagNameId;
use App\Domain\ValueObject\UserAccountId;
use App\Models\Post;
use App\Models\TagName;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Request;

class EloquentPostRepository implements PostRepository
{
    public function save(PostId $postId, UserAccountId $userId, PostTitle $title, PostContent $content): PostId
    {
        DB::beginTransaction();

        try {
            $postOrm = new Post();

            $postOrm->id = $postId->toString();
            $postOrm->user_id = $userId->toInt();
            $postOrm->title = $title->toString();
            $postOrm->content = $content->toString();
            $postOrm->save();
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
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
                ->with(['author', 'tags', 'likes'])
                ->first();
        } catch (\Exception $e) {
            throw $e;
        }

        if ($post === null) {
            return [];
        }
        $post = $post->makeVisible('content')->toArray();

        return $post;
    }

    public function retrieve()
    {
        $posts = null;

        try {
            $posts = Post::with(['author', 'tags', 'likes']);

            if (Request::hasAny('tag') && Request::input('tag') !== null) {
                $posts = $posts->whereHas('tags', function ($query): void {
                    $query->where('name', 'like', Request::input('tag'));
                });
            }

            $posts = $posts->orderBy(Post::CREATED_AT, 'desc')
                ->paginate((new Post)->getPerPage())
                ->toArray();
        } catch (\Exception $e) {
            throw $e;
        }

        if (count($posts['data']) === 0) {
            return [];
        }

        return $posts;
    }

    public function addTags(PostId $postId, PostTags $tags): void
    {
        DB::beginTransaction();

        try {
            $post = Post::where('id', 'like', $postId->toString())->with(['tags'])->first();
            $tagNameIds = collect($tags->toArray())->map(function ($tag) {
                return $this->findOrCraeteTagName($tag)->toInt();
            })->all();
            $post->tags()->attach($tagNameIds);
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function findOrCraeteTagName(PostTag $postTag): TagNameId
    {
        DB::beginTransaction();

        try {
            $tagNameId = TagName::firstOrCreate(['name' => $postTag->toString()])->id;
            DB::commit();
            return TagNameId::create($tagNameId);
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }
    }

    public function putLike(PostId $postId, UserAccountId $userId)
    {
        $post = Post::where('id', $postId->toString())->with(['likes'])->first();

        if (!$post) {
            return;
        }

        DB::beginTransaction();

        try {
            $post->likes()->detach($userId->toInt());
            $post->likes()->attach($userId->toInt());
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }

        return $postId;
    }

    public function deleteLike(PostId $postId, UserAccountId $userId)
    {
        $post = Post::where('id', $postId->toString())->with(['likes'])->first();

        if (!$post) {
            return;
        }

        DB::beginTransaction();

        try {
            $post->likes()->detach($userId->toInt());
            DB::commit();
        } catch (\Exception $e) {
            DB::rollback();
            throw $e;
        }

        return $postId;
    }
}
