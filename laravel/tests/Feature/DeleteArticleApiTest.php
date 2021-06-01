<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\TagName;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Str;
use Tests\TestCase;

class DeleteArticleApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    public function setUp(): void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();
        $this->tagNames = factory(TagName::class, 3)->create();
        $this->post = factory(Post::class)->create(['user_id' => $this->user->id]);

        $this->assertDatabaseHas($this->post->getTable(), [
            'id' => $this->post->id,
        ]);
    }

    /**
     * @test
     */
    public function should_タグ無し記事を削除できる(): void
    {
        $response = $this->actingAs($this->user)->deleteJson(route('post.delete', ['id' => $this->post->id]));

        $response->assertStatus(200)->assertExactJson(['id' => $this->post->id]);
        $this->assertDatabaseMissing($this->post->getTable(), [
            'id' => $this->post->id,
        ]);
    }

    /**
     * @test
     */
    public function should_タグつき記事を削除できる(): void
    {
        $post = $this->post;
        $this->tagNames->map(function ($tagName) use ($post): void {
            $tagName->tags()->attach($post->id);
            $this->assertDatabaseHas('tags', [
                'post_id' => $post->id,
                'tag_name_id' => $tagName->id,
            ]);
        });
        $response = $this->actingAs($this->user)->deleteJson(route('post.delete', ['id' => $post->id]));

        $response->assertStatus(200)->assertExactJson(['id' => $this->post->id]);
        $this->assertDatabaseMissing($post->getTable(), [
            'id' => $post->id,
        ]);
        $this->tagNames->map(function ($tagName) use ($post): void {
            $tagName->tags()->attach($post->id);
            $this->assertDatabaseMissing('tags', [
                'id' => $tagName->id,
                'post_id' => $post->id,
            ]);
        });
    }

    /**
     * @test
     */
    public function should_いいね付き記事を削除できる(): void
    {
        $users = factory(User::class, 5)->create();
        $this->post->likes()->attach($users->map(fn ($user) => $user->id)->toArray());
        $users->map(function ($user): void {
            $this->assertDatabaseHas('likes', [
                'post_id' => $this->post->id,
                'user_id' => $user->id,
            ]);
        });

        $response = $this->actingAs($this->user)->deleteJson(route('post.delete', ['id' => $this->post->id]));

        $response->assertStatus(200)->assertExactJson(['id' => $this->post->id]);
        $this->assertDatabaseMissing($this->post->getTable(), [
            'id' => $this->post->id,
        ]);
        $users->map(function ($user): void {
            $this->assertDatabaseMissing('likes', [
                'post_id' => $this->post->id,
                'user_id' => $user->id,
            ]);
        });
    }

    /**
     * @test
     */
    public function should_アーカイブされた記事を削除できる(): void
    {
        $users = factory(User::class, 5)->create();
        $this->post->archives()->attach($users->map(fn ($user) => $user->id)->toArray());
        $users->map(function ($user): void {
            $this->assertDatabaseHas('archives', [
                'post_id' => $this->post->id,
                'user_id' => $user->id,
            ]);
        });

        $response = $this->actingAs($this->user)->deleteJson(route('post.delete', ['id' => $this->post->id]));

        $response->assertStatus(200)->assertExactJson(['id' => $this->post->id]);
        $this->assertDatabaseMissing($this->post->getTable(), [
            'id' => $this->post->id,
        ]);
        $users->map(function ($user): void {
            $this->assertDatabaseMissing('archives', [
                'post_id' => $this->post->id,
                'user_id' => $user->id,
            ]);
        });
    }

    /**
     * @test
     */
    public function should_権限のないユーザーが削除を行うと403エラーが返される(): void
    {
        $user = factory(User::class)->create();
        $response = $this->actingAs($user)->deleteJson(route('post.delete', ['id' => $this->post->id]));

        $response->assertStatus(403);
        $this->assertDatabaseHas($this->post->getTable(), [
            'id' => $this->post->id,
        ]);
    }

    /**
     * @test
     */
    public function should_存在しない記事に対して削除を行うと404エラーが返される(): void
    {
        $response = $this->actingAs($this->user)->deleteJson(route('post.delete', ['id' => Str::random(20)]));

        $response->assertStatus(404);
    }

    /**
     * @test
     */
    public function should_未ログインユーザーが削除を行うと401エラーが返される(): void
    {
        $response = $this->deleteJson(route('post.delete', ['id' => $this->post->id]));

        $response->assertStatus(401);
        $this->assertDatabaseHas($this->post->getTable(), [
            'id' => $this->post->id,
        ]);
    }
}
