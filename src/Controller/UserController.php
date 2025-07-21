<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class UserController extends AbstractController
{
    #[Route('/user')]
    public function index(): Response
    {
        return $this->render('user/index.html.twig');
    }


    #[Route('/user/register')]
    public function register()
    {
        return $this->render('user/register.html.twig');
    }

    #[Route('/account')]
    public function account(): Response
    {
        return $this->render('user/account.html.twig');
    }
}
