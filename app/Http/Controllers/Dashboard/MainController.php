<?php

namespace App\Http\Controllers\Dashboard;

use App\Company;
use App\Lead;
use App\User;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class MainController extends Controller
{
    protected $company;

    protected $user;

    protected $lead;

    public function __construct(User $user, Company $company, Lead $lead)
    {
        $this->company = $company;

        $this->user = $user;

        $this->lead = $lead;

    }

    public function dashboard(Request $request)
    {
        $companies = $this
                    ->company
                    ->where('parent_company_id','=',0)
                    ->count();

        $resellers = $this
                    ->company
                    ->where('parent_company_id','>',0)
                    ->count();      

        $salespeople = $this
                    ->user
                    ->where('role_id','=',5)
                    ->count();

        $active_leads = $this
                    ->lead
                    ->whereNotNull('company_assigned_date')
                    ->count();

        $pending_bant = $this
                    ->lead
                    ->where('bant_value','=',0)
                    ->count();

        $total_budget = $this
                    ->lead
                    ->sum('budget_amount');

        $bant_score = $this
                    ->lead
                    ->avg('bant_value',4);

        $rotten_leads = $this
                    ->lead
                    ->where('status','Rotten')
                    ->count();   

        $won       = $this
                    ->lead
                    ->where('status','Won')
                    ->count();                   

        $lost      = $this
                    ->lead
                    ->where('status','Lost')
                    ->count();  

        $sum = $won + $lost;

        if ($sum != 0) {
            $closing_rate = ($won/($sum)) * 100;
        } else {
            $closing_rate = 0;
        }

        return response()->json([
            'companies'    => $companies,
            'resellers'    => $resellers,
            'salespeople'  => $salespeople,
            'active_leads' => $active_leads,
            'pending_bant' => $pending_bant,
            'total_budget' => $total_budget,
            'bant_score'   => number_format($bant_score, 2, '.', ''),
            'rotten_leads' => $rotten_leads,
            'closing_rate' => number_format($closing_rate, 2, '.', '')
        ]);
    }    
}
