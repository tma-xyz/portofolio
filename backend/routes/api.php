<?php

use App\Http\Controllers\CommentController;
use App\Http\Controllers\MessageController;
use Illuminate\Support\Facades\Route;

Route::get('/comments', [CommentController::class, 'index']);
Route::post('/comments', [CommentController::class, 'store'])->middleware('throttle:10,1');
Route::put('/comments/{id}', [CommentController::class, 'update']);
Route::delete('/comments/{id}', [CommentController::class, 'destroy']);
Route::post('/messages', [MessageController::class, 'store'])->middleware('throttle:5,1');
