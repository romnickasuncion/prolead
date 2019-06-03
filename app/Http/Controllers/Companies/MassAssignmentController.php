<?php

namespace App\Http\Controllers\Companies;

use App\Company;
use App\Http\Controllers\Controller;
use App\Http\Resources\Company as CompanyResource;
use App\Http\Requests\Company as CompanyRequest;
use Illuminate\Http\Request;

class MassAssignmentController extends Controller
{
    protected $company;

    public function __construct(Company $company)
    {
        $this->company = $company;
    }

	public function destroy(Request $request) 
	{
		$this
            ->company
            ->whereIn('id', $request->ids)
            ->delete();

        return response()->json([
            'message' => 'Records has been deleted.'
        ]);
	}
}