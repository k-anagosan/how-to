<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\Username;
use App\Http\Controllers\Controller;
use App\Http\Responders\GetFollowerListResponder;
use App\UseCase\GetFollowerListUseCase;
use Illuminate\Http\JsonResponse;

class GetFollowerListAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(GetFollowerListUseCase $useCase, GetFollowerListResponder $responder)
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
