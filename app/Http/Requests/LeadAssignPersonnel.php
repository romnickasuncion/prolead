<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class LeadAssignPersonnel extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array
     */
    public function rules()
    {
        $rules = [];

        if(request()->isMethod('POST') || request()->isMethod('PATCH')){
            $company_id = (request()->get('assigned_company_id') != null) ? request()->get('assigned_company_id') : $this->route('assigned_company_id');

            $rules = [
                'assigned_company_id'   => 'exists:companies,id',
                'assigned_personnel_id' => [
                    'required_with:assigned_company_id',
                    Rule::exists('users','id')
                        ->where(function ($query) use($company_id){
                            $query->where('company_id',$company_id);
                        })
                ]
            ];
        }

        return $rules;
    }
}
