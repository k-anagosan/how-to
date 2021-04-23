<?php

namespace Tests\Feature;

use App\Models\TagName;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
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
            'tags' => [Str::random(10), Str::random(10), Str::random(10)],
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
            'filename' => $post->filename,
            'user_id' => $this->user->id,
        ]);

        // S3に本文がファイルとして保存されているか
        Storage::cloud()->assertExists('contents/' . $post->filename);
        $this->assertEquals(Storage::cloud()->get('contents/' . $post->filename), $this->data['content']);
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
            'filename' => $post->filename,
            'user_id' => $this->user->id,
        ]);

        // S3に本文がファイルとして保存されているか
        Storage::cloud()->assertExists('contents/' . $post->filename);
        $this->assertEquals(Storage::cloud()->get('contents/' . $post->filename), $this->data['content']);

        // 中間テーブルTagをpivotに含めたTagNameモデルへのリレーションを取得
        $tagNames = $post->tags;

        foreach ($tagNames->all() as $tagName) {
            // 記事に添付されたタグ名がTagテーブルに保存されたか
            $this->assertDatabaseHas($tagName->pivot->getTable(), [
                'post_id' => $tagName->pivot->post_id,
                'tag_name_id' => $tagName->pivot->tag_name_id,
            ]);

            // タグ名がTagNameテーブルに新規登録されたか
            $this->assertDatabaseHas($tagName->getTable(), [
                'id' => $tagName->id,
                'name' => $tagName->name,
            ]);
        }
    }

    /**
     * @test
     */
    public function should_タイトルがない場合はアップロードできない(): void
    {
        $this->data['title'] = null;

        // アップロードを行う
        $response = $this->actingAs($this->user)->postJson(route('post.create'), $this->data);

        // レスポンスJSONが期待した構造であるか

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'title' => [
                    'タイトル は必須です',
                ],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);

        // 今回のアップロードではDBにレコードが保存されなかったか
        $this->assertEquals(0, $this->user->posts()->count());
        $this->assertEmpty(TagName::all());

        // 今回のアップロードではS3に本文が保存されなかったか
        $this->assertCount(0, Storage::cloud()->files('contents/'));
    }

    /**
     * @test
     */
    public function should_タイトルが長すぎる場合はアップロードできない(): void
    {
        $this->data['title'] = Str::random(256);

        // アップロードを行う
        $response = $this->actingAs($this->user)->postJson(route('post.create'), $this->data);

        // レスポンスJSONが期待した構造であるか

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'title' => [
                    'タイトル は 255 文字以下のみ有効です',
                ],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);

        // 今回のアップロードではDBにレコードが保存されなかったか
        $this->assertEquals(0, $this->user->posts()->count());
        $this->assertEmpty(TagName::all());

        // 今回のアップロードではS3に本文が保存されなかったか
        $this->assertCount(0, Storage::cloud()->files('contents/'));
    }

    /**
     * @test
     */
    public function should_本文がない場合はアップロードできない(): void
    {
        $this->data['content'] = null;

        // アップロードを行う
        $response = $this->actingAs($this->user)->postJson(route('post.create'), $this->data);

        // レスポンスJSONが期待した構造であるか

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'content' => [
                    '本文 は必須です',
                ],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);

        // 今回のアップロードではDBにレコードが保存されなかったか
        $this->assertEquals(0, $this->user->posts()->count());
        $this->assertEmpty(TagName::all());

        // 今回のアップロードでS3に本文が保存されなかったか
        $this->assertCount(0, Storage::cloud()->files('contents/'));
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
            'filename' => $post->filename,
            'user_id' => $this->user->id,
        ]);

        // S3に本文がファイルとして保存されているか
        Storage::cloud()->assertExists('contents/' . $post->filename);
        $this->assertEquals(Storage::cloud()->get('contents/' . $post->filename), $this->data['content']);

        // 中間テーブルTagをpivotに含めたTagNameモデルへのリレーションを取得
        $tagNames = $post->tags;

        foreach ($tagNames->all() as $tagName) {
            // 記事に添付されたタグ名がTagテーブルに保存されたか
            $this->assertDatabaseHas($tagName->pivot->getTable(), [
                'post_id' => $tagName->pivot->post_id,
                'tag_name_id' => $tagName->pivot->tag_name_id,
            ]);
        }

        // TagNameが今回のアップロードで新規登録されていないか
        $this->assertEquals(3, TagName::all()->count());
    }

    /**
     * @test
     */
    public function should_DBエラーの場合はファイルを保存しない(): void
    {
        // 無理やりDBエラーを起こす
        Schema::drop('posts');

        // アップロードを行う
        $response = $this->actingAs($this->user)->postJson(route('post.create'), $this->data);

        $response->assertStatus(500);

        // 今回のアップロードではDBにレコードが保存されなかったか
        $this->assertEmpty(TagName::all());

        // 今回のアップロードではS3に本文が保存されなかったか
        $this->assertCount(0, Storage::cloud()->files('contents/'));
    }

    /**
     * @test
     */
    public function should_ファイル保存エラーの場合はDBにレコードを挿入しない(): void
    {
        // ストレージをモックして保存時にエラーを起こさせる
        Storage::shouldReceive('disk')
            ->once()
            ->andReturnNull();

        // アップロードを行う
        $response = $this->actingAs($this->user)->postJson(route('post.create'), $this->data);

        $response->assertStatus(500);

        // 今回のアップロードではDBにレコードが保存されなかったか
        $this->assertEquals(0, $this->user->posts()->count());
        $this->assertEmpty(TagName::all());
    }

    /**
     * @test
     */
    public function should_未ログイン状態で記事を投稿したら401エラーが返ってくる(): void
    {
        // アップロードを行う
        $response = $this->postJson(route('post.create'), $this->data);

        $response->assertStatus(401)->assertExactJson(['message' => 'Unauthenticated.']);

        // 今回のアップロードではDBにレコードが保存されなかったか
        $this->assertEquals(0, $this->user->posts()->count());
        $this->assertEmpty(TagName::all());

        // 今回のアップロードではS3に本文が保存されなかったか
        $this->assertCount(0, Storage::cloud()->files('contents/'));
    }
}
