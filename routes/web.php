<?php

use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Guest routes
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
});

// Authenticated routes
Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    
    // Users management
    Route::resource('users', \App\Http\Controllers\UserController::class)
        ->only(['index', 'store', 'update', 'destroy']);

    // Toggle regular client tag for clients
    Route::post('/users/{user}/toggle-regular', [\App\Http\Controllers\UserController::class, 'toggleRegular'])->name('users.toggle-regular');
    // Generate password for a user (admins only)
    Route::post('/users/{user}/generate-password', [\App\Http\Controllers\UserController::class, 'generatePassword'])->name('users.generate-password');
    
    // Orders management
    Route::get('/orders', [\App\Http\Controllers\OrderManagementController::class, 'index'])->name('orders.index');
    Route::put('/orders/{order}', [\App\Http\Controllers\OrderManagementController::class, 'update'])->name('orders.update');
    Route::delete('/orders/{order}', [\App\Http\Controllers\OrderManagementController::class, 'destroy'])->name('orders.destroy');
    // Create a client user from an order (admins only)
    Route::post('/orders/{order}/create-client', [\App\Http\Controllers\OrderManagementController::class, 'createClientFromOrder'])->name('orders.create-client');
    
    // Schedule
    Route::get('/schedule', [\App\Http\Controllers\ScheduleController::class, 'index'])->name('schedule.index');
    
    // Attendance
    Route::get('/attendance', [\App\Http\Controllers\AttendanceController::class, 'index'])->name('attendance.index');
    Route::post('/attendance', [\App\Http\Controllers\AttendanceController::class, 'store'])->name('attendance.store');
    Route::put('/attendance/{attendance}', [\App\Http\Controllers\AttendanceController::class, 'update'])->name('attendance.update');
    Route::delete('/attendance/{attendance}', [\App\Http\Controllers\AttendanceController::class, 'destroy'])->name('attendance.destroy');
    Route::get('/attendance/report', [\App\Http\Controllers\AttendanceController::class, 'report'])->name('attendance.report');
    
    // Projects
    Route::get('/orders/{order}/project', [\App\Http\Controllers\ProjectController::class, 'show'])->name('projects.show');
    Route::put('/projects/{project}', [\App\Http\Controllers\ProjectController::class, 'update'])->name('projects.update');
    Route::post('/projects/{project}/comments', [\App\Http\Controllers\ProjectController::class, 'addComment'])->name('projects.comments.add');
    Route::put('/projects/comments/{comment}/resolve', [\App\Http\Controllers\ProjectController::class, 'resolveComment'])->name('projects.comments.resolve');
    Route::delete('/projects/comments/{comment}', [\App\Http\Controllers\ProjectController::class, 'deleteComment'])->name('projects.comments.delete');
    Route::post('/projects/{project}/generate-link', [\App\Http\Controllers\ProjectController::class, 'generatePublicLink'])->name('projects.generate-link');
    
    // WhatsApp
    Route::get('/whatsapp', function () {
        return Inertia::render('WhatsAppSettings');
    })->name('whatsapp.settings');
    
    Route::get('/whatsapp/chat', function () {
        return Inertia::render('WhatsAppChat');
    })->name('whatsapp.chat');
    
    Route::prefix('whatsapp')->group(function () {
        Route::get('/status', [\App\Http\Controllers\WhatsAppController::class, 'status'])->name('whatsapp.status');
        Route::get('/messages', [\App\Http\Controllers\WhatsAppController::class, 'messages'])->name('whatsapp.messages');
        Route::post('/send-message', [\App\Http\Controllers\WhatsAppController::class, 'sendMessage'])->name('whatsapp.send-message');
        Route::post('/send-media', [\App\Http\Controllers\WhatsAppController::class, 'sendMedia'])->name('whatsapp.send-media');
        Route::post('/reconnect', [\App\Http\Controllers\WhatsAppController::class, 'reconnect'])->name('whatsapp.reconnect');
        Route::post('/disconnect', [\App\Http\Controllers\WhatsAppController::class, 'disconnect'])->name('whatsapp.disconnect');
        Route::post('/delete-session', [\App\Http\Controllers\WhatsAppController::class, 'deleteSession'])->name('whatsapp.delete-session');
        Route::post('/notify-order/{order}', [\App\Http\Controllers\WhatsAppController::class, 'notifyOrderReady'])->name('whatsapp.notify-order');
        
        // Auto-reply settings
        Route::get('/auto-reply/settings', [\App\Http\Controllers\WhatsAppController::class, 'getAutoReplySettings'])->name('whatsapp.auto-reply.settings');
        Route::post('/auto-reply/update', [\App\Http\Controllers\WhatsAppController::class, 'updateAutoReplySettings'])->name('whatsapp.auto-reply.update');
    });
    
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');
});

// Redirect root to dashboard or login
Route::get('/', function () {
    return auth()->check() 
        ? redirect('/dashboard') 
        : redirect('/login');
});

// Public project view (no auth required)
Route::get('/public/project/{token}', [\App\Http\Controllers\ProjectController::class, 'publicView'])->name('projects.public');
Route::post('/public/project/{token}/review', [\App\Http\Controllers\ProjectController::class, 'submitReview'])->name('projects.public.review');
Route::post('/public/project/{token}/review', [\App\Http\Controllers\ProjectController::class, 'submitReview'])->name('projects.review');
