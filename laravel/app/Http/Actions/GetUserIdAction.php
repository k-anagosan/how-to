<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\Username;
use App\Http\Controllers\Controller;
use App\Http\Responders\GetUserIdResponder;
use App\UseCase\GetUserIdUseCase;
use Illuminate\Http\JsonResponse;

class GetUserIdAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(GetUserIdUseCase $useCase, GetUserIdResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
    }

    public function __invoke(string $username): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute(
                Username::create($username)
            )
        );
    }
}
