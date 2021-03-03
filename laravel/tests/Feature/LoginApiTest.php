<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class LoginApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    public function setUp(): void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();
        $this->data = ['email' => $this->user->email, 'password' => 'password'];
    }

    /**
     * @test
     */
    public function should_ログインコントローラーへのルーティングが正しく行われているがログインには失敗する(): void
    {
        $response = $this->postJson(route('login'));

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'email' => [
                    'email は必須です',
                ],
                'password' => [
                    'password は必須です',
                ],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);
    }

    /**
     * @test
     */
    public function should_正しいログイン情報であればログインに成功する(): void
    {
        $response = $this->postJson(route('login'), $this->data);

        $expected = [
            'name' => $this->user->name,
            'email' => $this->user->email,
        ];

        $response->assertStatus(200)->assertJson($expected);
    }

    /**
     * @test
     */
    public function should_emailが間違っていればログインに失敗する(): void
    {
        $this->data['email'] = $this->faker->unique()->safeEmail;

        $response = $this->postJson(route('login'), $this->data);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'email' => ['認証に失敗しました'],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);
    }

    /**
     * @test
     */
    public function should_passwordが間違っていればログインに失敗する(): void
    {
        $this->data['password'] = $this->faker->password(8);

        $response = $this->postJson(route('login'), $this->data);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'email' => ['認証に失敗しました'],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);
    }
}
