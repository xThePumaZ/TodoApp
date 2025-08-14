<?php

declare(strict_types=1);

namespace App\Controller\Api\v1;

use App\Controller\BaseController;
use App\Entity\User;
use App\Service\ProfilePictureService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Core\Authorization\AuthorizationCheckerInterface;

class UserApiController extends BaseController
{
    #[Route('/api/v1/user/change_picture', name: 'app_account_change_picture')]
    public function changePicture(Request $request, EntityManagerInterface $entityManager, AuthorizationCheckerInterface $authorizationChecker): Response
    {
        if (!BaseController::isAuthorized($authorizationChecker, 'ROLE_USER')) return BaseController::createResponse('Unauthorized', Response::HTTP_UNAUTHORIZED);

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
    public function loadProfilePicture(EntityManagerInterface $entityManager, AuthorizationCheckerInterface $authorizationChecker, ProfilePictureService $pictureService): Response
    {
        if (!BaseController::isAuthorized($authorizationChecker, 'ROLE_USER')) return BaseController::createResponse('Unauthorized', Response::HTTP_UNAUTHORIZED);

        if ($this->getUser()) {
            $user = $entityManager->getRepository(User::class)->find($this->getUser()->getId());
            $profilePicture = $user->getProfilePicture();
            if (!empty($profilePicture)) {
                $imageData = is_resource($profilePicture) ? stream_get_contents($profilePicture) : $profilePicture;
                return BaseController::createResponse('Profile picture loaded successfully.', Response::HTTP_OK, ['data:image/jpeg;base64, ' . $imageData,
                ]);
            } else {
                return BaseController::createResponse('No profile picture found, using default image.', Response::HTTP_OK, [
                    'data:image/jpeg;base64, ' . $pictureService->getDefaultProfilePictureBase64(),
                ]);
            }
        } else {
            return BaseController::createResponse('No user found.', Response::HTTP_UNAUTHORIZED);
        }
    }

    #[Route('/api/v1/user/changePassword', name: 'app_account_change_password')]
    public function changePassword(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $userPasswordHasher, AuthorizationCheckerInterface $authorizationChecker): Response
    {
        if (!BaseController::isAuthorized($authorizationChecker, 'ROLE_USER')) return BaseController::createResponse('Unauthorized', Response::HTTP_UNAUTHORIZED);

        if (!$request->request->has('currentPassword') || !$request->request->has('newPassword')) {
            return BaseController::createResponse('No current password provided.', Response::HTTP_BAD_REQUEST);
        }

        $user = $entityManager->getRepository(User::class)->find($this->getUser()->getId());
        $user->setPassword($userPasswordHasher->hashPassword($user, $request->request->get('newPassword')));

        $entityManager->persist($user);
        $entityManager->flush();

        return BaseController::createResponse('Password updated successfully.');

    }
}
