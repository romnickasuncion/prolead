<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

class Logs extends Authenticatable
{
    use HasApiTokens,Notifiable;

    use SoftDeletes;

    protected $table = 'logs';

    protected $fillable = [
        'lead_id',
        'assigned_personnel_id',
        'assigned_company_id',
        'activity',
        'created_at'
    ];

    public function lead(){
        return $this->belongsTo('App\Lead','lead_id','id');
    }    
}
