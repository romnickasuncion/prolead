<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens,Notifiable;

    use SoftDeletes;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'role_id',
        'company_id',
        'password'
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    public function company(){
        return $this->belongsTo('App\Company','company_id','id');
    }
}
