<?php

namespace Tests\Feature;

use Tests\TestCase;

class RoutingTest extends TestCase
{
    /**
     * @test
     */
    // phpcs:ignore
    public function should_ホーム画面にアクセスできる(): void
    {
        $response = $this->get('/');
        $response->assertStatus(200);
    }

    /**
     * @test
     */
    // phpcs:ignore
    public function should_想定したURI以外にアクセスしてもホーム画面にアクセスする(): void
    {
        $response = $this->get('/' . $this->ramdomUri());
        $response->assertStatus(200);
    }

    /**
     * @test
     */
    // phpcs:ignore
    public function should_想定したURIでアクセスすると、indexビューが返ってくる(): void
    {
        $response = $this->get('/');
        $response->assertViewIs('index');
    }

    /**
     * @test
     */
    // phpcs:ignore
    public function should_想定したURI以外にアクセスしても、indexビューが返ってくる(): void
    {
        $response = $this->get('/' . $this->ramdomUri());
        $response->assertViewIs('index');
    }

    // ランダムな文字列をuriとして作成
    private function ramdomUri(): string
    {
        $uri = '';

        for ($i = 0; $i < 12; $i++) {
            $uri .= str_shuffle('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWSYZ-_')[0];
        }
        return $uri;
    }
}
