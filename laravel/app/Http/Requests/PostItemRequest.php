<?php

namespace App\Http\Requests;

class PostItemRequest extends BaseRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
        ];
    }

    public function attributes()
    {
        return [
            'title' => 'タイトル',
            'content' => '本文',
        ];
    }
}
