<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class User extends FormRequest
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
                'name'     => 'required',
                'email'    => 'required|email|unique:users,email',
                'role_id'  => 'required|exists:roles,id',
                'password' => 'required|confirmed'
            ];

            $role_id = request()->has('role_id') ? request()->get('role_id') : request()->role_id;

            if($role_id != 1){
                $rules['company_id'] = 'required|exists:companies,id';
            }
        }

        if(request()->isMethod('PATCH'))
        {
            $user_id = request()->has('user_id') ? request()->get('user_id') : request()->user_id;
            $rules['email'] .= ",$user_id";
            $rules['password'] = 'confirmed';
        }

        return $rules;
    }
}
