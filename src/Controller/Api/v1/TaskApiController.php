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
use App\Trait\TaskAuthorizationTrait;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

/**
 * API Controller für Task-Management
 */
class TaskApiController extends BaseController
{
    use TaskAuthorizationTrait;

    /**
     * Holt alle Tasks gruppiert nach Status
     *
     * @throws ExceptionInterface
     */
    #[Route('/api/v1/task/getTasksWithStatus', name: 'app_task_get_task_with_status', methods: ['GET'])]
    function getTaskWithStatus(EntityManagerInterface $entityManager, SerializerInterface $serializer): Response
    {
        try {
            $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

            $tasks = $entityManager->getRepository(Task::class)->findBy(['user_id' => $this->getUser()->getId()]);
            $tasksByStatus = $this->groupTasksByStatus($tasks);

            return BaseController::createResponse(
                StatusMessages::TaskRetrieved,
                Response::HTTP_OK,
                $serializer->serialize($tasksByStatus, 'json')
            );
        } catch (Exception) {
            return BaseController::createResponse(
                StatusMessages::TaskRetrieved,
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Löscht ein Task
     */
    #[Route('/api/v1/task/delete/{id}', name: 'app_task_remove', requirements: ['id' => '\d+'], methods: ['DELETE'])]
    public function deleteTask(int $id, EntityManagerInterface $entityManager): Response
    {
        try {
            $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

            $task = $this->findTaskOrThrow($id, $entityManager);
            $this->checkTaskOwnership($task);

            $entityManager->remove($task);
            $entityManager->flush();

            return BaseController::createResponse(StatusMessages::TaskDeleted, Response::HTTP_NO_CONTENT);
        } catch (Exception $e) {
            if ($e->getMessage() === StatusMessages::TaskNotFound->value) {
                return BaseController::createResponse(StatusMessages::TaskNotFound, Response::HTTP_NOT_FOUND);
            }
            if ($e->getMessage() === StatusMessages::Forbidden->value) {
                return BaseController::createResponse(StatusMessages::Forbidden, Response::HTTP_FORBIDDEN);
            }
            return BaseController::createResponse(StatusMessages::TaskDeleteFailed, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Aktualisiert den Status einer Task
     *
     * @throws ExceptionInterface
     * @throws Exception
     */
    #[Route('/api/v1/task/updateStatus', name: 'app_task_status_update', methods: ['POST'])]
    public function updateStatus(Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

            $taskDto = $this->mapRequestToTaskDto($request);
            $task = $this->findTaskOrThrow($taskDto->getId(), $entityManager);
            $this->checkTaskOwnership($task);

            if ($task->getStatus() === $taskDto->getStatus()) {

                return BaseController::createResponse(StatusMessages::TaskStatusNotChanged->value, Response::HTTP_OK, [
                    'taskId' => $task->getId(),
                    'status' => $task->getStatus()->name
                ]);
            }

            $this->updateTaskStatus($task, $taskDto->getStatus());
            $entityManager->flush();

            return BaseController::createResponse(StatusMessages::TaskUpdated);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Erstellt eine neue Task
     */
    #[Route('/api/v1/task', name: 'app_task_add_task', methods: ['POST'])]
    public function addTask(Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

            $taskDto = $this->mapRequestToTaskDto($request);
            $requestData = $this->prepareRequestData($request);

            $form = $this->createForm(AddTaskFormType::class);
            $form->submit($requestData);

            if (!$form->isValid()) {
                return BaseController::createResponse(StatusMessages::TaskInvalidData, Response::HTTP_BAD_REQUEST);
            }

            $task = $this->createTaskFromDto($taskDto);
            $entityManager->persist($task);
            $entityManager->flush();

            return BaseController::createResponse(StatusMessages::TaskCreated, Response::HTTP_CREATED);
        } catch (Exception) {
            return BaseController::createResponse(StatusMessages::TaskCreateFailed, Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Bearbeitet eine bestehende Task
     */
    #[Route('/api/v1/task/edit/{id}', name: 'app_task_edit_task', requirements: ['id' => '\d+'], methods: ['PUT'])]
    public function editTask(int $id, Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

            $task = $this->findTaskOrThrow($id, $entityManager);
            $this->checkTaskOwnership($task);

            $taskDto = $this->mapRequestToTaskDto($request);
            $requestData = $this->prepareRequestData($request);

            $form = $this->createForm(EditTaskFormType::class, $task);
            $form->submit($requestData);

            if (!$form->isValid()) {
                return BaseController::createResponse(StatusMessages::TaskInvalidData, Response::HTTP_BAD_REQUEST);
            }

            $this->updateTaskFromDto($task, $taskDto);
            $entityManager->flush();

            return BaseController::createResponse(StatusMessages::TaskUpdated);
        } catch (Exception $e) {
            return $this->handleException($e);
        }
    }

    /**
     * Gruppiert Tasks nach Status
     */
    private function groupTasksByStatus(array $tasks): array
    {
        $tasksByStatus = [];
        $statusList = Status::cases();

        foreach ($statusList as $status) {
            $tasksByStatus[$status->name] = [];
        }

        foreach ($tasks as $task) {
            $statusName = $task->getStatus()->name;
            $tasksByStatus[$statusName][] = $this->mapTaskToDto($task);
        }

        return $tasksByStatus;
    }

    /**
     * Findet ein Task oder wirft Exception
     * @throws Exception
     */
    private function findTaskOrThrow(int $id, EntityManagerInterface $entityManager): Task
    {
        $task = $entityManager->getRepository(Task::class)->find($id);
        if (!$task) {
            throw new Exception(StatusMessages::TaskNotFound->value);
        }
        return $task;
    }

    /**
     * Bereitet Request-Daten für Formular vor
     */
    private function prepareRequestData(Request $request): array
    {
        $requestData = $request->getPayload()->all();
        if (isset($requestData['priority'])) {
            $requestData['priority'] = Priority::tryFrom($requestData['priority']);
        }
        return $requestData;
    }

    /**
     * Erstellt Task aus DTO
     */
    private function createTaskFromDto(TaskDto $taskDto): Task
    {
        $task = new Task();
        $task->setTitle($taskDto->getTitle());
        $task->setDescription($taskDto->getDescription());
        $task->setPriority(Priority::tryFrom($taskDto->getPriority()));
        $task->setDueDate($taskDto->getDueDate());
        $task->setCreatedAt(new DateTimeImmutable());
        $task->setUpdatedAt(new DateTime());
        $task->setStatus(Status::Open);
        $task->setUserId($this->getUser());

        return $task;
    }

    /**
     * Aktualisiert Task aus DTO
     */
    private function updateTaskFromDto(Task $task, TaskDto $taskDto): void
    {
        $task->setTitle($taskDto->getTitle());
        $task->setDescription($taskDto->getDescription());
        $task->setPriority(Priority::tryFrom($taskDto->getPriority()));
        $task->setDueDate($taskDto->getDueDate());
        $task->setUpdatedAt(new DateTime());
    }

    /**
     * Aktualisiert Task-Status
     */
    private function updateTaskStatus(Task $task, Status $status): void
    {
        if ($status === Status::Done) {
            $task->setCompletedAt(new DateTimeImmutable());
        }
        $task->setStatus($status);
        $task->setUpdatedAt(new DateTime());
    }

    /**
     * Behandelt Exceptions einheitlich
     */
    private function handleException(Exception $e): Response
    {
        return match ($e->getMessage()) {
            StatusMessages::TaskNotFound => BaseController::createResponse(
                StatusMessages::TaskNotFound,
                Response::HTTP_NOT_FOUND
            ),
            StatusMessages::Forbidden => BaseController::createResponse(
                StatusMessages::Forbidden,
                Response::HTTP_FORBIDDEN
            ),
            default => BaseController::createResponse(
                StatusMessages::TaskUpdateFailed,
                Response::HTTP_INTERNAL_SERVER_ERROR
            )
        };
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
            $this->mapStatusFromString($request->getPayload()->get('status', Status::Open->name)),
            $request->getPayload()->get('priority', Priority::MediumPriority->value),
            $request->getPayload()->get('due_date') !== null ? new DateTime($request->getPayload()->get('due_date')) : null,
            new DateTimeImmutable(),
            new DateTime()
        );
    }

    private function mapTaskToDto(Task $task): TaskDto
    {
        return new TaskDto(
            $task->getId(),
            $task->getTitle(),
            $task->getDescription(),
            $task->getStatus(),
            $task->getPriority()->value,
            $task->getDueDate(),
            $task->getCreatedAt(),
            $task->getUpdatedAt());
    }

    private function mapStatusFromString(string $statusString): Status
    {
        foreach (Status::cases() as $status) {
            if ($status->name === $statusString) {
                return $status;
            }
        }
        throw new Exception(StatusMessages::TaskInvalidStatus->value);
    }
}
