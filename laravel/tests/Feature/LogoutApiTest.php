<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class LogoutApiTest extends TestCase
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
    public function should_ログインしているユーザーがログアウトできる(): void
    {
        $response = $this->actingAs($this->user)->postJson(route('logout'));

        $response->assertStatus(200)->assertExactJson([]);
        $this->assertGuest();
    }
}
