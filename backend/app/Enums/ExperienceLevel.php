<?php

namespace App\Enums;

enum ExperienceLevel: string
{
    case LessThanOneYear = 'less_than_1';
    case OneToThreeYears = '1_3';
    case FourToFiveYears = '4_5';
    case SixToTenYears = '6_10';
    case MoreThanTenYears = 'more_than_10';
}
