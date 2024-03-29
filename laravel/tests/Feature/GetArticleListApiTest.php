<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Tag;
use App\Models\TagName;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GetArticleListApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    private const ARTICLE_SIZE = 300;

    private $perPage = 18;

    private $maxPage = 20;

    public function setUp(): void
    {
        parent::setUp();

        $this->perPage = (new Post())->getPerPage();

        $this->maxPage = floor(self::ARTICLE_SIZE / $this->perPage);
    }

    /**
     * @test
     */
    public function should_パラメーターがない場合に正しい構造のJSONが返却される(): void
    {
        factory(Post::class, self::ARTICLE_SIZE)->create()->map(function ($post): void {
            factory(TagName::class, 3)->create()->map(function ($tagName) use ($post): void {
                factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tagName->id]);
            });
        });

        $response = $this->getJson(route('posts'));

        $posts = Post::with(['author', 'tags', 'likes', 'archives'])
            ->orderBy(Post::CREATED_AT, 'desc')
            ->limit($this->perPage)
            ->get();

        $expect = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'tags' => $post->tags->toArray(),
                'author' => [
                    'name' => $post->author->name,
                ],
                'likes_count' => $post->likes_count,
                'liked_by_me' => $post->liked_by_me,
                'archived_by_me' => $post->archived_by_me,
            ];
        })->toArray();

        $response->assertStatus(200)
            ->assertJsonCount($this->perPage, 'data')
            ->assertJsonFragment(['data' => $expect]);

        $this->assertEquals(self::ARTICLE_SIZE, $response->json('total'));
    }

    /**
     * @test
     */
    public function should_ページのクエリストリングがある場合に正しい構造のJSONが返却される(): void
    {
        factory(Post::class, self::ARTICLE_SIZE)->create()->map(function ($post): void {
            factory(TagName::class, 3)->create()->map(function ($tagName) use ($post): void {
                factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tagName->id]);
            });
        });

        $page = random_int(1, $this->maxPage);

        $response = $this->getJson(route('posts', ['page' => $page]));

        $posts = Post::with(['author', 'tags', 'likes', 'archives'])
            ->orderBy(Post::CREATED_AT, 'desc')
            ->limit($this->perPage)
            ->offset(($page - 1) * $this->perPage)
            ->get();

        $expect = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'tags' => $post->tags->toArray(),
                'author' => [
                    'name' => $post->author->name,
                ],
                'likes_count' => $post->likes_count,
                'liked_by_me' => $post->liked_by_me,
                'archived_by_me' => $post->archived_by_me,
            ];
        })->toArray();

        $response->assertStatus(200)
            ->assertJsonCount($this->perPage, 'data')
            ->assertJsonFragment(['data' => $expect]);

        $this->assertEquals(self::ARTICLE_SIZE, $response->json('total'));
    }

    /**
     * @test
     */
    public function should_タグのクエリストリングがある場合に正しい構造のJSONが返却される(): void
    {
        factory(TagName::class, 3)->create()->map(function ($tag): void {
            factory(Post::class, self::ARTICLE_SIZE)->create()->map(function ($post) use ($tag): void {
                factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tag->id]);
            });
        });

        $queryTag = TagName::first()->name;

        $response = $this->getJson(route('posts', ['tag' => $queryTag]));

        $posts = Post::with(['author', 'tags', 'likes', 'archives'])
            ->whereHas('tags', function ($query) use ($queryTag): void {
                $query->where('name', 'like', $queryTag);
            })
            ->orderBy(Post::CREATED_AT, 'desc')
            ->limit($this->perPage)
            ->get();

        $expect = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'tags' => $post->tags->toArray(),
                'author' => [
                    'name' => $post->author->name,
                ],
                'likes_count' => $post->likes_count,
                'liked_by_me' => $post->liked_by_me,
                'archived_by_me' => $post->archived_by_me,
            ];
        })->toArray();

        $response->assertStatus(200)
            ->assertJsonCount($this->perPage, 'data')
            ->assertJsonFragment(['data' => $expect]);

        $this->assertEquals(self::ARTICLE_SIZE, $response->json('total'));
    }

    /**
     * @test
     */
    public function should_アイテムが存在しないページならば404エラーが返ってくる(): void
    {
        $response = $this->getJson(route('posts'));

        $response->assertStatus(404);
    }
}
