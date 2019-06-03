<?php

namespace App\Http\Traits;

use App\Company;
use App\Role as RoleEloquent;

trait Role
{
    public function createsRoles()
    {
        $roles = [
            'master_admin',
            'company_admin',
            'company_user',
            'reseller_admin',
            'reseller_staff'
        ];

        foreach ($roles as $role) {
            factory(RoleEloquent::class)->states($role)->create();
        }
    }

    public function getRoleName($role_id,$company_id){
        $role = RoleEloquent::find($role_id)->name;

        /*if($role_id != 1){
            $parent_company_id = Company::find($company_id)->parent_company_id;
            if($parent_company_id != 0){
                $role = str_replace('Company', 'Retailer', $role);
            }
        }*/

        return $role;
    }
}