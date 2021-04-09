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

    private const POST_SIZE = 1000;

    public function setUp(): void
    {
        parent::setUp();
    }

    /**
     * @test
     */
    public function should_パラメーターがない場合に正しい構造のJSONが返却される(): void
    {
        factory(Post::class, self::POST_SIZE)->create()->map(function ($post): void {
            factory(TagName::class, 3)->create()->map(function ($tagName) use ($post): void {
                factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tagName->id]);
            });
        });

        $response = $this->getJson(route('posts'));

        $posts = Post::with(['author', 'tags.tagName'])->orderBy(Post::CREATED_AT, 'desc')->limit(10)->get();

        $expect = $posts->map(function ($post) {
            return [
                'id' => $post->id,
                'title' => $post->title,
                'tags' => $post->tags->map(function ($tag) {
                    return $tag->tagName;
                })->toArray(),
                'author' => [
                    'name' => $post->author->name,
                ],
            ];
        })->toArray();

        $response->assertStatus(200)
            ->assertJsonCount(10, 'data')
            ->assertJsonFragment(['data' => $expect]);
    }
}
