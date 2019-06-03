<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class LeadActivity extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'               => (int) $this->id,
            'user_id'          => (int) $this->user_id,
            'lead_id'          => (int) $this->lead_id,
            'lead'             => $this->lead->company_name,
            'lead_activity_id' => (int) $this->lead_activity_id,
            'activity'         => $this->activity,
            'activity_date'    => $this->activity_date,
            'notes'            => $this->notes
        ];
    }
}
