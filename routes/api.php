<?php

use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api')->group(function(){
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/dashboard','Dashboard\MainController@dashboard');

    Route::prefix('companies')->group(function(){
        Route::get('/','Companies\MainController@index');

        Route::post('/','Companies\MainController@store');

        Route::delete('/','Companies\MassAssignmentController@destroy');

        Route::prefix('{company_id}')->group(function(){
            Route::get('/','Companies\MainController@show');

            Route::patch('/','Companies\MainController@update');

            Route::delete('/','Companies\MainController@destroy');
        });
    });

    Route::prefix('users')->group(function(){
        Route::get('/','Users\MainController@index');

        Route::post('/','Users\MainController@store');

        Route::delete('/','Users\MassAssignmentController@destroy');

        Route::prefix('{user_id}')->group(function(){
            Route::get('/','Users\MainController@show');

            Route::patch('/','Users\MainController@update');

            Route::delete('/','Users\MainController@destroy');
        });

    });

    Route::prefix('leads')->group(function(){
        Route::get('/','Leads\MainController@index');

        Route::post('/','Leads\MainController@store');

        Route::patch('/','Leads\MassAssignmentController@update');

        Route::delete('/','Leads\MassAssignmentController@destroy');

        Route::post('/import','Leads\ImportController@index');

        Route::post('/store','Leads\ImportController@store');

        Route::get('/logs','Leads\LogsController@index');

        Route::prefix('{lead_id}')->group(function(){
            Route::get('/','Leads\MainController@show');

            Route::patch('/','Leads\MainController@update');

            Route::delete('/','Leads\MainController@destroy');

            Route::delete('/delete','Leads\ImportController@destroy');

            Route::patch('/assign-personnel','Leads\AssignPersonnelController@update');

            Route::prefix('activities')->group(function(){
                Route::get('/','Leads\ActivityController@index');

                Route::post('/','Leads\ActivityController@store');

                Route::prefix('{lead_activity_id}')->group(function(){
                    Route::get('/','Leads\ActivityController@show');

                    Route::patch('/','Leads\ActivityController@update');

                    Route::delete('/','Leads\ActivityController@destroy');
                });
            });
        });
    });

    Route::prefix('staff')->group(function(){
        Route::get('/activities','Users\Staff\ActivitiesController@index');
        Route::get('/leads','Users\Staff\LeadsController@index');
    });
});
