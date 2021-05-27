<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class DeleteFollowUserApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    private const USER_NUMBER = 100;

    public function setUp(): void
    {
        parent::setUp();

        factory(User::class, self::USER_NUMBER)->create();

        $this->user = User::first();

        for ($i = 2; $i <= 100; $i++) {
            $this->user->follows()->attach($i);
        }

        $this->followId = random_int(2, self::USER_NUMBER);

        $this->assertDatabaseHas('follows', [
            'user_id' => $this->user->id,
            'follow_id' => $this->followId,
        ]);
        $this->assertEquals(self::USER_NUMBER - 1, $this->user->follows()->count());
    }

    /**
     * @test
     */
    public function should_指定のユーザーをフォロー解除できる(): void
    {
        $response = $this->actingAs($this->user)->deleteJson(route('user.delete.follow', $this->followId));

        $response->assertStatus(200)
            ->assertExactJson(['user_id' => $this->followId]);

        $this->assertDatabaseMissing('follows', [
            'user_id' => $this->user->id,
            'follow_id' => $this->followId,
        ]);

        $this->assertEquals(self::USER_NUMBER - 2, $this->user->follows()->count());
    }

    /**
     * @test
     */
    public function should_未ログインユーザーがフォロー解除を行ったら401エラーを返す(): void
    {
        $response = $this->deleteJson(route('user.delete.follow', $this->followId));

        $response->assertStatus(401)->assertExactJson(['message' => 'Unauthenticated.']);

        $this->assertEquals(self::USER_NUMBER - 1, $this->user->follows()->count());
    }

    /**
     * @test
     */
    public function should_複数回ユーザーのフォロー解除をしてもDBに1つしかレコードが挿入されない(): void
    {
        $this->actingAs($this->user)->deleteJson(route('user.delete.follow', $this->followId));
        $this->actingAs($this->user)->deleteJson(route('user.delete.follow', $this->followId));
        $this->actingAs($this->user)->deleteJson(route('user.delete.follow', $this->followId));

        $this->assertEquals(self::USER_NUMBER - 2, $this->user->follows()->count());
    }

    /**
     * @test
     */
    public function should_自身を指定してフォロー解除はできない(): void
    {
        $response = $this->actingAs($this->user)->deleteJson(route('user.delete.follow', $this->user->id));

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'follow_id' => [
                    '自身は指定できません',
                ],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);
        $this->assertEquals(self::USER_NUMBER - 1, $this->user->follows()->count());
    }

    /**
     * @test
     */
    public function should_指定のユーザーが存在しなかったら404エラーを返す(): void
    {
        $response = $this->actingAs($this->user)->deleteJson(route('user.delete.follow', self::USER_NUMBER + 1));

        $response->assertStatus(404);
    }
}
