<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Tag;
use App\Models\TagName;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class GetArticleDetailApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    public function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');
    }

    /**
     * @test
     */
    public function should_タグがある場合の正しい構造のJSONが返される(): void
    {
        factory(Post::class)->create()->each(function (Post $post): void {
            factory(TagName::class, 3)->create()->each(function (TagName $tagName) use ($post): void {
                factory(Tag::class)->create(['post_id' => $post->id, 'tag_name_id' => $tagName->id]);
            });
        });

        $post = Post::with(['author', 'tags'])->first();

        $file = UploadedFile::fake()->createWithContent($post->filename, $this->faker->text(2000));
        Storage::cloud()->putFileAs('contents', $file, $post->filename, 'public');

        // 前準備としてS3に$fileが保存されたか
        Storage::cloud()->assertExists('contents/' . $post->filename);

        $response = $this->getJson(route('post.show', ['id' => $post->id]));

        $response->assertStatus(200)
            ->assertExactJson([
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'tags' => $post->tags->map(function ($tag) {
                    return $tag->tagName;
                })->toArray(),
                'author' => [
                    'name' => $post->author->name,
                ],
            ]);

        $this->assertEquals(Storage::cloud()->get('contents/' . $post->filename), $post->content);
    }

    /**
     * @test
     */
    public function should_タグがない場合の正しい構造のJSONが返される(): void
    {
        factory(Post::class)->create();

        $post = Post::with(['author', 'tags'])->first();

        $file = UploadedFile::fake()->createWithContent($post->filename, $this->faker->text(2000));
        Storage::cloud()->putFileAs('contents', $file, $post->filename, 'public');

        // 前準備としてS3に$fileが保存されたか
        Storage::cloud()->assertExists('contents/' . $post->filename);

        $response = $this->getJson(route('post.show', ['id' => $post->id]));

        $response->assertStatus(200)
            ->assertExactJson([
                'id' => $post->id,
                'title' => $post->title,
                'content' => $post->content,
                'tags' => [],
                'author' => [
                    'name' => $post->author->name,
                ],
            ]);

        $this->assertEquals(Storage::cloud()->get('contents/' . $post->filename), $post->content);
    }

    /**
     * @test
     */
    public function should_存在しないIDが渡された場合、404エラーが返される(): void
    {
        $response = $this->getJson(route('post.show', ['id' => Str::random(20)]));

        $response->assertStatus(404);
    }

    /**
     * @test
     */
    public function should_IDはあるがファイルが無い場合、500エラーが返される(): void
    {
        $post = factory(Post::class)->create();
        $response = $this->getJson(route('post.show', ['id' => $post->id]));

        $response->assertStatus(500);
    }
}
