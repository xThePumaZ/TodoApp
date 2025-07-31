<?php

declare(strict_types=1);

namespace App\Controller\Api\v1;

use App\Config\Priority;
use App\Config\Status;
use App\Controller\BaseController;
use App\Entity\Task;
use App\Form\AddTaskFormType;
use App\Model\Task as TaskModel;
use DateTime;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Serializer\Exception\ExceptionInterface;
use Symfony\Component\Serializer\SerializerInterface;

class TaskApiController extends BaseController
{

    #[Route('/api/v1/task/getTasksStatus', name: 'app_task_get_status', methods: ['GET'])]
    public function getTasksStatus(): JsonResponse|Response
    {
        $user = $this->getUser();
        if (!$user) {
            return new Response('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }

        $statusList = Status::cases();
        $statuses = [];

        foreach ($statusList as $status) {
            $statuses[] = $status->name;
        }

        return $this->json(
            [
                'data' => $statuses,
                'message' => 'Statuses retrieved successfully',
            ],
            Response::HTTP_OK
        );

    }

    #[Route('/api/v1/task/getAllTasks', name: 'app_task_get', methods: ['GET'])]
    public function getTasks(EntityManagerInterface $entityManager, SerializerInterface $serializer): JsonResponse|Response
    {
        $taskReturn = [];
        $user = $this->getUser();

        if (!$user) {
            return new Response('Unauthorized', Response::HTTP_UNAUTHORIZED);
        }

        $tasks = $entityManager->getRepository(Task::class)->findBy(['user_id' => $user->getId(), 'status' => [Status::Open, Status::InProgress]]);

        foreach ($tasks as $task) {
            $taskReturn[] = $this->createModelFromEntity($task);
        }

        return BaseController::createResponse('Tasks retrieved successfully', Response::HTTP_OK, $taskReturn);
    }

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

    /**
     * @throws ExceptionInterface
     */
    #[Route('/api/v1/task/update_status', name: 'app_task_status_update', methods: ['POST'])]
    public function updateStatus(EntityManagerInterface $entityManager, SerializerInterface $serializer): Response
    {
        $request = Request::createFromGlobals();
        $requestContent = json_decode($request->getContent());

        if (!$requestContent || !isset($requestContent->task_id) || !isset($requestContent->status)) {
            return new Response('Invalid request data', Response::HTTP_BAD_REQUEST);
        }

        $task = $entityManager->getRepository(Task::class)->find($requestContent->task_id);
        $status = Status::tryFrom($this->mapStatusToInt($requestContent->status));

        if (!$task) {
            throw $this->createNotFoundException('Task not found');
        }

        if ($task->getStatus() !== $status) {
            if ($status === Status::Done) {
                $task->setCompletedAt(new DateTimeImmutable());
            }

            $task->setStatus($status);
            $task->setUpdatedAt(new DateTime());

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
//            $title = $request->request->get('title');
//
//            $description = $request->request->get('description');
//            $priority = Priority::tryFrom($request->request->get('priority'));
//            $dueDateString = $request->request->get('due_date');

            $addTaskForm = $this->createForm(AddTaskFormType::class, $task)->handleRequest($request);
            $addTaskForm->submit($request->request->all());

            if ($addTaskForm->isSubmitted() && $addTaskForm->isValid()) {
                $task->setTitle($addTaskForm->get('title')->getData());
                $task->setDescription($addTaskForm->get('description')->getData());
                $task->setPriority($addTaskForm->get('priority')->getData());
                $task->setDueDate(new DateTime($addTaskForm->get('dueDate')->getData()));

                $task->setCreatedAt(new DateTimeImmutable());
                $task->setUpdatedAt(new DateTime());
                $task->setStatus(Status::Open);



                $entityManager->persist($task);
                $entityManager->flush();
            }

/*            if (empty($title)) {
                return new Response(null, Response::HTTP_BAD_REQUEST);
            }

            if ($description) {
                $task->setDescription($description);
            }

            if ($priority) {
                $task->setPriority($priority);
            }

            if ($dueDateString) {
                try {
                    $dueDate = new DateTime($dueDateString);
                    $task->setDueDate($dueDate);
                } catch (Exception $e) {
                    return new Response('Invalid date format', Response::HTTP_BAD_REQUEST);
                }
            }

            $task->setTitle($title);

            // Set default values
            $task->setCreatedAt(new DateTimeImmutable());
            $task->setUpdatedAt(new DateTime());
            $task->setStatus(Status::Open);

            $this->getUser()->addTask($task);
            $entityManager->persist($task);
            $entityManager->flush();

             Return success response*/

            return BaseController::createResponse('Task added successfully', Response::HTTP_CREATED);
        } catch (Exception $e) {
            return BaseController::createResponse($e->getMessage(), $e->getCode());
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
