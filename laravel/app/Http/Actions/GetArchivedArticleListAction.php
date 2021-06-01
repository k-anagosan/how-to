<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\Username;
use App\Http\Controllers\Controller;
use App\Http\Responders\GetArchivedArticleListResponder;
use App\UseCase\GetArchivedArticleListUseCase;
use Illuminate\Http\JsonResponse;

class GetArchivedArticleListAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(GetArchivedArticleListUseCase $useCase, GetArchivedArticleListResponder $responder)
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
