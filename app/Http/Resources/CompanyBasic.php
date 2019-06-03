<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CompanyBasic extends JsonResource
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
            'id'   => (int) $this->id,
            'name' => $this->name . ($this->parent_company_id > 0 ? (' (' . $this->parent_company->name . ')') : null)
        ];
    }
}
