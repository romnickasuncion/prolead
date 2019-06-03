<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

/*Route::get('/', function () {
    return view('components.contents.leads-in.main',['active' => 'leads-in']);
});

Route::get('/active-leads', function () {
    return view('components.contents.active-leads.main',['active' => 'active-leads']);
});

Route::get('/dealers', function () {
    return view('components.contents.dealers.main',['active' => 'dealers']);
});*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/contact-us', function () {
    return view('contact');
});

Route::get('/leads-management', function () {
    return view('leads-management');
});

Route::get('/about-us', function () {
    return view('about-us');
});

Route::get('/admin', function () {
    return view('react-template');
});

Route::any('/admin/{path?}', function() {
    return view("react-template");
})->where("path", ".+");

/*Route::get('/react-sample', function () {
    return view('react-template');
});*/
