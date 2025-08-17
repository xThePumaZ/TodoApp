<?php

declare(strict_types=1);

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

class UserPasswordDto
{
    #[Assert\NotBlank(message: 'Das aktuelle Passwort darf nicht leer sein')]
    private string $currentPassword;

    #[Assert\NotBlank(message: 'Das neue Passwort darf nicht leer sein')]
    #[Assert\Length(
        min: 8,
        max: 255,
        minMessage: 'Das Passwort muss mindestens {{ limit }} Zeichen lang sein',
        maxMessage: 'Das Passwort darf maximal {{ limit }} Zeichen lang sein'
    )]
    #[Assert\Regex(
        pattern: '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/',
        message: 'Das Passwort muss mindestens einen Kleinbuchstaben, einen Großbuchstaben und eine Zahl enthalten'
    )]
    private string $newPassword;

    #[Assert\NotBlank(message: 'Die Passwort-Bestätigung darf nicht leer sein')]
    private string $confirmPassword;

    public function __construct(string $currentPassword, string $newPassword, string $confirmPassword)
    {
        $this->currentPassword = $currentPassword;
        $this->newPassword = $newPassword;
        $this->confirmPassword = $confirmPassword;
    }

    public function getCurrentPassword(): string
    {
        return $this->currentPassword;
    }

    public function setCurrentPassword(string $currentPassword): void
    {
        $this->currentPassword = $currentPassword;
    }

    public function getNewPassword(): string
    {
        return $this->newPassword;
    }

    public function setNewPassword(string $newPassword): void
    {
        $this->newPassword = $newPassword;
    }

    public function getConfirmPassword(): string
    {
        return $this->confirmPassword;
    }

    public function setConfirmPassword(string $confirmPassword): void
    {
        $this->confirmPassword = $confirmPassword;
    }
}
