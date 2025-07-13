<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config\Status;
use App\Entity\Task;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;

class TaskController extends AbstractController
{
    #[Route('/task/delete', name: 'app_task_remove')]
    public function index(): Response
    {
        throw $this->createAccessDeniedException('You are not allowed to access this page');
    }

    #[Route('/task/update_status', name: 'app_task_status_update', methods: ['POST'])]
    public function updateStatus(EntityManagerInterface $entityManager): Response
    {
        $request = Request::createFromGlobals();
        $requestContent = json_decode($request->getContent());

        if (!$requestContent || !isset($requestContent->task_id) || !isset($requestContent->status)) {
            return new Response('Invalid request data', Response::HTTP_BAD_REQUEST);
        }

        $product = $entityManager->getRepository(Task::class)->find($requestContent->task_id);
        $status = Status::tryFrom($this->mapStatusToInt($requestContent->status));

        if (!$product) {
            throw $this->createNotFoundException('Task not found');
        }

        if ($status === Status::Done) {
            $product->setCompletedAt(new DateTimeImmutable());
        }

        $product->setStatus($status);
        $product->setUpdatedAt(new DateTime());

        $entityManager->flush();
        return new Response('Status updated successfully', Response::HTTP_OK);
    }

    private function mapStatusToInt(string $status): bool|int
    {
        foreach (Status::cases() as $case) {
            if ($case->name === $status) {
                return $case->value;
            }
        }
        return false;
    }
}
