<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\Email;
use App\Domain\ValueObject\Password;
use App\Domain\ValueObject\Username;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserDataRequest;
use App\Http\Responders\UpdateUserDataResponder;
use App\UseCase\UpdateUserDataUseCase;
use Illuminate\Http\JsonResponse;

class UpdateUserDataAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(UpdateUserDataUseCase $useCase, UpdateUserDataResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
        $this->middleware('auth');
    }

    public function __invoke(UserDataRequest $request, string $name): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute(
                Username::create($name),
                Username::create($request->name),
                Email::create($request->email),
                Password::create($request->password)
            )
        );
    }
}