<?php

namespace App\Http\Actions;

use App\Domain\ValueObject\PostContent;
use App\Domain\ValueObject\PostId;
use App\Domain\ValueObject\PostTags;
use App\Domain\ValueObject\PostTitle;
use App\Http\Controllers\Controller;
use App\Http\Requests\PostItemRequest;
use App\Http\Responders\EditArticleResponder;
use App\UseCase\EditArticleUseCase;
use Illuminate\Http\JsonResponse;

class EditArticleAction extends Controller
{
    private $useCase;

    private $responder;

    public function __construct(EditArticleUseCase $useCase, EditArticleResponder $responder)
    {
        $this->useCase = $useCase;
        $this->responder = $responder;
        $this->middleware('auth');
    }

    public function __invoke(PostItemRequest $request, string $id): JsonResponse
    {
        return $this->responder->response(
            $this->useCase->execute(
                PostId::create($id),
                PostTitle::create($request->title),
                PostContent::create($request->content),
                PostTags::create($request->tags)
            )
        );
    }
}
