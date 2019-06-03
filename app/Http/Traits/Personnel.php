<?php

namespace App\Http\Traits;

use App\User;

trait Personnel
{
    public function getPersonnelName($personnel_id){
        if($personnel_id > 0){
            return User::find($personnel_id)->name;
        }

        return null;
    }
}