<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class GetUserIdApiTest extends TestCase
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
        $response = $this->getJson(route('user.id', $this->user->name));

        $expected = [
            'user_id' => $this->user['id'],
        ];

        $response->assertStatus(200)->assertJson($expected);
    }

    /**
     * @test
     */
    public function should_ユーザーネームがなければ404エラーを返す(): void
    {
        $response = $this->getJson(route('user.id', Str::random()));

        $response->assertStatus(404);
    }
}
