<?php

namespace App\Trait;

use App\Config\StatusMessages;
use App\Controller\BaseController;
use App\Entity\Task;
use Symfony\Component\HttpFoundation\Response;

trait TaskAuthorizationTrait
{
    protected function checkTaskOwnership(Task $task): null|Response
    {
        if ($task->getUserId()->getId() !== $this->getUser()->getId()) {
            return BaseController::createResponse(StatusMessages::Forbidden, Response::HTTP_FORBIDDEN);
        }
        return null;
    }
}
