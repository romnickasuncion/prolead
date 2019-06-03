<?php

namespace App\Http\Resources;

use App\Company;
use App\Http\Traits\Company as CompanyTrait;
use App\Http\Traits\Role as RoleTrait;
use Illuminate\Http\Resources\Json\JsonResource;

class User extends JsonResource
{
    use CompanyTrait,RoleTrait;

    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function toArray($request)
    {
        return [
            'id'         => (int) $this->id,
            'name'       => $this->name,
            'email'      => $this->email,
            'company_id' => (int) $this->company_id,
            'company'    => $this->getCompanyName($this->company_id),
            'role_id'    => (int) $this->role_id,
            'role'       => $this->getRoleName($this->role_id,$this->company_id)
        ];
    }
}
