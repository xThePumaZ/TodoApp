<?php

namespace App\Config;

enum StatusMessages: string
{
    case TaskNotFound = 'Task not found';
    case TaskCreated = 'Task created successfully';
    case TaskUpdated = 'Task updated successfully';
    case TaskStatusNotChanged = 'Task status not changed';
    case TaskDeleted = 'Task deleted successfully';

    case TaskCreateFailed = 'Failed to create task';

    case TaskInvalidStatus = 'Invalid task status';
    case TaskInvalidData = 'Invalid task data provided';
    case UserNotFound = 'User not found';
    case NotFound = 'Resource not found';
    case InvalidInput = 'Invalid input provided';
    case Unauthorized = 'Unauthorized';
    case Forbidden = 'Forbidden action';
    case InternalServerError = 'Internal server error';
    case BadRequest = 'Bad request';
    case Conflict = 'Conflict detected';
    case UnprocessableEntity = 'Unprocessable entity';

    case PasswordUpdated = 'Password updated successfully';

    case ProfilePictureUpdated = 'Profile picture updated successfully';
    case ProfilePictureNotFound = 'Profile picture not found';
    case ProfilePictureDefault = 'Using default profile picture';
    case ProfilePictureLoaded = 'Profile picture loaded successfully';
    case ProfilePictureChangeFailed = 'Failed to change profile picture';
    case ProfilePictureLoadFailed = 'Failed to load profile picture';
    case ProfilePictureInvalidFormat = 'Invalid profile picture format';
    case ProfilePictureNotProvided = 'No profile picture provided';

    case PasswordMismatch = 'Passwords do not match';
}
