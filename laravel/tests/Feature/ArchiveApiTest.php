<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ArchiveApiTest extends TestCase
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
    public function should_記事をアーカイブできる(): void
    {
        $response = $this->actingAs($this->user)->putJson(route('post.archive', ['id' => $this->post->id]));

        $response->assertStatus(200)->assertExactJson([
            'post_id' => $this->post->id,
        ]);
        $this->assertEquals(1, $this->post->archives()->count());
    }

    /**
     * @test
     */
    public function should_未ログイン状態で記事をアーカイブしようとすると401エラーが返ってくる(): void
    {
        $response = $this->putJson(route('post.archive', ['id' => $this->post->id]));

        $response->assertStatus(401)->assertExactJson(['message' => 'Unauthenticated.']);
        $this->assertEquals(0, $this->post->archives()->count());
    }

    /**
     * @test
     */
    public function should_複数回同じ記事をアーカイブしようとしても1度しかアーカイブできない(): void
    {
        $param = ['id' => $this->post->id];
        $this->actingAs($this->user)->putJson(route('post.archive', $param));
        $this->actingAs($this->user)->putJson(route('post.archive', $param));
        $this->actingAs($this->user)->putJson(route('post.archive', $param));

        $this->assertEquals(1, $this->post->archives()->count());
    }

    /**
     * @test
     */
    public function should_アーカイブする対象が存在しなければ404エラーを返す(): void
    {
        $this->post->delete();
        $response = $this->actingAs($this->user)->putJson(route('post.archive', ['id' => $this->post->id]));

        $response->assertStatus(404);
    }
}
