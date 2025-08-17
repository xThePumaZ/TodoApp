<?php

namespace App\Dto;

use App\Config\Status;

class TaskDto
{
    private string $description;
    private Status $status;
    private string $priority;
    private \DateTime|null $dueDate;
    private \DateTimeImmutable $createdAt;
    private \DateTime $updatedAt;

    private int $id;
    private string $title;

    public function getId(): int
    {
        return $this->id;
    }

    public function setId(int $id): void
    {
        $this->id = $id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): void
    {
        $this->title = $title;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    public function setDescription(string $description): void
    {
        $this->description = $description;
    }

    public function getStatus(): Status
    {
        return $this->status;
    }

    public function setStatus(Status $status): void
    {
        $this->status = $status;
    }

    public function getPriority(): string
    {
        return $this->priority;
    }

    public function setPriority(string $priority): void
    {
        $this->priority = $priority;
    }

    public function getCreatedAt(): \DateTimeImmutable
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeImmutable $createdAt): void
    {
        $this->createdAt = $createdAt;
    }

    public function getUpdatedAt(): \DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): void
    {
        $this->updatedAt = $updatedAt;
    }

    public function getDueDate(): \DateTime
    {
        return $this->dueDate;
    }

    public function setDueDate(\DateTime $dueDate): void
    {
        $this->dueDate = $dueDate;
    }

    /**
     * Task constructor.
     *
     * @param int $id
     * @param string $title
     * @param string $description
     * @param string $status
     * @param string $priority
     * @param \DateTime|null $dueDate
     * @param \DateTimeImmutable $createdAt
     * @param \DateTime $updatedAt
     */
    public function __construct(int $id, string $title, string $description, Status $status, string $priority, \DateTime|null $dueDate, \DateTimeImmutable $createdAt, \DateTime $updatedAt)
    {
        $this->id = $id;
        $this->title = $title;
        $this->description = $description;
        $this->status = $status;
        $this->priority = $priority;
        $this->dueDate = $dueDate;
        $this->createdAt = $createdAt;
        $this->updatedAt = $updatedAt;
    }



    // Getters and setters for each property can be added here

}
