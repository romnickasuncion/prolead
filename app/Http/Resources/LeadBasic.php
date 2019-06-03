<?php

namespace App\Http\Resources;

use App\Http\Traits\Company as CompanyTrait;
use App\Http\Traits\Personnel as PersonnelTrait;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class LeadBasic extends JsonResource
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
            'id'           => (int) $this->id,
            'company_name' => $this->company_name,
        ];
    }
}