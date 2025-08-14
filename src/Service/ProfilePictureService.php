<?php

namespace App\Service;

use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class ProfilePictureService
{
    private string $projectDir;
    private string $defaultImagePath;

    public function __construct(ParameterBagInterface $parameterBag)
    {
        $this->projectDir = $parameterBag->get('kernel.project_dir');
        $this->defaultImagePath = $this->projectDir . '/public/build/images/default-avatar.png';
    }

    public function getDefaultProfilePictureBase64(): ?string
    {
        if (file_exists($this->defaultImagePath)) {
            $content = file_get_contents($this->defaultImagePath);
            if ($content !== false) {
                return base64_encode($content);
            }
        }

        // Fallback: generate a simple 1x1 transparent PNG
        return base64_encode($this->generateTransparentPixel());
    }

    private function generateTransparentPixel(): string
    {
        // A minimal 1x1 transparent PNG (43 bytes)
        return base64_decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77yQAAAABJRU5ErkJggg==');
    }

    public function isDefaultImageAvailable(): bool
    {
        return file_exists($this->defaultImagePath);
    }
}
