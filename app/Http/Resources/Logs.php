<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Traits\Company as CompanyTrait;
use App\Http\Traits\Personnel as PersonnelTrait;
use Carbon\Carbon;

class Logs extends JsonResource
{
    use CompanyTrait,PersonnelTrait;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'                            => (int) $this->id,
            'lead_id'                       => $this->lead->company_name,
            'assigned_personnel_id'         => $this->getPersonnelName(($this->assigned_personnel_id > 0 ? $this->assigned_personnel_id : 0)),
            'assigned_company_id'           => $this->getCompanyName(($this->assigned_company_id > 0 ? $this->assigned_company_id : 0)),
            'activity'                      => $this->activity,
            'created_at'                    => !is_null($this->created_at) ? Carbon::parse($this->created_at)->format('Y-m-d H:i:s') : null
        ];
    }
}
