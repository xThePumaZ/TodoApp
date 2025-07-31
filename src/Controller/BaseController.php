<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class BaseController extends AbstractController
{
    public static function createResponse(string $message, int $statusCode = Response::HTTP_OK, array|string $data = []
    ): Response {
        return new JsonResponse([
            'message' => $message,
            'data' => $data,
        ], $statusCode);
    }
}
