<?php

declare(strict_types=1);

namespace App\Controller\Api\v1;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class UserApiController extends AbstractController
{
    #[Route('/api/v1/user/change_picture', name: 'app_account_change_picture')]
    public function changePicture(EntityManagerInterface $entityManager): Response
    {
        $request = Request::createFromGlobals();
        if (!$request->files->has('profileImage')) {
            return $this->json(
                [
                    'message' => 'No profile image provided.',
                ],
                Response::HTTP_BAD_REQUEST
            );
        }

        $profilePicture = base64_encode($request->files->get('profileImage')->getContent());
        $this->getUser()->setProfilePicture($profilePicture);
        $entityManager->persist($this->getUser());
        $entityManager->flush();

        return $this->json(
            [
                'message' => 'Profile picture was updated successfully.',
            ],
            Response::HTTP_OK
        );
    }

    #[Route('/api/v1/user/profile_picture', name: 'app_account_load_profile_picture')]
    public function loadProfilePicture(EntityManagerInterface $entityManager): \Symfony\Component\HttpFoundation\JsonResponse
    {
        if ($this->getUser()) {
            $user = $entityManager->getRepository(User::class)->find($this->getUser()->getId());
            $profilePicture = stream_get_contents($user->getProfilePicture());

            if (!empty($profilePicture)) {
                return $this->json(
                    [
                        'message' => 'Profile picture loaded successfully.',
                        'profilePicture' => 'data:image/jpeg;base64, ' . $profilePicture,
                    ],
                    Response::HTTP_OK
                );
            } else {
                return $this->json(
                    [
                        'message' => 'No profile picture found, using default image.',
                        'profilePicture' => 'data:image/jpeg;base64, ' . base64_encode(file_get_contents('build/images/default-avatar.png')),
                    ],
                    Response::HTTP_OK
                );
            }
        }
        return $this->json(
            [
                'message' => 'No profile picture found.',
            ],
            Response::HTTP_NOT_FOUND
        );
    }

    #[Route('/api/v1/user/change_password', name: 'app_account_change_password')]
    public function changePassword(): Response
    {
        // Logic for changing the user's password would go here.
        // This could involve validating the current password,
        // ensuring the new password meets security requirements,
        // and updating the user's password in the database.
        return $this->json(
            [
                'message' => 'Change password endpoint is not yet implemented.',
            ],
            Response::HTTP_NOT_IMPLEMENTED
        );
    }
}
