<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DeleteArchiveApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    public function setUp(): void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();

        factory(Post::class)->create();
        $this->post = Post::first();
        $this->post->archives()->attach($this->user->id);
        $this->assertEquals(1, $this->post->archives()->count());
    }

    /**
     * @test
     */
    public function should_アーカイブの解除ができる(): void
    {
        $response = $this->actingAs($this->user)->deleteJson(route('post.delete.archive', ['id' => $this->post->id]));

        $response->assertStatus(200)->assertExactJson([
            'post_id' => $this->post->id,
        ]);
        $this->assertEquals(0, $this->post->archives()->count());
    }

    /**
     * @test
     */
    public function should_未ログイン状態でアーカイブの解除をしようとすると401エラーが返ってくる(): void
    {
        $response = $this->deleteJson(route('post.delete.archive', ['id' => $this->post->id]));

        $response->assertStatus(401)->assertExactJson(['message' => 'Unauthenticated.']);
        $this->assertEquals(1, $this->post->archives()->count());
    }

    /**
     * @test
     */
    public function should_複数回同じ記事のアーカイブの解除をしても1度しか削除されない(): void
    {
        $param = ['id' => $this->post->id];
        $this->actingAs($this->user)->deleteJson(route('post.delete.archive', $param));
        $this->actingAs($this->user)->deleteJson(route('post.delete.archive', $param));
        $this->actingAs($this->user)->deleteJson(route('post.delete.archive', $param));

        $this->assertEquals(0, $this->post->archives()->count());
    }

    /**
     * @test
     */
    public function should_アーカイブの解除をする対象が存在しなければ404エラーを返す(): void
    {
        $this->post->delete();
        $response = $this->actingAs($this->user)->deleteJson(route('post.delete.archive', ['id' => $this->post->id]));

        $response->assertStatus(404);
    }
}
