<?php

namespace App\Rules;

use Illuminate\Contracts\Validation\Rule;

class AlphaUnderscore implements Rule
{
    /**
     * Determine if the validation rule passes.
     *
     * @param string $attribute
     * @param mixed  $value
     * @return bool
     */
    public function passes($attribute, $value)
    {
        return preg_match('/\\W/', $value) === 0;
    }

    /**
     * Get the validation error message.
     *
     * @return string
     */
    public function message()
    {
        return ':attribute は英数字と_（アンダーバー）のみが使えます';
    }
}
