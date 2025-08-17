<?php

declare(strict_types=1);

namespace App\Controller\Api\v1;

use App\Config\StatusMessages;
use App\Controller\BaseController;
use App\Dto\UserPasswordDto;
use App\Form\ChangePasswordFormType;
use App\Service\ProfilePictureService;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

/**
 * API Controller für User-Management
 */
class UserApiController extends BaseController
{
    private const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    /**
     * Ändert das Profilbild des Benutzers
     */
    #[Route('/api/v1/user/picture/change', name: 'app_account_change_picture', methods: ['POST'])]
    public function changePicture(Request $request, EntityManagerInterface $entityManager): Response
    {
        try {
            $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');
            $file = $request->files->get('profileImage');
            if (!$file) {
                return BaseController::createResponse(StatusMessages::ProfilePictureNotProvided, Response::HTTP_BAD_REQUEST);
            }

            $validationResult = $this->validateUploadedFile($file);
            if ($validationResult !== null) {
                return $validationResult;
            }

            $fileContent = $file->getContent();
            if ($fileContent === false) {
                return BaseController::createResponse(
                    StatusMessages::ProfilePictureFailedToLoad,
                    Response::HTTP_BAD_REQUEST
                );
            }

            $profilePicture = base64_encode($fileContent);
            $user = $this->getUser();
            $user->setProfilePicture($profilePicture);

            $entityManager->flush();

            return BaseController::createResponse(
                StatusMessages::ProfilePictureUpdated
            );

        } catch (Exception $e) {
            return BaseController::createResponse(
                StatusMessages::ProfilePictureChangeFailed,
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Lädt das Profilbild des Benutzers
     */
    #[Route('/api/v1/user/picture/load', name: 'app_account_load_profile_picture', methods: ['GET'])]
    public function loadProfilePicture(ProfilePictureService $pictureService): Response
    {
        try {
            $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

            $user = $this->getUser();
            $profilePicture = $user->getProfilePicture();

            if (!empty($profilePicture)) {
                $imageData = is_resource($profilePicture) ? stream_get_contents($profilePicture) : $profilePicture;
                return BaseController::createResponse(
                    StatusMessages::ProfilePictureLoaded,
                    Response::HTTP_OK,
                    ['image' => 'data:image/jpeg;base64,' . $imageData]
                );
            }

            return BaseController::createResponse(
                StatusMessages::ProfilePictureNotFound,
                Response::HTTP_OK,
                ['image' => 'data:image/jpeg;base64,' . $pictureService->getDefaultProfilePictureBase64()]
            );

        } catch (Exception $e) {
            return BaseController::createResponse(
                StatusMessages::ProfilePictureLoadFailed,
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Ändert das Passwort des Benutzers
     */
    #[Route('/api/v1/user/password/change', name: 'app_account_change_password', methods: ['PATCH'])]
    public function changePassword(
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $userPasswordHasher
    ): Response {
        try {
            $this->denyAccessUnlessGranted('IS_AUTHENTICATED_FULLY');

            $passwordDto = $this->mapPasswordDtoWithRequest($request);
            $user = $this->getUser();

            if (!$userPasswordHasher->isPasswordValid($user, $passwordDto->getCurrentPassword())) {
                return BaseController::createResponse(
                    StatusMessages::PasswordInvalid,
                    Response::HTTP_BAD_REQUEST
                );
            }

            $form = $this->createForm(ChangePasswordFormType::class, $passwordDto);
            $form->submit($request->getPayload()->all());

            if (!$form->isValid()) {
                return BaseController::createResponse(StatusMessages::InvalidInput, Response::HTTP_BAD_REQUEST);
            }

            $user->setPassword($userPasswordHasher->hashPassword($user, $passwordDto->getNewPassword()));
            $entityManager->flush();

            return BaseController::createResponse(StatusMessages::PasswordUpdated, Response::HTTP_OK);

        } catch (Exception $e) {
            return BaseController::createResponse(
                StatusMessages::PasswordUpdateFailed ?? 'Fehler beim Aktualisieren des Passworts',
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Validiert die hochgeladene Datei
     */
    private function validateUploadedFile(UploadedFile $file): ?Response
    {
        if (!$file->isValid()) {
            $error = $file->getErrorMessage();
            return BaseController::createResponse(
                'Fehler beim Datei-Upload: ' . $error,
                Response::HTTP_BAD_REQUEST
            );
        }

        if ($file->getSize() > self::MAX_FILE_SIZE) {
            return BaseController::createResponse(
                'Datei ist zu groß (max. 5MB)',
                Response::HTTP_BAD_REQUEST
            );
        }

        $mimeType = $file->getMimeType();
        if (!in_array($mimeType, self::ALLOWED_MIME_TYPES, true)) {
            return BaseController::createResponse(
                'Ungültiger Dateityp: ' . $mimeType . '. Nur JPEG, PNG, GIF und WebP sind erlaubt.',
                Response::HTTP_BAD_REQUEST
            );
        }

        return null;
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
