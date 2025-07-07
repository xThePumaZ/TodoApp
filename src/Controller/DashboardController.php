<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config\Status;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'app_dashboard')]
    public function index(): Response
    {
        $tasks = $this->getUser()->getTasks();
        $statusList = Status::cases();
        $tasksByStatus = [];

        foreach ($statusList as $status) {
            foreach ($tasks as $task) {
                if ($task->getStatus()->value === $status->value) {
                    $tasksByStatus[$task->getStatus()->name][] = $task;
                }
            }
            if (!array_key_exists($status->name,$tasksByStatus) && !is_null($status->name)) {
                $tasksByStatus[$status->name] = [];
            }
        }
        return $this->render('dashboard.html.twig', ['tasksByStatus' => $tasksByStatus]);
    }

}
