<?php

namespace App\Http\Traits;

trait BantValue
{
    public function calculateBantValue($budget, $authority, $need, $timeframe)
    {
        return ($budget + $authority + $need + $timeframe)/4;
    }
}