<?php

namespace App\Http\Controllers\Users;

use App\User;
use App\Http\Controllers\Controller;
use App\Http\Resources\User as UserResource;
use App\Http\Requests\User as UserRequest;
use Illuminate\Http\Request;

class MassAssignmentController extends Controller
{
    protected $user;

    public function __construct(user $user)
    {
        $this->user = $user;
    }

	public function destroy(Request $request) 
	{
		$this
            ->user
            ->whereIn('id', $request->ids)
            ->delete();

        return response()->json([
            'message' => 'Records has been deleted.'
        ]);
	}
}