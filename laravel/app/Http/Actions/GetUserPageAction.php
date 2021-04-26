<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\Username;
use App\Http\Controllers\Controller;
use App\Http\Responders\GetUserPageResponder;
use App\UseCase\GetUserPageUseCase;
use Illuminate\Http\JsonResponse;

class GetUserPageAction extends Controller
{
    public function __construct(GetUserPageUseCase $useCase, GetUserPageResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
    }

    public function __invoke(string $name): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute(
                Username::create($name)
            )
        );
    }
}
