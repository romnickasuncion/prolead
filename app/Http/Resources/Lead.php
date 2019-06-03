<?php

namespace App\Http\Resources;

use App\Http\Traits\Company as CompanyTrait;
use App\Http\Traits\Personnel as PersonnelTrait;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class Lead extends JsonResource
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
            'id'                    => (int) $this->id,
            'company_name'          => $this->company_name,
            'company_address'       => $this->company_address,
            'company_phone'         => $this->company_phone,
            'company_email'         => $this->company_email,
            'contact_name'          => $this->contact_name,
            'contact_phone'         => $this->contact_phone,
            'contact_email'         => $this->contact_email,
            'budget'                => (int) $this->budget,
            'authority'             => (int) $this->authority,
            'need'                  => (int) $this->need,
            'timeframe'             => (int) $this->timeframe,
            'bant_value'            => (float) $this->bant_value,
            'assigned_company_id'   => (int) $this->assigned_company_id,
            'company_assigned_date' => !is_null($this->company_assigned_date) ? Carbon::parse($this->company_assigned_date)->format('Y-m-d') : null,
            'assigned_personnel_id' => (int) $this->assigned_personnel_id,
            'note'                  => $this->note,
            'assigned_company'      => $this->getCompanyName(($this->assigned_company_id > 0 ? $this->assigned_company_id : 0)),
            'assigned_personnel'    => $this->getPersonnelName(($this->assigned_personnel_id > 0 ? $this->assigned_personnel_id : 0)),
            'budget_amount'         => !is_null($this->budget_amount) ? (int) $this->budget_amount : null,
            'budget_closing_date'   => !is_null($this->budget_closing_date) ? Carbon::parse($this->budget_closing_date)->format('Y-m-d') : null,
            'authority_name'        => $this->authority_name,
            'authority_title'       => $this->authority_title,
            'need_urgency'          => $this->need_urgency,
            'need_reason'           => $this->need_reason,
            'timeframe_start_date'  => !is_null($this->timeframe_start_date) ? Carbon::parse($this->timeframe_start_date)->format('Y-m-d') : null,
            'timeframe_end_date'    => !is_null($this->timeframe_end_date) ? Carbon::parse($this->timeframe_end_date)->format('Y-m-d') : null,
            'timeframe_reason'      => $this->timeframe_reason,
            'company'               => new Company($this->whenLoaded('company')),
            'status'                => $this->status           
        ];
    }
}
