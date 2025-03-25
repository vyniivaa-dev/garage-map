<?php

use App\Http\Controllers\MapController;
use Illuminate\Support\Facades\Route;

Route::get('/', [MapController::class, 'loginForm'])->name('login');
Route::post('/login', [MapController::class, 'login']);
Route::post('/logout', [MapController::class, 'logout'])->name('logout');
Route::get('/map', [MapController::class, 'map'])->name('map.view');
Route::post('/save-marker', [MapController::class, 'saveMarker'])->name('save.marker');

// use App\Http\Controllers\MapController;
// use Illuminate\Support\Facades\Route;

// Route::get('/', [MapController::class, 'loginForm'])->name('login');
// Route::post('/login', [MapController::class, 'login']);
// Route::post('/logout', [MapController::class, 'logout'])->name('logout');

// Route::middleware('auth')->group(function () {
//     Route::get('/map', [MapController::class, 'map'])->name('map.view');
//     Route::post('/save-marker', [MapController::class, 'saveMarker'])->name('save.marker');
// });