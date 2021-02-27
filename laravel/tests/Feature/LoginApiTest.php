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
    }

    /**
     * @test
     */
    public function should_ログインコントローラーへのルーティングが正しく行われる(): void
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
}
