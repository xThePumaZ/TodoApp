<?php

declare(strict_types=1);

namespace App\Controller\Api\v1;

use App\Controller\BaseController;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

class UserApiController extends BaseController
{
    #[Route('/api/v1/user/change_picture', name: 'app_account_change_picture')]
    public function changePicture(EntityManagerInterface $entityManager): Response
    {
        $request = Request::createFromGlobals();
        if (!$request->files->has('profileImage')) {
            return BaseController::createResponse('No profile image provided.', Response::HTTP_BAD_REQUEST);
        }

        $profilePicture = base64_encode($request->files->get('profileImage')->getContent());
        $this->getUser()->setProfilePicture($profilePicture);
        $entityManager->persist($this->getUser());
        $entityManager->flush();

        return BaseController::createResponse('Profile picture updated successfully.');
    }

    #[Route('/api/v1/user/loadProfilePicture', name: 'app_account_load_profile_picture')]
    public function loadProfilePicture(EntityManagerInterface $entityManager): Response
    {
        if ($this->getUser()) {
            $user = $entityManager->getRepository(User::class)->find($this->getUser()->getId());
            if (!empty($user->getProfilePicture())) {
                return BaseController::createResponse('Profile picture loaded successfully.', Response::HTTP_OK, ['data:image/jpeg;base64, ' . stream_get_contents($user->getProfilePicture()),
                ]);
            }
        }

        return BaseController::createResponse('No profile picture found, using default image.', Response::HTTP_OK, [
            'data:image/jpeg;base64, ' . base64_encode(file_get_contents('build/images/default-avatar.png')),
        ]);
    }

    #[Route('/api/v1/user/changePassword', name: 'app_account_change_password')]
    public function changePassword(EntityManagerInterface $entityManager, UserPasswordHasherInterface $userPasswordHasher): Response
    {
        $request = Request::createFromGlobals();

        if (!$request->request->has('currentPassword') || !$request->request->has('newPassword')) {
            return BaseController::createResponse('No current password provided.', Response::HTTP_BAD_REQUEST);
        }

        $user = $entityManager->getRepository(User::class)->find($this->getUser()->getId());
        $user->setPassword($userPasswordHasher->hashPassword($user, $request->request->get('currentPassword')));

        $entityManager->persist($user);
        $entityManager->flush();


        return BaseController::createResponse('Password updated successfully.');

    }
}
