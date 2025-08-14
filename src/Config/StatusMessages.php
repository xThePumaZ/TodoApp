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
}
