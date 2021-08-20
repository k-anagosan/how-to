<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use Illuminate\Support\Str;

class UpdateUserDataApiTest extends TestCase
{
    use WithFaker,
        RefreshDatabase;

    public function setUp():void
    {
        parent::setUp();

        $this->user = factory(User::class)->create();

        $this->assertCount(1, User::all());
        $this->assertDatabaseHas($this->user->getTable(), [
            "name" => $this->user->name,
            "email" => $this->user->email,
            "password" => $this->user->password
        ]);

        $this->data = $this->createData();
    }
    
    /**
     * @test
     */
    public function should_ユーザー情報の更新が行える()
    {
        $response = $this->actingAs($this->user)->patchJson(route('user.update', $this->user->name), $this->data);

        $expected = [
            "name" => $this->data["name"],
            "email" => $this->data["email"],
        ];

        $this->assertCount(1, User::all());

        $this->assertDatabaseMissing($this->user->getTable(), [
            "name" => $this->user->name,
            "email" => $this->user->email,
        ]);

        $this->assertDatabaseHas($this->user->getTable(), $expected);

        $this->checkPassword($this->data["password"]);
        
        $response->assertStatus(200);    
    }
    
    /**
     * @test
     */
    public function should_名前だけ更新が行える()
    {

        $this->data["email"] = $this->user->email;
        
        $response = $this->actingAs($this->user)->patchJson(route('user.update', $this->user->name), $this->data);

        $expected = [
            "name" => $this->data["name"],
            "email" => $this->data["email"],
        ];

        $this->assertCount(1, User::all());

        $this->assertDatabaseMissing($this->user->getTable(), [
            "name" => $this->user->name,
            "email" => $this->user->email,
        ]);

        $this->assertDatabaseHas($this->user->getTable(), $expected);

        $this->checkPassword($this->data["password"]);
        
        $response->assertStatus(200);    
    }

    /**
     * @test
     */
    public function should_Emailだけ更新が行える()
    {

        $this->data["name"] = $this->user->name;
        
        $response = $this->actingAs($this->user)->patchJson(route('user.update', $this->user->name), $this->data);

        $expected = [
            "name" => $this->data["name"],
            "email" => $this->data["email"],
        ];

        $this->assertCount(1, User::all());

        $this->assertDatabaseMissing($this->user->getTable(), [
            "name" => $this->user->name,
            "email" => $this->user->email,
        ]);

        $this->assertDatabaseHas($this->user->getTable(), $expected);

        $this->checkPassword($this->data["password"]);
        
        $response->assertStatus(200);    
    }

    /**
     * @test
     */
    public function should_名前が空の場合はユーザーの更新をしない(): void
    {
        $message = [
            "name" => ["ユーザー名 は必須です"]
        ];

        $this->data["name"] = "";
        $this->check($this->data, $this->user->name, $message);
    }

    /**
     * @test
     */
    public function should_名前に空白が使われていたらユーザーの更新をしない(): void
    {
        $message = [
            "name" => ["ユーザー名 は英数字と_（アンダーバー）のみが使えます"]
        ];

        $this->data["name"] = Str::random() . " " . Str::random();

        $this->check($this->data, $this->user->name, $message);
    }

    /**
     * @test
     */
    public function should_名前に英数字と_以外が使われていたらユーザーを作成しない(): void
    {
        $message = [
            "name" => ["ユーザー名 は英数字と_（アンダーバー）のみが使えます"]
        ];

        $this->data["name"] = preg_replace("/( |　)/", "", $this->faker->name);
        
        $this->check($this->data, $this->user->name, $message);

    }

    /**
     * @test
     */
    public function should_Emailが空の場合はユーザー情報を更新しない(): void
    {
        $message = [
            'email' => ['メールアドレス は必須です'],
        ];

        $this->data["email"] = "";
        
        $this->check($this->data, $this->user->name, $message);
    }
    
    /**
     * @test
     */
    public function should_passwordとpassword_confirmationが異なる場合はユーザー情報を更新しない()
    {
        $message = [
            'password' => [
                'パスワード を確認用と一致させてください'
            ],
        ];

        $this->data["password_confirmation"] = Str::random();

        $this->check($this->data, $this->user->name, $message);
    }
    
    /**
     * @test
     */
    public function should_passwordが指定の文字数に満たない場合はユーザー情報を更新しない()
    {
        $message = [
            'password' => [
                'パスワード は 8 文字以上のみ有効です',
            ],
        ];

        $tooShortPassword = $this->faker->password(1, 7);

        $this->data["password"] = $tooShortPassword;
        $this->data["password_confirmation"] = $tooShortPassword;

        $this->check($this->data, $this->user->name, $message);
    }
    
    /**
     * @test
     */
    public function should_既に登録済みのユーザー名を使おうとした場合はユーザー情報更新に失敗する(): void
    {
        $user = factory(User::class)->create();

        $this->data["name"] = $user->name;
        
        $message = [
            'name' => ['そのユーザー名は既に使われています'],
        ];

        $this->check($this->data, $user->name, $message);
    }
    
    /**
     * @test
     */
    public function should_既に登録済みのメールアドレスを使おうとした場合はユーザー情報更新に失敗する(): void
    {
        $user = factory(User::class)->create();

        $this->data["email"] = $user->email;
        
        $message = [
            'email' => ['そのメールアドレスは既に使われています'],
        ];

        $this->check($this->data, $user->name, $message);
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

    private function checkPassword($plain)
    {
        $password = User::find($this->user->id)->password;
        $this->assertTrue(Hash::check($plain, $password));
    }

    private function check($data, $username, $message): void
    {
        $this->data = $data;

        $response = $this->actingAs($this->user)->patchJson(route('user.update', $username), $this->data);

        // DBが以前の情報のままか
        $this->assertDatabaseMissing((new User())->getTable(), [
            'name' => $this->data["name"],
            'email' => $this->data['email'],
        ]);

        $this->assertDatabaseHas((new User())->getTable(), [
            'name' => $this->user->name,
            'email' => $this->user->email,
        ]);

        $expected = [
            'message' => 'The given data was invalid.',
            'errors' => $message,
        ];

        // バリデーションエラーを示すステータスコードと正しいバリデーションメッセージが返ってくるか
        $response->assertStatus(422)->assertExactJson($expected);
    }
}
