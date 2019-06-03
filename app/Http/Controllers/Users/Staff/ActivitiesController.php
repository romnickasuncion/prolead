<?php

namespace App\Http\Controllers\Users\Staff;

use App\Http\Controllers\Controller;
use App\Http\Requests\LeadActivity as LeadActivityRequest;
use App\Http\Resources\LeadActivity as LeadActivityResource;
use App\LeadActivity;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;

class ActivitiesController extends Controller
{
    protected $activities;

    public function __construct(LeadActivity $activities)
    {
        $this->activities = $activities;
    }

    public function index(LeadActivityRequest $request)
    {
        $activities = $this
                        ->activities
                        ->whereUserId($request->user()->id);

        if($request->has('retrieve')){
            $retrieve = $request->get('retrieve');
            $today = Carbon::now()->format('Y-m-d');

            if($retrieve == 'past'){
                $activities = $activities->where('activity_date' , '<', Carbon::parse("$today 00:00:00")->format('Y-m-d H:i:s'));
            }

            if($retrieve == 'today'){
                $activities = $activities->whereBetween('activity_date',[Carbon::parse("$today 00:00:00")->format('Y-m-d H:i:s'),Carbon::parse("$today 23:59:59")->format('Y-m-d H:i:s')]);
            }

            if($retrieve == 'future'){
                $activities = $activities->where('activity_date', '>', Carbon::parse("$today 23:59:59")->format('Y-m-d H:i:s'));
            }
        }

        return LeadActivityResource::collection($activities->orderBy('activity_date','DESC')->paginate(15));
    }
}