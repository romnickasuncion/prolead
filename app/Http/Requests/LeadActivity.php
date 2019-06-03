<?php

namespace App\Http\Requests;

use Illuminate\Validation\Rule;
use Illuminate\Foundation\Http\FormRequest;

class LeadActivity extends FormRequest
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
            $rules      = [
                'activity'      => [
                    'required',
                    Rule::in(['Call','Meeting','Email','Send Proposal','Follow Up'])
                ],
                'activity_date' => 'required|date'
            ];
        }

        return $rules;
    }
}
