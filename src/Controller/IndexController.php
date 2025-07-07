<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class IndexController extends AbstractController
{
    #[Route('/', name: 'app_index')]
    public function index(): Response
    {
        if ($this->getUser()) {
            // Redirect to the dashboard if the user is logged in
            return $this->redirectToRoute('app_dashboard');
        } else {
            // Redirect to the login page if the user is not logged in
            return $this->redirectToRoute('app_login');
        }
    }
}
