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
            'photo' => UploadedFile::fake()->image("{$this->faker->word}.jpg"),
        ];
    }

    /**
     * @test
     */
    public function should_画像を正しく投稿できるか(): void
    {
        $response = $this->actingAs($this->user)->postJson(route('photo.create'), $this->data);

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
}
