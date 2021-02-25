<?php

namespace Tests\Feature;

use App\Models\User;
use Faker\Factory as Faker;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterApiTest extends TestCase
{
    use RefreshDatabase;

    private $faker;

    private $data;

    public function setUp(): void
    {
        parent::setUp();

        // テストごとにダミーデータを作成
        $this->faker = Faker::create('ja_JP');

        $password = $this->faker->password(8);
        $this->data = [
            'name' => $this->faker->userName(),
            'email' => $this->faker->unique()->email(),
            'password' => $password,
            'password_confirmation' => $password,
        ];
    }

    /**
     * @test
     */
    public function should_新規ユーザーを作成する(): void
    {
        $response = $this->postJson(route('register'), $this->data);

        $expected = [
            'name' => $this->data['name'],
            'email' => $this->data['email'],
        ];

        // DBに保存できたか
        $this->assertDatabaseHas((new User())->getTable(), $expected);

        // 正しいステータスコードと登録情報をもったレスポンスが返ってくるか
        $response->assertStatus(201)->assertJson($expected);
    }

    /**
     * @test
     */
    public function should_名前が空の場合はユーザーを作成しない(): void
    {
        // 名前がないので登録できない
        $this->data['name'] = '';

        $response = $this->postJson(route('register'), $this->data);

        // DBに保存されていないか
        $this->assertDatabaseMissing((new User())->getTable(), [
            'name' => '',
            'email' => $this->data['email'],
        ]);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'name' => [
                    'name は必須です',
                ],
            ],
        ];

        // バリデーションエラーを示すステータスコードと正しいバリデーションメッセージが返ってくるか
        $response->assertStatus(422)->assertExactJson($expected);
    }

    /**
     * @test
     */
    public function should_emailが空の場合はユーザーを作成しない(): void
    {
        // emailがないので登録できない
        $this->data['email'] = '';

        $response = $this->postJson(route('register'), $this->data);

        // DBに保存されていないか
        $this->assertDatabaseMissing((new User())->getTable(), [
            'name' => $this->data['name'],
            'email' => '',
        ]);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'email' => [
                    'email は必須です',
                ],
            ],
        ];

        // バリデーションエラーを示すステータスコードと正しいバリデーションメッセージが返ってくるか
        $response->assertStatus(422)->assertExactJson($expected);
    }

    /**
     * @test
     */
    public function should_passwordとpassword_confirmationが異なる場合はユーザーを作成しない(): void
    {
        // passwordが異なるので登録できない
        $this->data['password'] = $this->faker->unique()->password(8);
        $this->data['password_confirmation'] = $this->faker->unique()->password(8);

        $response = $this->postJson(route('register'), $this->data);

        // DBに保存されていないか
        $this->assertDatabaseMissing((new User())->gettable(), [
            'name' => $this->data['name'],
            'email' => $this->data['email'],
        ]);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'password' => [
                    'password を確認用と一致させてください',
                ],
            ],
        ];

        // バリデーションエラーを示すステータスコードと正しいバリデーションメッセージが返ってくるか
        $response->assertStatus(422)->assertExactJson($expected);
    }

    /**
     * @test
     */
    public function should_passwordが指定の文字数に満たない場合はユーザーを作成しない(): void
    {
        // パスワードが短すぎるので登録できない
        $tooShortPassword = $this->faker->password(1, 7);

        $this->data['password'] = $tooShortPassword;
        $this->data['password_confirmation'] = $tooShortPassword;

        $response = $this->postJson(route('register'), $this->data);

        // DBに保存されていないか
        $this->assertDatabaseMissing((new User())->getTable(), [
            'name' => 'test user',
            'email' => 'dummy@example.com',
        ]);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'password' => [
                    'password は 8 文字以上のみ有効です',
                ],
            ],
        ];

        // バリデーションエラーを示すステータスコードと正しいバリデーションメッセージが返ってくるか
        $response->assertStatus(422)->assertExactJson($expected);
    }
}
