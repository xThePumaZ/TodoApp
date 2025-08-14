<?php

declare(strict_types=1);

namespace App\Controller\Api\v1;

use App\Config\Priority;
use App\Config\Status;
use App\Controller\BaseController;
use App\Entity\Task;
use App\Form\AddTaskFormType;
use App\Form\EditTaskFormType;
use App\Model\Task as TaskModel;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

class TaskApiController extends BaseController
{
    /**
     * @throws ExceptionInterface
     */
    #[Route('/api/v1/task/getTasksWithStatus', name: 'app_task_get_task_with_status', methods: ['GET'])]
    function getTaskWithStatus(EntityManagerInterface $entityManager, SerializerInterface $serializer): Response
    {
        $user = $this->getUser();

        if (!$user) {
            return new Response('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }
        $tasks = $entityManager->getRepository(Task::class)->findBy(['user_id' => $user->getId()]);

        $statusList = Status::cases();
        $tasksByStatus = [];

        foreach ($statusList as $status) {
            foreach ($tasks as $task) {
                if ($task->getStatus()->value === $status->value) {
                    $tasksByStatus[$task->getStatus()->name][] = $this->createModelFromEntity($task);
                }
            }
            if (!array_key_exists($status->name, $tasksByStatus)) {
                $tasksByStatus[$status->name] = [];
            }
        }
        return BaseController::createResponse('Tasks retrieved successfully', Response::HTTP_OK, $serializer->serialize($tasksByStatus,'json'));
    }

    #[Route('/api/v1/task/delete', name: 'app_task_remove', methods: ['POST'])]
    public function deleteTask(Request $request, EntityManagerInterface $entityManager): Response
    {
        $task = $entityManager->getRepository(Task::class)->find($request->query->get('id'));
        if ($task) {
            $entityManager->remove($task);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_dashboard');
    }

    /**
     * @throws ExceptionInterface
     */
    #[Route('/api/v1/task/update_status', name: 'app_task_status_update', methods: ['POST'])]
    public function updateStatus(Request $request ,EntityManagerInterface $entityManager, AuthorizationCheckerInterface $authorizationChecker): Response
    {

        if (!$authorizationChecker->isGranted('ROLE_USER')) {
            return BaseController::createResponse('Access denied', Response::HTTP_FORBIDDEN);
        }

        $requestContent = json_decode($request->getContent());

        if (!$requestContent || !isset($requestContent->task_id) || !isset($requestContent->status)) {
            return new Response('Invalid request data', Response::HTTP_BAD_REQUEST);
        }

        $task = $entityManager->getRepository(Task::class)->find($requestContent->task_id);
        $status = Status::tryFrom($this->mapStatusToInt($requestContent->status));

        if (!$task) {
            throw $this->createNotFoundException('Task not found');
        }

        if ($task->getUserId() != $this->getUser()) {
            return BaseController::createResponse('Access denied', Response::HTTP_FORBIDDEN);
        }

        if ($task->getStatus() !== $status) {
            if ($status === Status::Done) {
                $task->setCompletedAt(new DateTimeImmutable());
            }

            $task->setStatus($status);
            $task->setUpdatedAt(new DateTime());

            $entityManager->persist($task);
            $entityManager->flush();

            return BaseController::createResponse('Task updated successfully');
        }

        return BaseController::createResponse('Task status is already ' . $status->name, Response::HTTP_NOT_MODIFIED);
    }

    #[Route('/api/v1/task/addTask', name: 'app_task_addtask', methods: ['POST'])]
    public function addTask(Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $task = new Task();
            $requestData = $request->request->all();

            if ($requestData['priority'] !== null) {
                $requestData['priority'] = Priority::tryFrom($requestData['priority']);
            }

            $addTaskForm = $this->createForm(AddTaskFormType::class, $task)->handleRequest($request);
            $addTaskForm->submit($requestData);

            if ($addTaskForm->isSubmitted() && $addTaskForm->isValid()) {
                $task->setTitle($addTaskForm->get('title')->getData());
                $task->setDescription($addTaskForm->get('description')->getData());
                $task->setPriority($addTaskForm->get('priority')->getData());
                $task->setDueDate($addTaskForm->get('due_date')->getData());

                $task->setCreatedAt(new DateTimeImmutable());
                $task->setUpdatedAt(new DateTime());
                $task->setStatus(Status::Open);

                $task->setUserId($this->getUser());

                $entityManager->persist($task);
                $entityManager->flush();
            }
            return BaseController::createResponse('Task added successfully');
        } catch (Exception $e) {
            return BaseController::createResponse($e->getMessage(), $e->getCode());
        }
    }

    #[Route('/api/v1/task/editTask', name: 'app_task_edittask', methods: ['POST'])]
    public function editTask(Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $requestData = $request->request->all();

            if (!isset($requestData['id'])) {
                return BaseController::createResponse('Task ID is required', Response::HTTP_BAD_REQUEST);
            }

            $task = $entityManager->getRepository(Task::class)->find($requestData['id']);

            if (!$task) {
                return BaseController::createResponse('Task not found', Response::HTTP_NOT_FOUND);
            }

            if ($task->getUserId() !== $this->getUser()) {
                return BaseController::createResponse('Access denied', Response::HTTP_FORBIDDEN);
            }

            if ($requestData['priority'] !== null && $requestData['priority'] !== '') {
                $requestData['priority'] = Priority::tryFrom($requestData['priority']);
            }

            $editTaskForm = $this->createForm(EditTaskFormType::class, $task)->handleRequest($request);
            $editTaskForm->submit($requestData);

            if ($editTaskForm->isSubmitted() && $editTaskForm->isValid()) {
                $task->setTitle($editTaskForm->get('title')->getData());
                $task->setDescription($editTaskForm->get('description')->getData());
                $task->setPriority($editTaskForm->get('priority')->getData());
                $task->setDueDate($editTaskForm->get('due_date')->getData());

                $task->setUpdatedAt(new DateTime());

                $entityManager->flush();

                return BaseController::createResponse('Task updated successfully');
            }

            return BaseController::createResponse('Invalid form data', Response::HTTP_BAD_REQUEST);
        } catch (Exception $e) {
            return BaseController::createResponse($e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
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

    private function createModelFromEntity(Task $task): TaskModel
    {
        return new TaskModel(
            $task->getId(),
            $task->getTitle(),
            $task->getDescription(),
            $task->getStatus()->name,
            $task->getPriority()->value,
            $task->getDueDate(),
            $task->getCreatedAt(),
            $task->getUpdatedAt());
    }
}
