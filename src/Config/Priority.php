<?php

namespace App\Config;

enum Priority: string
{
    case LowPriority = 'Low';
    case MediumPriority = 'Medium';
    case HighPriority = 'High';
}
