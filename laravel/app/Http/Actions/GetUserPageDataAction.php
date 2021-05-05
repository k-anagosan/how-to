<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\Username;
use App\Http\Controllers\Controller;
use App\Http\Responders\GetUserPageDataResponder;
use App\UseCase\GetUserPageDataUseCase;
use Illuminate\Http\JsonResponse;

class GetUserPageDataAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(GetUserPageDataUseCase $useCase, GetUserPageDataResponder $responder)
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
