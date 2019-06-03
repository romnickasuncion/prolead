<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends Model
{
    use SoftDeletes;

    protected $table = 'companies';

    protected $fillable = [
        'name',
        'address',
        'tax_number',
        'email',
        'phone',
        'parent_company_id'
    ];

    public function parent_company(){
        return $this->belongsTo('App\Company','parent_company_id','id');
    }
}
