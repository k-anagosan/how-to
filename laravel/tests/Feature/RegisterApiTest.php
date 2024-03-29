<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Str;
use Tests\TestCase;

class RegisterApiTest extends TestCase
{
    use RefreshDatabase,
        WithFaker;

    private $data;

    public function setUp(): void
    {
        parent::setUp();

        // テストごとにダミーデータを作成
        $this->data = $this->createData();
    }

    /**
     * @test
     */
    public function should_新規ユーザーを作成する(): void
    {
        $response = $this->postJson(route('register'), $this->data);

        $expected = [
            'name' => $this->data['name'],
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
        $this->nameCheck('', 'ユーザー名 は必須です');
    }

    /**
     * @test
     */
    public function should_名前に空白が使われていたらユーザーを作成しない(): void
    {
        $name = Str::random() . ' ' . Str::random();
        $this->nameCheck($name, 'ユーザー名 は英数字と_（アンダーバー）のみが使えます');
    }

    /**
     * @test
     */
    public function should_名前に英数字と_以外が使われていたらユーザーを作成しない(): void
    {
        $name = preg_replace('/( |　)/', '', $this->faker->name);
        $this->nameCheck($name, 'ユーザー名 は英数字と_（アンダーバー）のみが使えます');
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
                    'メールアドレス は必須です',
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
                    'パスワード を確認用と一致させてください',
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
                    'パスワード は 8 文字以上のみ有効です',
                ],
            ],
        ];

        // バリデーションエラーを示すステータスコードと正しいバリデーションメッセージが返ってくるか
        $response->assertStatus(422)->assertExactJson($expected);
    }

    /**
     * @test
     */
    public function should_既に登録済みのユーザー名を使おうとした場合は登録に失敗する(): void
    {
        $user = $this->createRegisteredUser();

        $this->data['email'] = $user->email;

        $response = $this->postJson(route('register'), $this->data);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'email' => ['そのメールアドレスは既に使われています'],
            ],
        ];

        $response->assertStatus(422)->assertExactJson($expected);
    }

    /**
     * @test
     */
    public function should_登録が完了したユーザーが再度登録を行おうとするとuserエンドポイントへリダイレクトされる(): void
    {
        $user = $this->createRegisteredUser();
        $response = $this->actingAs($user)->postJson(route('register'), $this->data);

        $response->assertStatus(302)->assertRedirect(route('user'));
    }

    /**
     * 登録用データを作成.
     * @param void
     * @return array
     */
    private function createData()
    {
        $password = $this->faker->password(8);
        return [
            'name' => Str::random(10),
            'email' => $this->faker->unique()->email(),
            'password' => $password,
            'password_confirmation' => $password,
        ];
    }

    /**
     * 登録済みユーザー情報を作成.
     * @param void
     * @return mixed
     */
    private function createRegisteredUser()
    {
        return factory(User::class)->create();
    }

    private function nameCheck($name, $message): void
    {
        $this->data['name'] = $name;

        $response = $this->postJson(route('register'), $this->data);

        // DBに保存されていないか
        $this->assertDatabaseMissing((new User())->getTable(), [
            'name' => '',
            'email' => $this->data['email'],
        ]);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => [
                'name' => [$message],
            ],
        ];

        // バリデーションエラーを示すステータスコードと正しいバリデーションメッセージが返ってくるか
        $response->assertStatus(422)->assertExactJson($expected);
    }
}
