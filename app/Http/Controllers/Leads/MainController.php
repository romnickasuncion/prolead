<?php

namespace App\Http\Controllers\Leads;

use App\Company;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lead as LeadRequest;
use App\Http\Resources\Lead as LeadResource;
use App\Http\Resources\LeadBasic as LeadBasicResource;
use App\Http\Traits\BantValue;
use App\Lead;
use App\Logs;
use Carbon\Carbon;

class MainController extends Controller
{
    use BantValue;

    protected $company;

    protected $lead;

    protected $logs;

    public function __construct(Lead $lead, Company $company, Logs $logs)
    {
        $this->company = $company;

        $this->lead = $lead;

        $this->logs = $logs;
    }

    public function index(LeadRequest $request)
    {
        $logged_user = $request->user();

        $leads = $this->lead->with('company','personnel');

        if($logged_user->role_id != 1)
        {
            $company_id = $logged_user->company_id;

            if($logged_user->role_id == 2 || $logged_user->role_id == 3){
                $companies_ids = [$company_id];
                $reseller_ids = $this
                                    ->company
                                    ->whereParentCompanyId($company_id)
                                    ->pluck('id')
                                    ->toArray();
                if(!empty($reseller_ids))
                {
                    $companies_ids = array_merge($companies_ids,$reseller_ids);
                }

                $leads = $leads->whereIn('assigned_company_id',$companies_ids);
            } else if($logged_user->role_id == 4){
                $leads = $leads->whereAssignedCompanyId($company_id);
            } else {
                $leads = $leads->whereAssignedPersonnelId($logged_user->id);
            }
        }

        if($request->has('lead')){
            if($request->get('lead') == 'unassigned'){
                if($logged_user->role_id == 2 || $logged_user->role_id == 3){
                    $leads = $leads->whereBantValue(0);
                } else {
                    $leads = $leads->whereNull('company_assigned_date');
                }
            }

            if($request->get('lead') == 'assigned'){
                $leads = $leads->whereNotNull('company_assigned_date');
            }
        }

        if($request->has('retrieve')){
            if($logged_user->role_id == 1 && $request->get('retrieve') == 'pending_bant'){
                $leads = $leads->whereBantValue(0);
            }

            if($logged_user->role_id == 1 && $request->get('retrieve') == 'pending_assignment'){
                $leads = $leads->whereAssignedCompanyId(0);
            }

            if($request->get('retrieve') == 'latest_assigned'){
                $today        = Carbon::now()->format('Y-m-d');
                $start_of_day = "$today 00:00:00";
                $end_of_day   = "$today 23:59:59";
                $leads        = $leads->whereBetween('company_assigned_date',[$start_of_day,$end_of_day]);
            }

            if($request->get('retrieve') == 'assigned_leads'){
                $leads = $leads->where('assigned_personnel_id','!=',0);
            }

            if($request->get('retrieve') == 'unassigned_leads'){
                $leads = $leads->where('assigned_personnel_id','=',0);
            }
        }

        if($request->has('stage')){
            $leads = $leads->whereStatus($request->get('stage'));
        }

        $leads = $leads->orderBy('id', 'DESC');

        if($request->has('return') && $request->get('return') == 'basic'){
            return LeadBasicResource::collection($leads->get());
        }

        return LeadResource::collection($leads->paginate(15));
    }

    public function show(LeadRequest $request)
    {
        $lead = $this->lead->with('company','personnel','activities')->find($request->lead_id);

        return new LeadResource($lead);
    }

    public function store(LeadRequest $request)
    {
        $inputs = $request->only([
            'company_name',
            'company_address',
            'company_phone',
            'company_email',
            'contact_name',
            'contact_phone',
            'contact_email',
            'budget',
            'authority',
            'need',
            'timeframe',
            'assigned_company_id',
            'assigned_personnel_id',
            'note',
            'budget_amount',
            'budget_closing_date',
            'authority_name',
            'authority_title',
            'need_urgency',
            'need_reason',
            'timeframe_start_date',
            'timeframe_duration',
            'timeframe_end_date',
            'timeframe_reason',
            'bant_value',
            'status'
        ]);

        $authenticated_user = auth()->user();
        if($authenticated_user->role_id != 1){
            $inputs['assigned_company_id'] = $authenticated_user->company_id;
        }

        if(!isset($inputs['assigned_company_id'])) {
            $inputs['assigned_company_id'] = 0;
        }

        if($authenticated_user->role_id == 4 || $authenticated_user->role_id == 5){
            $inputs['assigned_personnel_id'] = $authenticated_user->id;
        }

        if(!isset($inputs['assigned_personnel_id'])){
            $inputs['assigned_personnel_id'] = 0;
        }

        if(!empty($inputs['assigned_company_id'])){
            $inputs['company_assigned_date'] = Carbon::now();
        }

        /*$inputs['bant_value'] = 0;

        if(isset($inputs['budget']) && $inputs['authority'] && $inputs['need'] && $inputs['timeframe']){
            $inputs['bant_value'] = $this->calculateBantValue($inputs['budget'],$inputs['authority'],$inputs['need'],$inputs['timeframe']);
        }*/

        $lead = $this->lead->create($inputs);

        $logs['lead_id'] = $lead->id;
        $logs['assigned_company_id'] = $inputs['assigned_company_id'];
        $logs['assigned_personnel_id'] = $inputs['assigned_personnel_id'];
        $logs['activity'] = 'Added new Lead - ' .$inputs['company_name'];

        $this->logs->create($logs);

        return new LeadResource($lead);
    }

    public function update(LeadRequest $request)
    {
        $lead_id = $request->lead_id;

        $inputs = $request->only([
            'company_name',
            'company_address',
            'company_phone',
            'company_email',
            'contact_name',
            'contact_phone',
            'contact_email',
            'budget',
            'authority',
            'need',
            'timeframe',
            'assigned_company_id',
            'assigned_personnel_id',
            'note',
            'budget_amount',
            'budget_closing_date',
            'authority_name',
            'authority_title',
            'need_urgency',
            'need_reason',
            'timeframe_start_date',
            'timeframe_duration',
            'timeframe_end_date',
            'timeframe_reason',
            'bant_value',
            'status'
        ]);

/*        if(!empty($inputs['assigned_company_id'])){
            $inputs['company_assigned_date'] = Carbon::now();
        }*/

        /*$inputs['bant_value'] = 0;

        if(isset($inputs['budget']) && $inputs['authority'] && $inputs['need'] && $inputs['timeframe']){
            $inputs['bant_value'] = $this->calculateBantValue($inputs['budget'],$inputs['authority'],$inputs['need'],$inputs['timeframe']);
        }*/

        $lead = $this->lead->find($lead_id);

        $resultArray = json_decode(json_encode($lead), true);
        $diff = array_diff($inputs, $resultArray);

        foreach($diff as $i => $v)
        {
            $field = $i;

        }

        if ($field == 'status') {
            $logs['activity'] = 'Changed Lead Stage from ' .$lead['status']. ' to ' .$v;
        } else if ($field == 'bant_value') {
            $logs['activity'] = 'Edited BANT - ' .str_replace("_", " ", ucwords($field));            
        } else if ($field == 'budget_amount' || $field == 'budget_closing_date' || $field == 'authority_name' || $field == 'authority_title' || $field == 'need_urgency' || $field == 'authority_reason' || $field == 'timeframe_start_date' || $field == 'timeframe_end_date' || $field == 'timeframe_duration' || $field == 'timeframe_reason') {
            $logs['activity'] = 'Edited BANT - ' .str_replace("_", " ", ucwords($field));
        } else {        
            $logs['activity'] = 'Edited Lead Information - ' .str_replace("_", " ", ucwords($field));        
        }

        $logs['lead_id'] = $lead->id;
        $logs['assigned_company_id'] = $inputs['assigned_company_id'];
        $logs['assigned_personnel_id'] = $inputs['assigned_personnel_id'];
        //$logs['old_data'] = json_encode($lead);
        //$logs['activity'] = 'Updated ' .json_encode($diff);

        $this
            ->logs
            ->create($logs);
        $this
            ->lead
            ->whereId($lead_id)
            ->update($inputs);

        $lead = $this->lead->find($lead_id);

        return new LeadResource($lead);
    }

    public function destroy(LeadRequest $request)
    {
        $lead_id = $request->lead_id;
        $exist   = $this
                    ->lead
                    ->whereId($lead_id)
                    ->onlyTrashed()
                    ->count();
        if($exist) {
            return response()->json([
                'message' => 'Record already deleted.'
            ]);
        }

        $this
            ->lead
            ->whereId($lead_id)
            ->delete();

        return response()->json([
            'message' => 'Record has been deleted.'
        ]);
    }
}