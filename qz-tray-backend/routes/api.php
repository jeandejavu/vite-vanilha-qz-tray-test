<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\QzTrayController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

// QZ Tray Routes
Route::prefix('qz-tray')->group(function () {
    Route::get('/certificate', [QzTrayController::class, 'getCertificate']);
    Route::post('/sign', [QzTrayController::class, 'signData']);
});
