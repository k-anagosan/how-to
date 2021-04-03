<?php

namespace Tests\Feature;

use App\Models\Post;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GetArticleDetailApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @test
     */
    public function should_正しい構造のJSONが返される(): void
    {
        factory(Post::class)->create();
        $post = Post::first();

        $response = $this->getJson(route('post.show', ['id' => $post->id]));

        $response->assertStatus(200)
            ->assertJsonFragment([
                'id' => $post->id,
                'url' => $post->url,
                'author' => [
                    'name' => $post->author->name,
                ],
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
