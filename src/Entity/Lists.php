<?php

namespace App\Entity;

use App\Repository\ListsRepository;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ListsRepository::class)]
class Lists
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\OneToOne(mappedBy: 'list_id', cascade: ['persist', 'remove'])]
    private ?Task $task = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getTask(): ?Task
    {
        return $this->task;
    }

    public function setTask(?Task $task): static
    {
        // unset the owning side of the relation if necessary
        if ($task === null && $this->task !== null) {
            $this->task->setListId(null);
        }

        // set the owning side of the relation if necessary
        if ($task !== null && $task->getListId() !== $this) {
            $task->setListId($this);
        }

        $this->task = $task;

        return $this;
    }
}
