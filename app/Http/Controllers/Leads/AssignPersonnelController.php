<?php

namespace App\Http\Controllers\Leads;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadAssignPersonnel as LeadAssignPersonnelRequest;
use App\Lead;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AssignPersonnelController extends Controller
{
    protected $lead;

    public function __construct(Lead $lead)
    {
        $this->lead = $lead;
    }

    public function update(LeadAssignPersonnelRequest $request)
    {
        $this
            ->lead
            ->whereId($request->lead_id)
            ->update($request->only('assigned_personnel_id'));

        return response()->json([
            'message' => 'Successfully assigned to personnel!'
        ]);
    }
}