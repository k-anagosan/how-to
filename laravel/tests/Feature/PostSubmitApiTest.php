<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
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
            'photos' => [
                UploadedFile::fake()->image("{$this->faker->word}.jpg"),
                UploadedFile::fake()->image("{$this->faker->word}.jpg"),
                UploadedFile::fake()->image("{$this->faker->word}.jpg"),
            ],
        ];
    }

    /**
     * @test
     */
    public function should_タイトルと文章だけの記事をアップロードできる(): void
    {
        $this->data['photos'] = null;
        $this->data['tags'] = null;

        // アップロードを行う
        $response = $this->actingAs($this->user)->postJson(route('post.create'), $this->data);

        $response->assertStatus(201);

        // レスポンスJSONが期待した構造であるか
        $this->assertMatchesRegularExpression('/^[0-9a-zA-Z]{20}$/', $response->json('post_id'));

        // アップロードによりPostsテーブルにレコードが保存されたか
        $post = Post::first();
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
}