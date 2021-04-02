<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PhotoSubmitApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    public function setUp(): void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();

        Storage::fake('s3');

        $this->data = [
            'jpg' => [
                'photo' => UploadedFile::fake()->image("{$this->faker->word}.jpg"),
            ],
            'jpeg' => [
                'photo' => UploadedFile::fake()->image("{$this->faker->word}.jpeg"),
            ],
            'png' => [
                'photo' => UploadedFile::fake()->image("{$this->faker->word}.png"),
            ],
            'gif' => [
                'photo' => UploadedFile::fake()->image("{$this->faker->word}.gif"),
            ],
        ];
    }

    /**
     * @test
     */
    public function should_jpg画像を正しく投稿できるか(): void
    {
        $this->imageUploadTest('jpg');
    }

    /**
     * @test
     */
    public function should_jpeg画像を正しく投稿できるか(): void
    {
        $this->imageUploadTest('jpeg');
    }

    /**
     * @test
     */
    public function should_png画像を正しく投稿できるか(): void
    {
        $this->imageUploadTest('png');
    }

    /**
     * @test
     */
    public function should_gif画像を正しく投稿できるか(): void
    {
        $this->imageUploadTest('gif');
    }

    /**
     * @test
     */
    public function should_画像が選択されていないときは422エラーを返す(): void
    {
        $this->data = ['photo' => null];
        $response = $this->actingAs($this->user)->postJson(route('photo.create'), $this->data);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'photo' => [
                    '画像 をアップロードしてください',
                ],
            ],
        ];

        $this->invalidResponesCheck($response, $expected);
    }

    /**
     * @test
     */
    public function should_容量オーバーの時は画像を投稿しない(): void
    {
        $this->data['jpg']['photo']->size(1024 * 3);
        $response = $this->actingAs($this->user)->postJson(route('photo.create'), $this->data['jpg']);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'photo' => [
                    '画像 は 2MB 以下のファイルのみ有効です',
                ],
            ],
        ];

        $this->invalidResponesCheck($response, $expected);
    }

    /**
     * @test
     */
    public function should_拡張子が不正な時は画像を投稿しない(): void
    {
        $this->data = ['photo' => UploadedFile::fake()->image("{$this->faker->word}.php")];

        $response = $this->actingAs($this->user)->postJson(route('photo.create'), $this->data);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'photo' => [
                    '画像 は jpg, jpeg, png, gif のみアップロードできます',
                ],
            ],
        ];

        $this->invalidResponesCheck($response, $expected);
    }

    private function imageUploadTest($extension): void
    {
        $response = $this->actingAs($this->user)->postJson(route('photo.create'), $this->data[$extension]);

        $response->assertStatus(201);

        $this->assertMatchesRegularExpression('/^[0-9a-zA-Z]{20}(.jpg|.jpeg|.png|.gif)$/', $response->json('filename'));

        $photo = $this->user->photos->first();

        $this->assertMatchesRegularExpression('/^[0-9a-zA-Z]{20}$/', $photo->id);
        $this->assertMatchesRegularExpression('/^[0-9a-zA-Z]{20}(.jpg|.jpeg|.png|.gif)$/', $photo->filename);
        $this->assertDatabaseHas($photo->getTable(), [
            'user_id' => $this->user->id,
            'filename' => $photo->filename,
        ]);

        // S3に画像が保存されているか
        Storage::cloud()->assertExists('photos/' . $photo->filename);
    }

    private function invalidResponesCheck($response, $expected): void
    {
        $response->assertStatus(422)->assertExactJson($expected);

        $this->assertEquals(0, $this->user->photos()->count());

        $this->assertCount(0, Storage::cloud()->files('photos/'));
    }
}
