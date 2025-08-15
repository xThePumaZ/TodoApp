<?php

namespace App\Tests;

use App\Config\Priority;
use App\Config\Status;
use App\Entity\Task;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class TaskApiControllerTest extends WebTestCase
{
    private KernelBrowser $client;
    private EntityManagerInterface $entityManager;
    private User $testUser;

    protected function setUp(): void
    {
        $this->client = static::createClient();
        $container = static::getContainer();
        $this->entityManager = $container->get('doctrine.orm.entity_manager');

        // Clean up database
        $this->cleanDatabase();

        // Create test user
        $this->createTestUser();
    }

    private function cleanDatabase(): void
    {
        $taskRepository = $this->entityManager->getRepository(Task::class);
        $userRepository = $this->entityManager->getRepository(User::class);

        foreach ($taskRepository->findAll() as $task) {
            $this->entityManager->remove($task);
        }

        foreach ($userRepository->findAll() as $user) {
            $this->entityManager->remove($user);
        }

        $this->entityManager->flush();
    }

    private function createTestUser(): void
    {
        $container = static::getContainer();
        $passwordHasher = $container->get('security.user_password_hasher');

        $this->testUser = (new User())->setUsername('testuser');
        $this->testUser->setPassword($passwordHasher->hashPassword($this->testUser, 'password'));

        $this->entityManager->persist($this->testUser);
        $this->entityManager->flush();
    }

    private function loginUser(): void
    {
        $this->client->request('GET', '/login');
        $this->client->submitForm('Login', [
            '_username' => 'testuser',
            '_password' => 'password',
        ]);
    }


    public function testGetTasksWithStatusUnauthorized(): void
    {
        $this->client->request('GET', '/api/v1/task/getTasksWithStatus');

        self::assertResponseStatusCodeSame(Response::HTTP_UNAUTHORIZED);
    }

    public function testGetTasksWithStatusAuthorized(): void
    {
        $this->loginUser();

        // Create test tasks
        $this->createTestTasks();

        $this->client->request('GET', '/api/v1/task/getTasksWithStatus');

        self::assertResponseIsSuccessful();
        $response = json_decode($this->client->getResponse()->getContent(), true);

        self::assertArrayHasKey('data', $response);
        self::assertArrayHasKey('message', $response);
        self::assertEquals('Tasks retrieved successfully', $response['message']);

        $tasksByStatus = json_decode($response['data'], true);
        self::assertArrayHasKey('Open', $tasksByStatus);
        self::assertArrayHasKey('InProgress', $tasksByStatus);
        self::assertArrayHasKey('Done', $tasksByStatus);
    }

    public function testUpdateStatusWithValidData(): void
    {
        $this->loginUser();

        $task = $this->createSingleTestTask();

        $this->client->request('POST', '/api/v1/task/update_status', [], [], [], json_encode([
            'id' => $task->getId(),
            'status' => 'InProgress'
        ]));

        self::assertResponseIsSuccessful();
        $response = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('Task updated successfully', $response['message']);

        // Verify task status was updated
        $updatedTask = $this->entityManager->getRepository(Task::class)->find($task->getId());
        self::assertEquals(Status::InProgress, $updatedTask->getStatus());
    }

    public function testUpdateStatusWithInvalidData(): void
    {
        $this->loginUser();

        $this->client->request('POST', '/api/v1/task/update_status', [], [], [], json_encode([
            'invalid' => 'data'
        ]));

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
    }

    public function testAddTaskWithValidData(): void
    {
        $this->loginUser();

        $this->client->request('POST', '/api/v1/task/addTask', [
            'title' => 'New Test Task',
            'description' => 'Test task description',
            'priority' => Priority::MediumPriority->value,
            'due_date' => '2024-12-31'
        ]);

        self::assertResponseIsSuccessful();
        $response = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('Task added successfully', $response['message']);

        // Verify task was created
        $tasks = $this->entityManager->getRepository(Task::class)->findBy(['title' => 'New Test Task']);
        self::assertCount(1, $tasks);
        self::assertEquals('New Test Task', $tasks[0]->getTitle());
        self::assertEquals(Status::Open, $tasks[0]->getStatus());
    }

    public function testEditTaskWithValidData(): void
    {
        $this->loginUser();

        $task = $this->createSingleTestTask();

        $this->client->request('POST', '/api/v1/task/editTask', [
            'id' => $task->getId(),
            'title' => 'Updated Task Title',
            'description' => 'Updated description',
            'priority' => Priority::HighPriority->value,
            'due_date' => '2024-12-25'
        ]);

        self::assertResponseIsSuccessful();
        $response = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('Task updated successfully', $response['message']);

        // Verify task was updated
        $updatedTask = $this->entityManager->getRepository(Task::class)->find($task->getId());
        self::assertEquals('Updated Task Title', $updatedTask->getTitle());
        self::assertEquals('Updated description', $updatedTask->getDescription());
        self::assertEquals(Priority::HighPriority, $updatedTask->getPriority());
    }

    public function testEditTaskWithoutId(): void
    {
        $this->loginUser();

        $this->client->request('POST', '/api/v1/task/editTask', [
            'title' => 'Updated Task Title'
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_BAD_REQUEST);
        $response = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('Task ID is required', $response['message']);
    }

    public function testEditTaskNotFound(): void
    {
        $this->loginUser();

        $this->client->request('POST', '/api/v1/task/editTask', [
            'id' => 99999,
            'title' => 'Updated Task Title'
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_NOT_FOUND);
        $response = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('Task not found', $response['message']);
    }

    public function testEditTaskAccessDenied(): void
    {
        // Create another user and task
        $anotherUser = (new User())->setUsername('anotheruser');
        $container = static::getContainer();
        $passwordHasher = $container->get('security.user_password_hasher');
        $anotherUser->setPassword($passwordHasher->hashPassword($anotherUser, 'password'));
        $this->entityManager->persist($anotherUser);

        $task = new Task();
        $task->setTitle('Another User Task');
        $task->setDescription('Task by another user');
        $task->setPriority(Priority::LowPriority);
        $task->setStatus(Status::Open);
        $task->setUserId($anotherUser);
        $task->setCreatedAt(new \DateTimeImmutable());
        $task->setUpdatedAt(new \DateTime());
        $this->entityManager->persist($task);
        $this->entityManager->flush();

        $this->loginUser();

        $this->client->request('POST', '/api/v1/task/editTask', [
            'id' => $task->getId(),
            'title' => 'Trying to update another user task'
        ]);

        self::assertResponseStatusCodeSame(Response::HTTP_FORBIDDEN);
        $response = json_decode($this->client->getResponse()->getContent(), true);

        self::assertEquals('Access denied', $response['message']);
    }

    private function createTestTasks(): void
    {
        // Refresh the user entity to ensure it's managed
        $this->testUser = $this->entityManager->find(User::class, $this->testUser->getId());

        $tasks = [
            ['title' => 'Open Task', 'status' => Status::Open],
            ['title' => 'In Progress Task', 'status' => Status::InProgress],
            ['title' => 'Done Task', 'status' => Status::Done],
        ];

        foreach ($tasks as $taskData) {
            $task = new Task();
            $task->setTitle($taskData['title']);
            $task->setDescription('Test description');
            $task->setPriority(Priority::MediumPriority);
            $task->setStatus($taskData['status']);
            $task->setUserId($this->testUser);
            $task->setCreatedAt(new \DateTimeImmutable());
            $task->setUpdatedAt(new \DateTime());

            $this->entityManager->persist($task);
        }

        $this->entityManager->flush();
    }

    private function createSingleTestTask(): Task
    {
        // Refresh the user entity to ensure it's managed
        $this->testUser = $this->entityManager->find(User::class, $this->testUser->getId());

        $task = new Task();
        $task->setTitle('Test Task');
        $task->setDescription('Test description');
        $task->setPriority(Priority::MediumPriority);
        $task->setStatus(Status::Open);
        $task->setUserId($this->testUser);
        $task->setCreatedAt(new \DateTimeImmutable());
        $task->setUpdatedAt(new \DateTime());

        $this->entityManager->persist($task);
        $this->entityManager->flush();

        return $task;
    }
}
