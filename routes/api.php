<?php

use App\Http\Controllers\Api\OrderController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Orders API
Route::apiResource('orders', OrderController::class);

// WhatsApp incoming messages webhook (no auth required for Node.js service)
Route::post('/whatsapp/incoming', function (Request $request) {
    try {
        \Log::info('WhatsApp incoming webhook called', [
            'phone' => $request->input('phone'),
            'message' => $request->input('message'),
            'direction' => $request->input('direction'),
            'all_data' => $request->all()
        ]);
        
        $validated = $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string',
            'direction' => 'nullable|string|in:incoming,outgoing',
            'timestamp' => 'nullable|integer',
        ]);

        // Проверяем, не дублируется ли сообщение
        $exists = \App\Models\WhatsAppMessage::where('phone', $validated['phone'])
            ->where('message', $validated['message'])
            ->where('created_at', '>=', now()->subSeconds(5))
            ->exists();

        if (!$exists) {
            \Log::info('Сохраняем новое сообщение', ['phone' => $validated['phone'], 'direction' => $validated['direction'] ?? 'incoming']);
            
            \App\Models\WhatsAppMessage::create([
                'phone' => $validated['phone'],
                'message' => $validated['message'],
                'type' => 'text',
                'direction' => $validated['direction'] ?? 'incoming',
                'status' => 'sent',
            ]);

            // Если входящее сообщение, запускаем AI автоответчик
            if (($validated['direction'] ?? 'incoming') === 'incoming') {
                \Log::info('Запускаем AI автоответчик для номера: ' . $validated['phone']);
                $controller = new \App\Http\Controllers\WhatsAppController();
                $result = $controller->processIncomingMessage($validated['phone'], $validated['message']);
                \Log::info('AI автоответчик завершил работу', ['result' => $result ? 'sent' : 'skipped']);
            }
        } else {
            \Log::info('Сообщение пропущено (дубликат)', ['phone' => $validated['phone']]);
        }

        return response()->json(['success' => true]);
    } catch (\Exception $e) {
        \Log::error('WhatsApp incoming message error: ' . $e->getMessage(), [
            'exception' => $e->getTraceAsString(),
            'request_data' => $request->all()
        ]);
        return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
    }
});

