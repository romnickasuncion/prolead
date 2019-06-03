<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class Lead extends FormRequest
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
            $authenticated_user = auth()->user();
            if($authenticated_user->role_id == 1) {
                $company_id = (request()->get('assigned_company_id') != null) ? request()->get('assigned_company_id') : $this->route('assigned_company_id');
            } else {
                $company_id = $authenticated_user->company_id;
            }

            $rules      = [
                'company_name'          => 'required',
                'company_address'       => 'required',
                'company_phone'         => 'required',
                'company_email'         => 'required|email',
                'contact_name'          => 'required',
                'contact_phone'         => 'required',
                'contact_email'         => 'required|email',
                'assigned_company_id'   => 'exists:companies,id',
                'assigned_personnel_id' => [
                    Rule::exists('users','id')
                        ->where(function ($query) use($company_id){
                            $query->where('company_id',$company_id);
                        })
                ],
                'budget'                => 'integer|min:0|max:1',
                'authority'             => 'integer|min:0|max:1',
                'need'                  => 'integer|min:0|max:1',
                'timeframe'             => 'integer|min:0|max:1',
                'budget_amount'         => 'integer',
                'budget_closing_date'   => 'date',
                'timeframe_start_date'  => 'date',
                'timeframe_end_date'    => 'date',
                'status'                => 'required',
            ];

            if($authenticated_user->role_id == 5 && request()->has('staff_update')) {
                if(request()->get('staff_update') == 'info'){
                    unset(
                        $rules['budget'],
                        $rules['authority'],
                        $rules['need'],
                        $rules['timeframe'],
                        $rules['budget_amount'],
                        $rules['budget_closing_date'],
                        $rules['timeframe_start_date'],
                        $rules['timeframe_end_date']
                    );
                }

                if(request()->get('staff_update') == 'bant'){
                    unset(
                        $rules['company_name'],
                        $rules['company_address'],
                        $rules['company_phone'],
                        $rules['company_email'],
                        $rules['contact_name'],
                        $rules['contact_phone'],
                        $rules['contact_email'],
                        $rules['status']
                    );
                }
            }
        }

        return $rules;
    }
}
