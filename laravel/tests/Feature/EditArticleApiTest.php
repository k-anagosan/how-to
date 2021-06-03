<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Tag;
use App\Models\TagName;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Tests\TestCase;

class EditArticleApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    public function setUp(): void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();

        $this->post = factory(Post::class)->create(['user_id' => $this->user->id]);
        factory(TagName::class, 3)->create()->map(function ($tag): void {
            $tag->tags()->attach($this->post->id);
        });

        // DBには記事が1つしかない
        $this->assertCount(1, Post::all());
        $this->assertDatabaseHas($this->post->getTable(), [
            'title' => $this->post->title,
            'content' => $this->post->content,
            'user_id' => $this->user->id,
        ]);

        // DBにはタグが3つだけ保存されている
        $this->assertCount(3, TagName::all());
        $this->assertCount(3, Tag::all());

        foreach ($this->post->tags as $tagName) {
            $this->assertDatabaseHas($tagName->pivot->getTable(), [
                'post_id' => $tagName->pivot->post_id,
                'tag_name_id' => $tagName->pivot->tag_name_id,
            ]);

            $this->assertDatabaseHas($tagName->getTable(), [
                'id' => $tagName->id,
                'name' => $tagName->name,
            ]);
        }

        $this->data = [
            'title' => $this->faker->sentence,
            'content' => $this->faker->markdown(),
            'tags' => [Str::random(10), Str::random(10), Str::random(10)],
        ];
    }

    /**
     * @test
     */
    public function should_タイトルと文章だけの記事に更新できる(): void
    {
        $this->data['tags'] = null;

        $response = $this->actingAs($this->user)
            ->patchJson(route('post.update', ['id' => $this->post->id]), $this->data);

        $response->assertStatus(200);

        $this->assertEquals($this->post->id, $response->json('post_id'));

        $this->postIsUpdated();

        // タグなし記事に更新された
        $this->assertCount(0, Tag::all());
    }

    /**
     * @test
     */
    public function should_タグ付きの記事をアップロードできる(): void
    {
        $response = $this->actingAs($this->user)
            ->patchJson(route('post.update', ['id' => $this->post->id]), $this->data);

        $response->assertStatus(200);

        $this->assertEquals($this->post->id, $response->json('post_id'));

        $this->postIsUpdated();
        $this->tagsAreUpdated();
    }

    /**
     * @test
     */
    public function should_タイトルがない場合はアップロードできない(): void
    {
        $this->data['title'] = null;

        $response = $this->actingAs($this->user)
            ->patchJson(route('post.update', ['id' => $this->post->id]), $this->data);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'title' => [
                    'タイトル は必須です',
                ],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);

        $this->postIsNotUpdated();
        $this->tagsAreNotUpdated();
    }

    /**
     * @test
     */
    public function should_本文がない場合はアップロードできない(): void
    {
        $this->data['content'] = null;

        $response = $this->actingAs($this->user)
            ->patchJson(route('post.update', ['id' => $this->post->id]), $this->data);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'content' => [
                    '本文 は必須です',
                ],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);

        $this->postIsNotUpdated();
        $this->tagsAreNotUpdated();
    }

    /**
     * @test
     */
    public function should_既に使われているタグの場合ははtag_namesに追加しない(): void
    {
        $tags = array_map(function ($tag) {
            return ['name' => $tag];
        }, $this->data['tags']);

        DB::table('tag_names')->insert($tags);

        $response = $this->actingAs($this->user)
            ->patchJson(route('post.update', ['id' => $this->post->id]), $this->data);

        $response->assertStatus(200);

        $this->assertEquals($this->post->id, $response->json('post_id'));

        $this->postIsUpdated();
        $this->tagsAreUpdated();
    }

    /**
     * @test
     */
    public function should_DBエラーの場合はファイルを保存しない(): void
    {
        // 無理やりDBエラーを起こす
        Schema::drop('tags');

        // アップロードを行う
        $response = $this->actingAs($this->user)
            ->patchJson(route('post.update', ['id' => $this->post->id]), $this->data);

        $response->assertStatus(500);

        $this->postIsNotUpdated();
    }

    /**
     * @test
     */
    public function should_未ログイン状態で記事を更新したら401エラーが返ってくる(): void
    {
        $response = $this->patchJson(route('post.update', ['id' => $this->post->id]), $this->data);

        $response->assertStatus(401)->assertExactJson(['message' => 'Unauthenticated.']);

        $this->postIsNotUpdated();
        $this->tagsAreNotUpdated();
    }

    /**
     * @test
     */
    public function should_権限のないユーザーが記事を更新したら403エラーが返ってくる(): void
    {
        $otherUser = factory(User::class)->create();
        $response = $this->actingAs($otherUser)
            ->patchJson(route('post.update', ['id' => $this->post->id]), $this->data);

        $response->assertStatus(403);

        $this->postIsNotUpdated();
        $this->tagsAreNotUpdated();
    }

    /**
     * @test
     */
    public function should_存在しない記事の更新を試みたら404エラーが返ってくる(): void
    {
        $response = $this->actingAs($this->user)->patchJson(route('post.update', ['id' => Str::random()]), $this->data);

        $response->assertStatus(404);

        $this->postIsNotUpdated();
        $this->tagsAreNotUpdated();
    }

    private function postIsNotUpdated(): void
    {
        // 記事内容に更新がない
        $this->assertCount(1, Post::all());
        $this->assertDatabaseHas($this->post->getTable(), [
            'title' => $this->post->title,
            'content' => $this->post->content,
            'user_id' => $this->user->id,
        ]);
        // 更新予定の記事内容はDBに保存されていない
        $this->assertDatabaseMissing($this->post->getTable(), [
            'title' => $this->data['title'],
            'content' => $this->data['content'],
            'user_id' => $this->user->id,
        ]);
    }

    private function postIsUpdated(): void
    {
        // DBの記事内容が更新されている
        $this->assertCount(1, Post::all());
        $this->assertDatabaseHas($this->post->getTable(), [
            'title' => $this->data['title'],
            'content' => $this->data['content'],
            'user_id' => $this->user->id,
            ]);
        // 更新前の記事内容はDBに存在しない
        $this->assertDatabaseMissing($this->post->getTable(), [
            'title' => $this->post->title,
            'content' => $this->post->content,
            'user_id' => $this->user->id,
        ]);
    }

    private function tagsAreNotUpdated(): void
    {
        // タグに更新はない
        $this->assertCount(3, Tag::all());
        $this->assertCount(3, TagName::all());

        // 更新前のタグがDBに保存されている
        foreach ($this->post->tags as $tagName) {
            $this->assertDatabaseHas($tagName->pivot->getTable(), [
                'post_id' => $tagName->pivot->post_id,
                'tag_name_id' => $tagName->pivot->tag_name_id,
            ]);
        }

        // 更新予定のタグはDBに保存されていない
        foreach ($this->data['tags'] as $tagName) {
            $this->assertDatabaseMissing((new TagName)->getTable(), [
                'name' => $tagName,
            ]);
        }
    }

    private function tagsAreUpdated(): void
    {
        // 更新したタグの個数分DBに保存されている
        $this->assertCount(3, Tag::all());
        $this->assertCount(3 * 2, TagName::all());

        // 更新前のタグはDBに存在しない
        foreach ($this->post->tags as $tagName) {
            $this->assertDatabaseMissing($tagName->pivot->getTable(), [
                'post_id' => $tagName->pivot->post_id,
                'tag_name_id' => $tagName->pivot->tag_name_id,
            ]);
        }

        // 更新後のタグがDBに保存されている
        foreach ($this->data['tags'] as $tagName) {
            $id = TagName::where('name', 'like', $tagName)->first()->id;

            $this->assertDatabaseHas((new Tag)->getTable(), [
                'post_id' => $this->post->id,
                'tag_name_id' => $id,
            ]);

            $this->assertDatabaseHas((new TagName)->getTable(), [
                'id' => $id,
                'name' => $tagName,
            ]);
        }
    }
}
