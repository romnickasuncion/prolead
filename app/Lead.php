<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Lead extends Model
{
    use SoftDeletes;

    protected $table = 'leads';

    protected $fillable = [
        'company_name',
        'company_address',
        'company_phone',
        'company_email',
        'contact_name',
        'contact_phone',
        'contact_email',
        'note',
        'assigned_company_id',
        'assigned_personnel_id',
        'budget',
        'budget_amount',
        'budget_closing_date',
        'authority',
        'authority_name',
        'authority_title',
        'need',
        'need_urgency',
        'need_reason',
        'timeframe',
        'timeframe_start_date',
        'timeframe_duration',
        'timeframe_end_date',
        'timeframe_reason',
        'bant_value',
        'company_assigned_date',
        'activitiy_count',
        'status'
    ];

    public function company(){
        return $this->belongsTo('App\Company','assigned_company_id','id');
    }

    public function personnel(){
        return $this->belongsTo('App\User','assigned_personnel_id','id');
    }

    public function activities(){
        return $this->hasMany('App\LeadActivity', 'lead_id', 'id');
    }
}
