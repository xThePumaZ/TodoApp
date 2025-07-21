<?php

declare(strict_types=1);

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\MakerBundle\Security\Model\Authenticator;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Security\Http\Authentication\AuthenticatorManager;

class IndexController extends AbstractController
{
    #[Route('/', name: 'app_index')]
    public function index(AuthorizationCheckerInterface $authorizationChecker): Response
    {
        if ($authorizationChecker->isGranted('ROLE_USER')) {
            // Redirect to the dashboard if the user is logged in
            return $this->redirectToRoute('app_dashboard');
        } else {
            // Redirect to the login page if the user is not logged in
            return $this->redirectToRoute('app_login');
        }
    }
}
