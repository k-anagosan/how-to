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
    public function should_ユーザーネームからユーザーページに必要な情報を返す(): void
    {
        $response = $this->getJson(route('user.data', $this->user->name));

        $expected = [
            'id' => $this->user->id,
            'followed_by_me' => false,
        ];

        $response->assertStatus(200)->assertJson($expected);
    }

    /**
     * @test
     */
    public function should_未フォローユーザーのユーザーページ表示に必要な情報を返す(): void
    {
        $user = factory(User::class)->create();

        $response = $this->actingAs($user)->getJson(route('user.data', $this->user->name));

        $expected = [
            'id' => $this->user->id,
            'followed_by_me' => false,
        ];

        $response->assertStatus(200)->assertJson($expected);
    }

    /**
     * @test
     */
    public function should_フォロー済みユーザーのユーザーページ表示に必要な情報を返す(): void
    {
        $user = factory(User::class)->create();
        $user->follows()->attach($this->user->id);

        $response = $this->actingAs($user)->getJson(route('user.data', $this->user->name));

        $expected = [
            'id' => $this->user->id,
            'followed_by_me' => true,
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
