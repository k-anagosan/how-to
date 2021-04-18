<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class LikeApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    public function setUp(): void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();

        factory(Post::class)->create();
        $this->post = Post::first();
    }

    /**
     * @test
     */
    public function should_いいねが送れる(): void
    {
        $response = $this->actingAs($this->user)->putJson(route('post.like', ['id' => $this->post->id]));

        $response->assertStatus(200)->assertExactJson([
            'post_id' => $this->post->id,
        ]);
        $this->assertEquals(1, $this->post->likes()->count());
    }

    /**
     * @test
     */
    public function should_未ログイン状態でいいねを送ったら401エラーが返ってくる(): void
    {
        $response = $this->putJson(route('post.like', ['id' => $this->post->id]));

        $response->assertStatus(401)->assertExactJson(['message' => 'Unauthenticated.']);
        $this->assertEquals(0, $this->post->likes()->count());
    }

    /**
     * @test
     */
    public function should_複数回同じ記事にいいねを送っても1回しか付与されない(): void
    {
        $param = ['id' => $this->post->id];
        $this->actingAs($this->user)->putJson(route('post.like', $param));
        $this->actingAs($this->user)->putJson(route('post.like', $param));
        $this->actingAs($this->user)->putJson(route('post.like', $param));

        $this->assertEquals(1, $this->post->likes()->count());
    }
}
