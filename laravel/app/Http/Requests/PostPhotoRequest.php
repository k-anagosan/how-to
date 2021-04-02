<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PostPhotoRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        return [
            'photo' => ['required', 'max:2048', 'mimes:jpg,jpeg,png,gif'],
        ];
    }

    public function messages()
    {
        return [
            'required' => ':attribute をアップロードしてください',
            'max' => ':attribute は 2MB 以下のファイルのみ有効です',
            'mimes' => ':attribute は :values のみアップロードできます',
        ];
    }

    public function attributes()
    {
        return [
            'photo' => '画像',
        ];
    }
}
