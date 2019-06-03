<?php

namespace App\Http\Controllers\Leads;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadActivity as LeadActivityRequest;
use App\Http\Resources\LeadActivity as LeadActivityResource;
use App\Http\Traits\Lead as LeadTrait;
use App\Lead;
use Carbon\Carbon;

class ActivityController extends Controller
{
    use LeadTrait;

    protected $lead;

    public function __construct(Lead $lead)
    {
        $this->lead = $lead;
    }

    public function index(LeadActivityRequest $request)
    {
        $activities = $this->lead
                        ->find($request->lead_id)
                        ->activities()
                        ->paginate(15);

        return LeadActivityResource::collection($activities);
    }

    public function show(LeadActivityRequest $request)
    {
        $activity = $this->lead
                        ->find($request->lead_id)
                        ->activities()
                        ->whereLeadActivityId($request->lead_activity_id)
                        ->first();

        return new LeadActivityResource($activity);
    }

    public function store(LeadActivityRequest $request)
    {
        $lead_id = $request->lead_id;
        $inputs  = array_merge(
            $request->only([
                'activity',
                'activity_date',
                'notes'
            ]),
            [
                'lead_id' => $lead_id,
                'user_id' => $request->user()->id
            ]
        );

        $inputs['lead_activity_id'] = $this->getCurrentActivityCounter($lead_id);

        $activity = $this->lead
                        ->find($lead_id)
                        ->activities()
                        ->create($inputs);

        return new LeadActivityResource($activity);
    }

    public function update(LeadActivityRequest $request)
    {
        $lead_id          = $request->lead_id;
        $lead_activity_id = $request->lead_activity_id;
        $inputs           = $request->only([
                                'activity',
                                'activity_date',
                                'notes'
                            ]);

        $this->lead
            ->find($lead_id)
            ->activities()
            ->whereLeadActivityId($lead_activity_id)
            ->update($inputs);

        $activity = $this->lead
                        ->find($lead_id)
                        ->activities()
                        ->whereLeadActivityId($request->lead_activity_id)
                        ->first();

        return new LeadActivityResource($activity);
    }

    public function destroy(LeadActivityRequest $request)
    {
        $this->lead
            ->find($request->lead_id)
            ->activities()
            ->whereLeadActivityId($request->lead_activity_id)
            ->delete();

        return response()->json(['message' => 'Record has been deleted.']);
    }
}