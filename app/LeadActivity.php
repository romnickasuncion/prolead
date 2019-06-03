<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class LeadActivity extends Model
{
    use SoftDeletes;

    protected $table = 'activities';

    protected $fillable = [
        'user_id',
        'lead_id',
        'lead_activity_id',
        'activity',
        'activity_date',
        'notes'
    ];

    public function lead(){
        return $this->belongsTo('App\Lead','lead_id','id');
    }
}
