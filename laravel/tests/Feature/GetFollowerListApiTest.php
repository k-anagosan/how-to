<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Str;
use Tests\TestCase;

class GetFollowerListApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    private const FOLLOWER_NUMBER = 100;

    public function setUp(): void
    {
        parent::setUp();

        $this->perPage = 20;

        $this->followedUser = factory(User::class)->create();
        $this->followUsers($this->followedUser);

        $this->followerList = User::with(['followers'])
            ->find($this->followedUser->id)
            ->followers()
            ->limit($this->perPage)
            ->get()
            ->toArray();
    }

    /**
     * @test
     */
    public function should_フォロワー一覧表示時必要なデータを取得する(): void
    {
        $response = $this->getJson(route('user.followers', $this->followedUser->name));

        $response->assertStatus(200)
            ->assertJsonCount($this->perPage, 'data')
            ->assertJsonFragment(['data' => $this->followerList]);
    }

    /**
     * @test
     */
    public function should_フォロしたことないユーザーであっても正しいレスポンスが返される(): void
    {
        $user = factory(User::class)->create();
        $response = $this->getJson(route('user.followers', $user->name));

        $response->assertStatus(200)
            ->assertJsonCount(0, 'data')
            ->assertJsonFragment(['data' => []]);
    }

    /**
     * @test
     */
    public function should_存在しないユーザーのページをアクセスすると404エラーが返される(): void
    {
        $response = $this->getJson(route('user.followers', Str::random()));

        $response->assertStatus(404);
    }

    private function followUsers($followedUser): void
    {
        $followers = factory(User::class, self::FOLLOWER_NUMBER)->create();

        $followers->map(function ($follower) use ($followedUser): void {
            if ($follower->id === $followedUser->id) {
                return;
            }
            $follower->follows()->attach($followedUser->id);
        });

        $dummyUser = factory(User::class)->create();

        $followers->map(function ($follower) use ($dummyUser): void {
            if ($follower->id === $dummyUser->id) {
                return;
            }
            $follower->follows()->attach($dummyUser->id);
        });
    }
}
