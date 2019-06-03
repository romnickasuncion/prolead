<?php

namespace App\Http\Controllers\Leads;

use App\Http\Controllers\Controller;
use App\Http\Requests\MassUpdateLead as MassUpdateLeadRequest;
use App\Http\Traits\BantValue;
use App\Lead;
use Carbon\Carbon;
use Illuminate\Http\Request;

class MassAssignmentController extends Controller
{
    use BantValue;

    protected $lead;

    public function __construct(Lead $lead)
    {
        $this->lead = $lead;
    }

    public function update(MassUpdateLeadRequest $request)
    {
        /*$budget    = $request->has('budget') ? $request->get('budget') : 0;
        $authority = $request->has('authority') ? $request->get('authority') : 0;
        $need      = $request->has('need') ? $request->get('need') : 0;
        $timeframe = $request->has('timeframe') ? $request->get('timeframe') : 0;*/
        $inputs    = [
/*            'budget'     => $budget,
            'authority'  => $authority,
            'need'       => $need,
            'timeframe'  => $timeframe,
            'bant_value' => $this->calculateBantValue($budget,$authority,$need,$timeframe)*/
        ];

        if($request->has('assigned_company_id'))
        {
            $inputs['assigned_company_id'] = $request->get('assigned_company_id');

            $inputs['company_assigned_date'] = Carbon::now();

            if(!$request->has('assigned_personnel_id'))
            {
                $inputs['assigned_personnel_id'] = 0;
            }
        }

        if($request->has('assigned_personnel_id'))
        {
            $inputs['assigned_personnel_id'] = $request->get('assigned_personnel_id');
        }

        if($request->has('note'))
        {
            $inputs['note'] = $request->get('note');
        }

        $this
            ->lead
            ->whereIn('id',$request->ids)
            ->update($inputs);

        return response()->json([
            'message' => 'Records has been updated.'
        ]);
    }

    public function destroy(Request $request)
    {
        $this->lead->whereIn('id', $request->ids)->delete();

        return response()->json([
            'message' => 'Records has been deleted.'
        ]);
    }
}