<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class Company extends JsonResource
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
            'id'                => (int) $this->id,
            'name'              => $this->name,
            'address'           => $this->address,
            'tax_number'        => $this->tax_number,
            'email'             => $this->email,
            'phone'             => $this->phone,
            'parent_company_id' => (int) $this->parent_company_id,
            'parent_company'    => $this->parent_company_id > 0 ? $this->parent_company->name : null
        ];
    }
}
