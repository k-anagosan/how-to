<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\PostId;
use App\Http\Controllers\Controller;
use App\Http\Responders\GetArticleResponder;
use App\UseCase\GetArticleUseCase;

class GetArticleAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(GetArticleUseCase $useCase, GetArticleResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
    }

    public function __invoke(string $id)
    {
        return $this->responder->response(
            $this->useCase->execute(
                PostId::create($id)
            )
        );
    }
}
