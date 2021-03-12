<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class GetUserApiTest extends TestCase
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
    public function should_ユーザーがログイン中であればユーザーデータを返す(): void
    {
        $response = $this->actingAs($this->user)->getJson(route('user'));

        $response->assertStatus(200)->assertJson(['name' => $this->user['name']]);
    }

    /**
     * @test
     */
    public function should_ユーザーが未ログインであれば何も返さない(): void
    {
        $response = $this->getJson(route('user'));

        $response->assertStatus(200);
        $this->assertEquals($response->content(), '');
    }
}
