<?php

declare(strict_types=1);

namespace App\Controller\Api\v1;

use App\Config\StatusMessages;
use App\Controller\BaseController;
use App\Dto\UserPasswordDto;
use App\Entity\User;
use App\Form\ChangePasswordFormType;
use App\Service\ProfilePictureService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 *
 */
class UserApiController extends BaseController
{
    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @return Response
     */
    #[Route('/api/v1/user/change_picture', name: 'app_account_change_picture')]
    public function changePicture(Request $request, EntityManagerInterface $entityManager): Response
    {
        if (!$request->files->has('profileImage')) {
            return BaseController::createResponse(StatusMessages::ProfilePictureNotProvided, Response::HTTP_BAD_REQUEST);
        }

        $profilePicture = base64_encode($request->files->get('profileImage')->getContent());
        $this->getUser()->setProfilePicture($profilePicture);
        $entityManager->flush();

        return BaseController::createResponse(StatusMessages::ProfilePictureUpdated);
    }

    /**
     * @param EntityManagerInterface $entityManager
     * @param ProfilePictureService $pictureService
     * @return Response
     */
    #[Route('/api/v1/user/loadProfilePicture', name: 'app_account_load_profile_picture')]
    public function loadProfilePicture(EntityManagerInterface $entityManager, ProfilePictureService $pictureService): Response
    {
        if ($this->getUser()) {
            $user = $entityManager->getRepository(User::class)->find($this->getUser()->getId());
            $profilePicture = $user->getProfilePicture();
            if (!empty($profilePicture)) {
                $imageData = is_resource($profilePicture) ? stream_get_contents($profilePicture) : $profilePicture;
                return BaseController::createResponse(StatusMessages::ProfilePictureLoaded, Response::HTTP_OK, ['data:image/jpeg;base64, ' . $imageData,
                ]);
            } else {
                return BaseController::createResponse(StatusMessages::ProfilePictureNotFound, Response::HTTP_OK, [
                    'data:image/jpeg;base64, ' . $pictureService->getDefaultProfilePictureBase64(),
                ]);
            }
        } else {
            return BaseController::createResponse(StatusMessages::UserNotFound, Response::HTTP_UNAUTHORIZED);
        }
    }

    /**
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param UserPasswordHasherInterface $userPasswordHasher
     * @return Response
     */
    #[Route('/api/v1/user/changePassword', name: 'app_account_change_password')]
    public function changePassword(Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $userPasswordHasher): Response
    {
        $passwordDto = $this->mapPasswordDtoWithRequest($request);

        $form = $this->createForm(ChangePasswordFormType::class, $passwordDto);
        $form->submit($request->getPayload()->all());

        if (!$form->isValid()) {
            return BaseController::createResponse(StatusMessages::TaskInvalidData, Response::HTTP_BAD_REQUEST);
        }

        if ($passwordDto->getNewPassword() !== $passwordDto->getConfirmPassword()) {
            return BaseController::createResponse(StatusMessages::PasswordMismatch, Response::HTTP_BAD_REQUEST);
        }

        $user = $entityManager->getRepository(User::class)->find($this->getUser()->getId());
        $user->setPassword($userPasswordHasher->hashPassword($user, $passwordDto->getNewPassword()));

        $entityManager->flush();
        return BaseController::createResponse(StatusMessages::PasswordUpdated);

    }

    private function mapPasswordDtoWithRequest(Request $request): UserPasswordDto
    {
        return new UserPasswordDto(
            $request->getPayload()->get('currentPassword', ''),
            $request->getPayload()->get('newPassword', ''),
            $request->getPayload()->get('confirmPassword', '')
        );
    }
}
