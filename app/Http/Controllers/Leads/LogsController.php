<?php

namespace App\Http\Controllers\Leads;

use App\Lead;
use App\Logs;
use App\Http\Controllers\Controller;
use App\Http\Resources\Logs as LogsResource;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LogsController extends Controller
{

    protected $log;

    protected $lead;

    public function __construct(Logs $log, Lead $lead)
    {

        $this->log = $log;

        $this->lead = $lead;

    }

    public function index(Request $request)
    {
        $logs = $this
                ->log
                ->orderBy('id', 'DESC')               
                ->paginate(15);

        return LogsResource::collection($logs);
    }    
}
