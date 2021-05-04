<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\Username;
use App\Http\Controllers\Controller;
use App\Http\Responders\GetLikedArticleListResponder;
use App\UseCase\GetLikedArticleListUseCase;
use Illuminate\Http\JsonResponse;

class GetLikedArticleListAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(GetLikedArticleListUseCase $useCase, GetLikedArticleListResponder $responder)
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
