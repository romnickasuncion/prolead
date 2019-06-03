<?php

namespace App\Http\Controllers\Users\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lead as LeadRequest;
use App\Http\Resources\Lead as LeadResource;
use App\Lead;
use Carbon\Carbon;

class LeadsController extends Controller
{
    protected $lead;

    public function __construct(Lead $lead)
    {
        $this->lead = $lead;
    }

    public function index(LeadRequest $request)
    {
        $leads = $this->lead
                    ->with('company','personnel')
                    ->whereAssignedPersonnelId($request->user()->id)
                    ->whereStatus($request->get('status'))
                    ->orderBy('id', 'DESC')
                    ->paginate(15);

        return LeadResource::collection($leads);
    }
}