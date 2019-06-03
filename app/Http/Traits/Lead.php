<?php

namespace App\Http\Traits;

use App\Lead as LeadEloquent;

trait Lead
{
    public function getCurrentActivityCounter($lead_id)
    {
        LeadEloquent::whereId($lead_id)->increment('activitiy_count');
        return LeadEloquent::find($lead_id)->activitiy_count;
    }
}