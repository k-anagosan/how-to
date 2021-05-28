<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Tag;
use App\Models\TagName;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GetUserArticleListApiTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

        $this->perPage = 12;

        for ($i = 0; $i < 3; $i++) {
            $user = factory(User::class)->create();
            $this->createData($user);
        }
        $this->user = factory(User::class)->create();
        $this->posts = $this->createData($this->user);
    }

    /**
     * @test
     */
    public function should_ユーザーページ表示に必要なデータを返す(): void
    {
        $response = $this->getJson(route('user.show', $this->user->name));

        $expect = $this->posts->map(function ($post) {
            return [
                    'id' => $post->id,
                    'title' => $post->title,
                    'tags' => $post->tags->toArray(),
                    'author' => [
                        'name' => $this->user->name,
                    ],
                    'likes_count' => $post->likes_count,
                    'liked_by_me' => $post->liked_by_me,
                    'archived_by_me' => $post->archived_by_me,
                ];
        })->toArray();

        $response->assertStatus(200)
            ->assertJsonCount($this->perPage, 'data')
            ->assertJsonFragment(['data' => $expect]);
    }

    /**
     * @test
     */
    public function should_記事未投稿ユーザーであっても正しいレスポンスが返される(): void
    {
        $user = factory(User::class)->create();
        $response = $this->getJson(route('user.show', $user->name));

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data')
            ->assertJsonFragment(['data' => []]);
    }

    /**
     * @test
     */
    public function should_存在しないユーザーのページをアクセスすると404エラーが返される(): void
    {
        $response = $this->getJson(route('user.show', Str::random()));

        $response->assertStatus(404);
    }

    private function createData($user)
    {
        factory(Post::class, 30)->create(['user_id' => $user->id])->each(function (Post $post): void {
            factory(TagName::class, 3)->create()->each(function (TagName $tagName) use ($post): void {
                factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tagName->id]);
            });
        });
        return Post::with(['author', 'tags', 'likes', 'archives'])
            ->whereHas('author', function ($query) use ($user): void {
                $query->where('name', 'like', $user->name);
            })->limit($this->perPage)->orderBy(Post::CREATED_AT, 'desc')->get();
    }
}
