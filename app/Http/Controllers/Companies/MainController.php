<?php

namespace App\Http\Controllers\Companies;

use App\Company;
use App\Http\Controllers\Controller;
use App\Http\Requests\Company as CompanyRequest;
use App\Http\Resources\Company as CompanyResource;
use App\Http\Resources\CompanyBasic as CompanyBasicResource;
use Illuminate\Http\Request;

class MainController extends Controller
{
    protected $company;

    public function __construct(Company $company)
    {
        $this->company = $company;
    }

    public function index(CompanyRequest $request)
    {
        $logged_user = $request->user();

        $companies = $this->company->with('parent_company');

        if($request->has('fetch')){
            if($request->get('fetch') == 'all'){
                $companies = $companies;
            }

            if($request->get('fetch') == 'parent_only'){
                $companies = $companies->whereParentCompanyId(0);
            }

            if($request->get('fetch') == 'child_only'){
                if($request->has('company_id')){
                    $companies = $companies->whereParentCompanyId($request->get('company_id'));
                } else {
                    $companies = $companies->where('parent_company_id','!=',0);
                }

                if($logged_user->role_id == 2 || $logged_user->role_id == 3){
                    $companies = $companies->whereParentCompanyId($logged_user->company_id);
                }
            }
        } else {
            $companies = $companies->orderBy('id','DESC');
        }

        if($request->has('page')){
            $companies = $companies->paginate(15);
            return CompanyResource::collection($companies);
        } else {
            $companies = $companies->get();
            return CompanyBasicResource::collection($companies);
        }
    }

    public function show(CompanyRequest $request)
    {
        $company = $this->company->with('parent_company')->find($request->company_id);

        return new CompanyResource($company);
    }

    public function store(CompanyRequest $request)
    {
        $company = $this->company->create($request->only([
            'name',
            'address',
            'tax_number',
            'email',
            'phone',
            'parent_company_id'
        ]));

        return new CompanyResource($company);
    }

    public function update(CompanyRequest $request)
    {
        $company_id = $request->company_id;
        $this
            ->company
            ->whereId($company_id)
            ->update($request->only([
                'name',
                'address',
                'tax_number',
                'email',
                'phone',
                'parent_company_id'
            ]));
        $company = $this->company->find($company_id);

        return new CompanyResource($company);
    }

    public function destroy(CompanyRequest $request)
    {
        $exist = $this
                    ->company
                    ->whereId($request->company_id)
                    ->onlyTrashed()
                    ->count();
        if($exist) {
            return response()->json([
                'message' => 'Record already deleted.'
            ]);
        }

        $this
            ->company
            ->whereId($request->company_id)
            ->delete();

        return response()->json([
            'message' => 'Record has been deleted.'
        ]);
    }
}
