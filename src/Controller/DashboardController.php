<?php

declare(strict_types=1);

namespace App\Controller;

use App\Config\Priority;
use App\Config\Status;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;
use Symfony\Component\Serializer\Serializer;
use Symfony\Component\Serializer\SerializerInterface;
use Symfony\Component\Serializer\Context\Normalizer\ObjectNormalizerContextBuilder;

class DashboardController extends AbstractController
{
    #[Route('/dashboard', name: 'app_dashboard')]
    public function index(AuthorizationCheckerInterface $authorizationChecker, SerializerInterface $serializer): Response
    {
        if (!$authorizationChecker->isGranted('ROLE_USER')) {
            return $this->redirectToRoute('app_login');
        }

        return $this->render('dashboard.html.twig', ['priority' => $this->mapPriorityToColour(Priority::cases()) ]);
    }

    private function mapPriorityToColour($priorities): array
    {
        $list = [];
        foreach ($priorities as $priority) {
           $list[$priority->value] = $this->getPriorityColor(Priority::tryFrom($priority->value));
        }

        return $list;
    }

    private function getPriorityColor(Priority $priority): string
    {
        return match ($priority) {
            Priority::HighPriority => 'bg-red-400',
            Priority::MediumPriority => 'bg-amber-500',
            Priority::LowPriority => 'bg-green-500',
        };
    }
}
