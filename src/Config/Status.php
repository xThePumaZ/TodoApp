<?php

namespace App\Config;

enum Status: int
{
    case Open = 0;
    case InProgress = 1;
    case Done = 2;
    case Overdue = 3;


}
