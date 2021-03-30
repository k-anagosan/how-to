<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PostSubmitApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    public function setUp(): void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();

        Storage::fake('s3');

        $this->data = [
            'title' => $this->faker->sentence,
            'content' => $this->faker->text(2000),
            'tags' => [
                $this->faker->word,
                $this->faker->word,
                $this->faker->word,
            ],
        ];
    }

    /**
     * @test
     */
    public function should_タイトルと文章だけの記事をアップロードできる(): void
    {
        $this->data['tags'] = null;

        // アップロードを行う
        $response = $this->actingAs($this->user)->postJson(route('post.create'), $this->data);

        $response->assertStatus(201);

        // レスポンスJSONが期待した構造であるか
        $this->assertMatchesRegularExpression('/^[0-9a-zA-Z]{20}$/', $response->json('post_id'));

        // アップロードによりPostsテーブルにレコードが保存されたか
        $post = $this->user->posts->first();
        $this->assertMatchesRegularExpression('/^[0-9a-zA-Z]{20}$/', $post->id);
        $this->assertDatabaseHas($post->getTable(), [
            'title' => $this->data['title'],
            'content' => $post->content,
            'user_id' => $this->user->id,
        ]);

        // S3に本文がファイルとして保存されているか
        Storage::cloud()->assertExists($post->content);
        $this->assertEquals(Storage::cloud()->get($post->content), $this->data['content']);
    }

    /**
     * @test
     */
    public function should_タグ付きの記事をアップロードできる(): void
    {
        // アップロードを行う
        $response = $this->actingAs($this->user)->postJson(route('post.create'), $this->data);

        $response->assertStatus(201);

        // レスポンスJSONが期待した構造であるか
        $this->assertMatchesRegularExpression('/^[0-9a-zA-Z]{20}$/', $response->json('post_id'));

        // アップロードによりPostsテーブルにレコードが保存されたか
        $post = $this->user->posts->first();
        $this->assertMatchesRegularExpression('/^[0-9a-zA-Z]{20}$/', $post->id);
        $this->assertDatabaseHas($post->getTable(), [
            'title' => $this->data['title'],
            'content' => $post->content,
            'user_id' => $this->user->id,
        ]);

        // S3に本文がファイルとして保存されているか
        Storage::cloud()->assertExists($post->content);
        $this->assertEquals(Storage::cloud()->get($post->content), $this->data['content']);

        // Tagモデルのコレクションを取得
        $tags = $post->tags;

        foreach ($tags->all() as $tag) {
            // 記事に添付されたタグ名がTagテーブルに保存されたか
            $this->assertDatabaseHas($tag->getTable(), [
                'post_id' => $tag->post_id,
                'tag_name_id' => $tag->tag_name_id,
            ]);

            // タグ名がTagNameテーブルに新規登録されたか
            $tagName = $tag->tagName;
            $this->assertDatabaseHas($tagName->getTable(), [
                'id' => $tagName->id,
                'name' => $tagName->name,
            ]);
        }
    }
}

// 既に存在するタグ名の場合はTagNameテーブルに新規登録されない

// 投稿できなかった場合は永続化したものを削除する

// タイトルが無ければ投稿できない

// 記事本文がなければ投稿できない
