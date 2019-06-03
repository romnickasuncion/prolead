<?php

namespace App\Http\Controllers;

use App\Http\Requests\User as UserRequest;
use App\Http\Resources\User as UserResource;
use App\User;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    protected $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function index(UserRequest $request)
    {
        $users = $this->user;

        if($request->has('company_id')){
            $users = $users->whereCompanyId($request->get('company_id'));
        }

        if($request->has('fetch') && $request->get('fetch') == 'all'){
            $users = $users->get();
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
        $inputs = $request->only([
            'name',
            'email',
            'company_id',
            'password'
        ]);

        $inputs['password'] = Hash::make($inputs['password']);

        $user = $this->user->create($inputs);

        return new UserResource($user);
    }

    public function update(UserRequest $request)
    {
        $user_id = $request->user_id;

        $inputs  = $request->only([
            'name',
            'email',
            'company_id'
        ]);

        if($request->has('password')){
            $inputs['password'] = Hash::make($request->get('password'));
        }

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
