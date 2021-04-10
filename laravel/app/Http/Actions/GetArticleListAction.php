<?php

namespace App\Http\Actions;

use App\Http\Controllers\Controller;
use App\Http\Responders\GetArticleListResponder as Responder;
use App\UseCase\GetArticleListUseCase as UseCase;
use Illuminate\Http\JsonResponse;

class GetArticleListAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(UseCase $useCase, Responder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
    }

    public function __invoke(): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute()
        );
    }
}
