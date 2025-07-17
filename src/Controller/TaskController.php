<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config\Priority;
use App\Config\Status;
use App\Entity\Task;
use App\Form\AddTaskFormType;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\Request;

class TaskController extends AbstractController
{
    #[Route('/task/delete', name: 'app_task_remove', methods: ['POST'])]
    public function deleteTask(EntityManagerInterface $entityManager): Response
    {
        $request = Request::createFromGlobals();

        $task = $entityManager->getRepository(Task::class)->find($request->query->get('id'));
        if ($task) {
            $entityManager->remove($task);
            $entityManager->flush();
        }
        // Redirect to the dashboard after deletion
        return $this->redirectToRoute('app_dashboard');
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

        if ($product->getStatus() !== $status) {
            if ($status === Status::Done) {
                $product->setCompletedAt(new DateTimeImmutable());
            }

            $product->setStatus($status);
            $product->setUpdatedAt(new DateTime());

            $entityManager->flush();
            return new Response(null, Response::HTTP_OK);
        }
        return new Response(null, Response::HTTP_NOT_MODIFIED);
    }

    #[Route('/task/addTask', name: 'app_task_addtask')]
    public function addTask(EntityManagerInterface $entityManager): Response
    {
        $task = new Task();
        $form = $this->createForm(AddTaskFormType::class, $task);
        $form->handleRequest(Request::createFromGlobals());

        if ($form->isSubmitted() && $form->isValid()) {
            $task = $form->getData();
            $task->setCreatedAt(new DateTimeImmutable());

            $priority =  Priority::tryFrom($form->get('priority')->getData());
            if ($priority) {
                $task->setPriority($priority);
            } else {
                return new Response('Invalid priority', Response::HTTP_BAD_REQUEST);
            }

            $entityManager->persist($task);
            $entityManager->flush();

            return new Response('Task added successfully', Response::HTTP_CREATED);
        }
        return new Response("", Response::HTTP_BAD_REQUEST);
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
