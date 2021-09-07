<?php

namespace App\Http\Requests;

use App\Domain\User\Repository\UserRepositoryInterface as UserRepository;
use App\Domain\ValueObject\Username;
use App\Rules\AlphaUnderscore;
use Illuminate\Validation\Rule;

class UserDataRequest extends BaseRequest
{

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $userRepository = resolve(UserRepository::class);

        $id = $userRepository->getLoginUserId()->toInt();
        
        return [
            'name' => ['required', 'string', 'max:255', new AlphaUnderscore, Rule::unique('users', 'name')->ignore($id)],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users','email')->ignore($id)],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ];
    }
}
