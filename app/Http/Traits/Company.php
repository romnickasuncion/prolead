<?php

namespace App\Http\Traits;

use App\Company as CompanyEloquent;

trait Company
{
    public function getCompanyName($company_id){
        if($company_id > 0){
            $company = CompanyEloquent::with('parent_company')->find($company_id);
            return $company->name . ($company->parent_company_id > 0 ? (' (' . $company->parent_company->name . ')') : '');
        }

        return null;
    }
}