<?php

namespace App\Config;

enum Priority: string
{
    case HighPriority = 'High Priority';
    case MediumPriority = 'Medium Priority';
    case LowPriority = 'Low Priority';
}
