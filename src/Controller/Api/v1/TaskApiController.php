<?php

declare(strict_types=1);

namespace App\Controller\Api\v1;

use App\Config\StatusMessages;
use App\Config\Priority;
use App\Config\Status;
use App\Controller\BaseController;
use App\Dto\TaskDto;
use App\Entity\Task;
use App\Form\AddTaskFormType;
use App\Form\EditTaskFormType;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

/**
 *
 */
class TaskApiController extends BaseController
{
    /**
     * @throws ExceptionInterface
     */
    #[Route('/api/v1/task/getTasksWithStatus', name: 'app_task_get_task_with_status', methods: ['GET'])]
    function getTaskWithStatus(EntityManagerInterface $entityManager, SerializerInterface $serializer): Response
    {
        $tasks = $entityManager->getRepository(Task::class)->findBy(['user_id' => $this->getUser()->getId()]);
        $statusList = Status::cases();
        $tasksByStatus = [];

        foreach ($statusList as $status) {
            foreach ($tasks as $task) {
                if ($task->getStatus()->value === $status->value) {
                    $tasksByStatus[$task->getStatus()->name][] = $this->mapTaskToDto($task);
                }
            }
            if (!array_key_exists($status->name, $tasksByStatus)) {
                $tasksByStatus[$status->name] = [];
            }
        }
        return BaseController::createResponse('Tasks retrieved successfully', Response::HTTP_OK, $serializer->serialize($tasksByStatus,'json'));
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param AuthorizationCheckerInterface $authorizationChecker
     * @return Response
     */
    #[Route('/api/v1/task/delete', name: 'app_task_remove', methods: ['POST'])]
    public function deleteTask(Request $request, EntityManagerInterface $entityManager, AuthorizationCheckerInterface $authorizationChecker): Response
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
     * @throws Exception
     */
    #[Route('/api/v1/task/updateStatus', name: 'app_task_status_update', methods: ['POST'])]
    public function updateStatus(Request $request, EntityManagerInterface $entityManager, AuthorizationCheckerInterface $authorizationChecker): Response
    {
        $taskDto = $this->mapRequestToTaskDto($request);
        $task = $entityManager->getRepository(Task::class)->find($taskDto->getId());
        if (!$task) {
            return BaseController::createResponse(StatusMessages::TaskNotFound, Response::HTTP_NOT_FOUND);
        }

        if ($task->getUserId()->getId() !== $this->getUser()->getId()) {
            return BaseController::createResponse(StatusMessages::Forbidden, Response::HTTP_FORBIDDEN);
        }

        $status = Status::tryFrom($this->mapStatusToInt($taskDto->getStatus()));
        if (!$status) {
            return BaseController::createResponse(StatusMessages::TaskInvalidStatus, Response::HTTP_BAD_REQUEST);
        }

        if ($task->getStatus() !== $status) {
            if ($status === Status::Done) {
                $task->setCompletedAt(new DateTimeImmutable());
            }
            $task->setStatus($status);
            $task->setUpdatedAt(new DateTime());

            $entityManager->flush();

            return BaseController::createResponse(StatusMessages::TaskUpdated, Response::HTTP_OK);
        }

        return BaseController::createResponse(StatusMessages::TaskStatusNotChanged, Response::HTTP_NOT_MODIFIED);
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param AuthorizationCheckerInterface $authorizationChecker
     * @return Response
     */
    #[Route('/api/v1/task/addTask', name: 'app_task_addtask', methods: ['POST'])]
    public function addTask(Request $request, EntityManagerInterface $entityManager, AuthorizationCheckerInterface $authorizationChecker): Response
    {
        try {
            $taskDto = $this->mapRequestToTaskDto($request);

            $requestData = $request->getPayload()->all();
            $requestData['priority'] = Priority::tryFrom($requestData['priority']);

            $form = $this->createForm(AddTaskFormType::class);
            $form->submit($requestData);

            if (!$form->isValid()) {
                return BaseController::createResponse(StatusMessages::TaskInvalidData, Response::HTTP_BAD_REQUEST);
            }

            $task = new Task();
            $task->setTitle($taskDto->getTitle());
            $task->setDescription($taskDto->getDescription());
            $task->setPriority(Priority::tryFrom($taskDto->getPriority()));
            $task->setDueDate($taskDto->getDueDate());
            $task->setCreatedAt(new DateTimeImmutable());
            $task->setUpdatedAt(new DateTime());
            $task->setStatus(Status::Open);
            $task->setUserId($this->getUser());

            $entityManager->persist($task);
            $entityManager->flush();

            return BaseController::createResponse(StatusMessages::TaskCreated, Response::HTTP_CREATED);
        } catch (Exception $exception) {
            return BaseController::createResponse(StatusMessages::TaskCreateFailed, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param AuthorizationCheckerInterface $authorizationChecker
     * @return Response
     */
    #[Route('/api/v1/task/editTask', name: 'app_task_edittask', methods: ['POST'])]
    public function editTask(Request $request, EntityManagerInterface $entityManager, AuthorizationCheckerInterface $authorizationChecker): Response
    {
        try {
            $taskDto = $this->mapRequestToTaskDto($request);
            $requestData = $request->getPayload()->all();
            $requestData['priority'] = Priority::tryFrom($requestData['priority']);

            $task = $entityManager->getRepository(Task::class)->find($taskDto->getId());
            if (!$task) {
                return BaseController::createResponse(StatusMessages::TaskNotFound, Response::HTTP_NOT_FOUND);
            }

            if ($task->getUserId() !== $this->getUser()) {
                return BaseController::createResponse(StatusMessages::Forbidden, Response::HTTP_FORBIDDEN);
            }

            $form = $this->createForm(EditTaskFormType::class, $task);
            $form->submit($requestData);

            if (!$form->isValid()) {
                return BaseController::createResponse(StatusMessages::TaskInvalidData, Response::HTTP_BAD_REQUEST);
            }

            $task->setTitle($taskDto->getTitle());
            $task->setDescription($taskDto->getDescription());
            $task->setPriority(Priority::tryFrom($taskDto->getPriority()));
            $task->setDueDate($taskDto->getDueDate());
            $task->setUpdatedAt(new DateTime());

            $entityManager->flush();

            return BaseController::createResponse(StatusMessages::TaskUpdated, Response::HTTP_OK);
        } catch (Exception $e) {
            return BaseController::createResponse($e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * @param string $status
     * @return bool|int
     */
    private function mapStatusToInt(string $status): bool|int
    {
        foreach (Status::cases() as $case) {
            if ($case->name === $status) {
                return $case->value;
            }
        }
        return false;
    }

    /**
     * @param Task $task
     * @return TaskDto
     */
    private function mapTaskToDto(Task $task): TaskDto
    {
        return new TaskDto(
            $task->getId(),
            $task->getTitle(),
            $task->getDescription(),
            $task->getStatus()->name,
            $task->getPriority()->value,
            $task->getDueDate(),
            $task->getCreatedAt(),
            $task->getUpdatedAt());
    }

    /**
     * @throws Exception
     */
    private function mapRequestToTaskDto(Request $request): TaskDto
    {
        return new TaskDto(
            $request->getPayload()->get('id', 0),
            $request->getPayload()->get('title', ''),
            $request->getPayload()->get('description', ''),
            $request->getPayload()->get('status', Status::Open->name),
            $request->getPayload()->get('priority', Priority::MediumPriority->value),
            $request->getPayload()->get('due_date') !== null ? new \DateTime($request->getPayload()->get('due_date')) : null,
            new \DateTimeImmutable(), // createdAt ggf. aus Request oder jetzt setzen
            new \DateTime()           // updatedAt ggf. aus Request oder jetzt setzen
        );
    }
}
