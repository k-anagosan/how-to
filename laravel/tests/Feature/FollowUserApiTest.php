<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class FollowUserApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    private const USER_NUMBER = 100;

    public function setUp(): void
    {
        parent::setUp();

        factory(User::class, self::USER_NUMBER)->create();

        $this->user = User::first();
        $this->followId = User::find(random_int(1, self::USER_NUMBER))->id;
    }

    /**
     * @test
     */
    public function should_指定のユーザーをフォローできる(): void
    {
        $response = $this->actingAs($this->user)->putJson(route('user.follow', $this->followId));

        $response->assertStatus(200)
            ->assertExactJson(['user_id' => $this->followId]);

        $this->assertDatabaseHas('follows', [
            'user_id' => $this->user->id,
            'follow_id' => $this->followId,
        ]);

        $this->assertEquals(1, $this->user->follows()->count());
    }

    /**
     * @test
     */
    public function should_未ログインユーザーがフォローを行ったら401エラーを返す(): void
    {
        $response = $this->putJson(route('user.follow', $this->followId));

        $response->assertStatus(401)->assertExactJson(['message' => 'Unauthenticated.']);

        $this->assertEquals(0, $this->user->follows()->count());
    }

    /**
     * @test
     */
    public function should_複数回ユーザーをフォローしてもDBに1つしかレコードが挿入されない(): void
    {
        $this->actingAs($this->user)->putJson(route('user.follow', $this->followId));
        $this->actingAs($this->user)->putJson(route('user.follow', $this->followId));
        $this->actingAs($this->user)->putJson(route('user.follow', $this->followId));

        $this->assertEquals(1, $this->user->follows()->count());
    }

    /**
     * @test
     */
    public function should_指定のユーザーが存在しなかったら404エラーを返す(): void
    {
        $response = $this->actingAs($this->user)->putJson(route('user.follow', self::USER_NUMBER + 1));

        $response->assertStatus(404);
    }
}
