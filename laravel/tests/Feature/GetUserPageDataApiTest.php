<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GetUserPageDataApiTest extends TestCase
{
    use RefreshDatabase;

    public function setUp(): void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();
    }

    /**
     * @test
     */
    public function should_ユーザーネームからユーザーIDを返す(): void
    {
        $response = $this->getJson(route('user.data', $this->user->name));

        $expected = [
            'id' => $this->user['id'],
            'followed_by_me' => false,
        ];

        $response->assertStatus(200)->assertJson($expected);
    }

    /**
     * @test
     */
    public function should_ユーザーネームがなければ404エラーを返す(): void
    {
        $response = $this->getJson(route('user.data', Str::random()));

        $response->assertStatus(404);
    }
}
