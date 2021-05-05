<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\Username;
use App\Http\Controllers\Controller;
use App\Http\Responders\GetUserArticleListResponder;
use App\UseCase\GetUserArticleListUseCase;
use Illuminate\Http\JsonResponse;

class GetUserArticleListAction extends Controller
{
    public function __construct(GetUserArticleListUseCase $useCase, GetUserArticleListResponder $responder)
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
