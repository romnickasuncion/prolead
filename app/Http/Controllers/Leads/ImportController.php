<?php

namespace App\Http\Controllers\Leads;

use App\Http\Controllers\Controller;
use App\Lead;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Excel;
use Carbon\Carbon;

class ImportController extends Controller
{
    protected $lead;

    public function __construct(Lead $lead)
    {
        $this->lead = $lead;
    }

    public function index(Request $request)
    {
        $request->validate([
            'importFile' => 'required'
        ]);
        
        $path = $request->file('importFile')->getPathname();
        $data = Excel::load($path)->first();

        if($data->count()){
            foreach ($data as $key => $lead) {
                $leads[] = [
                    'company_name'    => $lead->company_name, 
                    'company_address' => $lead->company_address,
                    'company_phone'   => $lead->company_phone,
                    'company_email'   => $lead->company_email,
                    'contact_name'    => $lead->contact_name,
                    'contact_phone'   => $lead->contact_phone,
                    'contact_email'   => $lead->contact_email                    
                ];
            }
        }
        return response()->json(['data' => $leads]);
    } 

    public function store(Request $request)
    {
        $leads = $request->leads;
            foreach ($leads as $key => $lead) {
                $leads[$key] = array_merge(
                    $lead,
                    [    
                        'assigned_company_id'   => 0,
                        'assigned_personnel_id' => 0,
                        'updated_at'            => Carbon::now(),
                        'created_at'            => Carbon::now()
                    ]
                );
            }

        $this->lead->insert($leads);
        return response()->json([
            'message' => 'Leads successfully uploaded!'
        ]);
    }

    public function destroy(Request $request)
    {
        $lead_id = $request->lead_id;

        foreach ($request as $key => $subArr) {
            unset($subArr[$lead_id]);
            $request[$key] = $subArr;  
        }

        return response()->json([
            'message' => 'Record has been removed.'
        ]);
    }

}
