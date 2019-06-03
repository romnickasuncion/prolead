<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class Company extends FormRequest
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
            $rules = [
                'name'       => 'required',
                'address'    => 'required',
                'tax_number' => 'required',
                'email'      => 'required|email|unique:companies,email',
                'phone'      => 'required'
            ];
        }

        if(request()->isMethod('PATCH'))
        {
            $company_id = request()->has('company_id') ? request()->get('company_id') : request()->company_id;
            $rules['email'] .= ",$company_id"; 
        }

        return $rules;
    }
}
