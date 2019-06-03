<?php

namespace App\Http\Controllers\Users;

use App\Company;
use App\Http\Controllers\Controller;
use App\Http\Requests\User as UserRequest;
use App\Http\Resources\User as UserResource;
use App\User;
use Illuminate\Support\Facades\Hash;

class MainController extends Controller
{
    protected $company;

    protected $user;

    public function __construct(User $user, Company $company)
    {
        $this->company = $company;

        $this->user = $user;
    }

    public function index(UserRequest $request)
    {
        $logged_user = $request->user();

        $users = $this->user;

        if($request->has('company_id')){
            if($logged_user->role_id == 2 || $logged_user->role_id == 3){
                $companies_ids = [$logged_user->company_id];
                if($logged_user->role_id == 2 || $logged_user->role_id == 3){
                    $reseller_ids = $this
                                        ->company
                                        ->whereParentCompanyId($logged_user->company_id)
                                        ->pluck('id')
                                        ->toArray();
                    if(!empty($reseller_ids))
                    {
                        $companies_ids = array_merge($companies_ids,$reseller_ids);
                    }
                }
                $users = $users->whereIn('company_id',$companies_ids);
            } else {
                $users = $users->whereCompanyId($request->get('company_id'));
            }
        }

        if($request->has('fetch') && $request->get('fetch') == 'all'){
            $users = $users->whereIn('role_id',[4,5])->get();
        } else {
            $users = $users->orderBy('id','DESC')->paginate(15);
        }

        return UserResource::collection($users);
    }

    public function show(UserRequest $request)
    {
        $user = $this->user->find($request->user_id);

        return new UserResource($user);
    }

    public function store(UserRequest $request)
    {
        $inputs               = $request->only([
                                    'name',
                                    'email',
                                    'role_id',
                                    'company_id',
                                    'password'
                                ]);
        $inputs['password']   = Hash::make($inputs['password']);
        $inputs['company_id'] = $inputs['role_id'] == 1 ? 0 : $inputs['company_id'];

        $user = $this->user->create($inputs);

        return new UserResource($user);
    }

    public function update(UserRequest $request)
    {
        $inputs               = $request->only([
                                    'name',
                                    'email',
                                    'role_id',
                                    'company_id'
                                ]);
        $inputs['company_id'] = $inputs['role_id'] == 1 ? 0 : $inputs['company_id'];

        if($request->has('password')){
            $inputs['password'] = Hash::make($request->get('password'));
        }

        $user_id = $request->user_id;

        $this
            ->user
            ->whereId($user_id)
            ->update($inputs);

        $user = $this->user->find($user_id);

        return new UserResource($user);
    }

    public function destroy(UserRequest $request)
    {
        $exist = $this
                    ->user
                    ->whereId($request->user_id)
                    ->onlyTrashed()
                    ->count();
        if($exist) {
            return response()->json([
                'message' => 'Record already deleted.'
            ]);
        }

        $this
            ->user
            ->whereId($request->user_id)
            ->delete();

        return response()->json([
            'message' => 'Record has been deleted.'
        ]);
    }
}
