<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Tag;
use App\Models\TagName;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Str;
use Tests\TestCase;

class GetArticleDetailApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    /**
     * @test
     */
    public function should_タグがある場合の正しい構造のJSONが返される(): void
    {
        factory(Post::class)->create()->each(function (Post $post): void {
            factory(TagName::class, 3)->create()->each(function (TagName $tagName) use ($post): void {
                factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tagName->id]);
            });
        });

        $post = Post::with(['author', 'tags', 'likes', 'archives'])->first();

        $response = $this->getJson(route('post.show', ['id' => $post->id]));

        $response->assertStatus(200)
            ->assertExactJson([
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'tags' => $post->tags->toArray(),
                'author' => [
                    'name' => $post->author->name,
                ],
                'likes_count' => $post->likes_count,
                'liked_by_me' => $post->liked_by_me,
                'archived_by_me' => $post->archived_by_me,
            ]);
    }

    /**
     * @test
     */
    public function should_タグがない場合の正しい構造のJSONが返される(): void
    {
        factory(Post::class)->create();

        $post = Post::with(['author', 'tags', 'likes', 'archives'])->first();

        $response = $this->getJson(route('post.show', ['id' => $post->id]));

        $response->assertStatus(200)
            ->assertExactJson([
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'tags' => [],
                'author' => [
                    'name' => $post->author->name,
                ],
                'likes_count' => $post->likes_count,
                'liked_by_me' => $post->liked_by_me,
                'archived_by_me' => $post->archived_by_me,
            ]);
    }

    /**
     * @test
     */
    public function should_存在しないIDが渡された場合、404エラーが返される(): void
    {
        $response = $this->getJson(route('post.show', ['id' => Str::random(20)]));

        $response->assertStatus(404);
    }
}
