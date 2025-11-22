<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppController extends Controller
{
    private $serviceUrl;

    public function __construct()
    {
        $this->serviceUrl = env('WHATSAPP_SERVICE_URL', 'http://localhost:3001');
    }

    /**
     * Получить статус подключения WhatsApp
     */
    public function status()
    {
        try {
            $response = Http::timeout(5)->get("{$this->serviceUrl}/status");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Сервис WhatsApp недоступен'
            ], 503);
        } catch (\Exception $e) {
            Log::error('WhatsApp status error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось подключиться к сервису WhatsApp'
            ], 503);
        }
    }

    /**
     * Удалить сессию WhatsApp и данные подключения
     */
    public function deleteSession()
    {
        try {
            // Сначала отключаемся через API
            Http::timeout(5)->post("{$this->serviceUrl}/disconnect");
            
            // Затем удаляем файлы сессии
            $response = Http::timeout(5)->post("{$this->serviceUrl}/delete-session");
            
            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'message' => 'Сессия WhatsApp удалена'
                ]);
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Не удалось удалить сессию'
            ], 500);
        } catch (\Exception $e) {
            Log::error('WhatsApp delete session error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось удалить сессию'
            ], 500);
        }
    }

    /**
     * Получить историю сообщений
     */
    public function messages()
    {
        try {
            $messages = \App\Models\WhatsAppMessage::with(['user', 'order'])
                ->orderBy('created_at', 'asc')
                ->limit(500)
                ->get()
                ->map(function ($msg) {
                    return [
                        'id' => $msg->id,
                        'phone' => $msg->phone,
                        'message' => $msg->message,
                        'type' => $msg->type,
                        'direction' => $msg->direction,
                        'status' => $msg->status,
                        'created_at' => $msg->created_at ? $msg->created_at->toIso8601String() : now()->toIso8601String(),
                        'user' => $msg->user ? $msg->user->name : null,
                        'order_id' => $msg->order_id,
                    ];
                });

            return response()->json([
                'success' => true,
                'messages' => $messages,
            ]);
        } catch (\Exception $e) {
            Log::error('WhatsApp messages error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось загрузить сообщения: ' . $e->getMessage(),
                'messages' => []
            ], 200); // Возвращаем 200 чтобы фронт не падал
        }
    }

    /**
     * Отправить текстовое сообщение
     */
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'message' => 'required|string',
        ]);

        try {
            $response = Http::timeout(10)->post("{$this->serviceUrl}/send-message", [
                'phone' => $validated['phone'],
                'message' => $validated['message'],
            ]);

            if ($response->successful()) {
                // Сохраняем в БД
                \App\Models\WhatsAppMessage::create([
                    'phone' => $validated['phone'],
                    'message' => $validated['message'],
                    'type' => 'text',
                    'direction' => 'outgoing',
                    'status' => 'sent',
                    'user_id' => auth()->id(),
                ]);

                return response()->json($response->json());
            }

            // Сохраняем неудачную попытку
            \App\Models\WhatsAppMessage::create([
                'phone' => $validated['phone'],
                'message' => $validated['message'],
                'type' => 'text',
                'direction' => 'outgoing',
                'status' => 'failed',
                'error_message' => $response->json()['error'] ?? 'Unknown error',
                'user_id' => auth()->id(),
            ]);

            return response()->json([
                'success' => false,
                'error' => $response->json()['error'] ?? 'Ошибка отправки сообщения'
            ], $response->status());
        } catch (\Exception $e) {
            Log::error('WhatsApp send message error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось отправить сообщение'
            ], 500);
        }
    }

    /**
     * Отправить медиа файл
     */
    public function sendMedia(Request $request)
    {
        $validated = $request->validate([
            'phone' => 'required|string',
            'url' => 'required|url',
            'caption' => 'nullable|string',
            'type' => 'nullable|string|in:image,document',
        ]);

        try {
            $response = Http::timeout(30)->post("{$this->serviceUrl}/send-media", [
                'phone' => $validated['phone'],
                'url' => $validated['url'],
                'caption' => $validated['caption'] ?? '',
                'type' => $validated['type'] ?? 'image',
            ]);

            if ($response->successful()) {
                return response()->json($response->json());
            }

            return response()->json([
                'success' => false,
                'error' => $response->json()['error'] ?? 'Ошибка отправки медиа'
            ], $response->status());
        } catch (\Exception $e) {
            Log::error('WhatsApp send media error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось отправить медиа'
            ], 500);
        }
    }

    /**
     * Переподключиться к WhatsApp
     */
    public function reconnect()
    {
        try {
            $response = Http::timeout(5)->post("{$this->serviceUrl}/reconnect");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Ошибка переподключения'
            ], 500);
        } catch (\Exception $e) {
            Log::error('WhatsApp reconnect error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось переподключиться'
            ], 500);
        }
    }

    /**
     * Отключиться от WhatsApp
     */
    public function disconnect()
    {
        try {
            $response = Http::timeout(5)->post("{$this->serviceUrl}/disconnect");
            
            if ($response->successful()) {
                return response()->json($response->json());
            }
            
            return response()->json([
                'success' => false,
                'error' => 'Ошибка отключения'
            ], 500);
        } catch (\Exception $e) {
            Log::error('WhatsApp disconnect error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось отключиться'
            ], 500);
        }
    }

    /**
     * Отправить уведомление клиенту о готовности заказа
     */
    public function notifyOrderReady(Request $request)
    {
        $validated = $request->validate([
            'order_id' => 'required|integer|exists:orders,id',
        ]);

        try {
            $order = \App\Models\Order::findOrFail($validated['order_id']);
            
            if (empty($order->phone)) {
                return response()->json([
                    'success' => false,
                    'error' => 'У заказа нет номера телефона'
                ], 400);
            }

            // Форматируем номер телефона (убираем все кроме цифр)
            $phone = preg_replace('/[^0-9]/', '', $order->phone);
            
            $message = "Здравствуйте! Ваша заявка #{$order->id} ({$order->name}) готова. " .
                      "Статус: {$order->status}. Спасибо за ожидание!";

            $response = Http::timeout(10)->post("{$this->serviceUrl}/send-message", [
                'phone' => $phone,
                'message' => $message,
            ]);

            if ($response->successful()) {
                Log::info("WhatsApp notification sent for order #{$order->id} to {$phone}");
                return response()->json([
                    'success' => true,
                    'message' => 'Уведомление отправлено',
                    'order_id' => $order->id,
                ]);
            }

            return response()->json([
                'success' => false,
                'error' => $response->json()['error'] ?? 'Ошибка отправки уведомления'
            ], $response->status());
        } catch (\Exception $e) {
            Log::error('WhatsApp notify order error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось удалить сессию'
            ], 500);
        }
    }

    /**
     * Получить настройки автоответчика
     */
    public function getAutoReplySettings()
    {
        try {
            $settings = \App\Models\WhatsAppAutoReplySetting::getSettings();
            return response()->json([
                'success' => true,
                'settings' => $settings
            ]);
        } catch (\Exception $e) {
            Log::error('Get auto reply settings error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось загрузить настройки'
            ], 500);
        }
    }

    /**
     * Обновить настройки автоответчика
     */
    public function updateAutoReplySettings(Request $request)
    {
        try {
            $validated = $request->validate([
                'enabled' => 'required|boolean',
                'system_prompt' => 'nullable|string',
                'ai_model' => 'nullable|string',
                'max_tokens' => 'nullable|integer|min:50|max:2000',
                'temperature' => 'nullable|numeric|min:0|max:2',
                'excluded_phones' => 'nullable|array',
                'only_new_conversations' => 'nullable|boolean',
            ]);

            $settings = \App\Models\WhatsAppAutoReplySetting::getSettings();
            $settings->update($validated);

            return response()->json([
                'success' => true,
                'settings' => $settings->fresh()
            ]);
        } catch (\Illuminate\Validation\ValidationException $ve) {
            // Return validation errors to the frontend for better UX
            Log::warning('Validation error updating auto reply settings: ' . $ve->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Ошибка валидации',
                'details' => $ve->errors(),
            ], 422);
        } catch (\Exception $e) {
            Log::error('Update auto reply settings error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => 'Не удалось обновить настройки',
                'exception' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Обработать входящее сообщение с AI автоответчиком
     */
    public function processIncomingMessage($phone, $message)
    {
        try {
            Log::info("🤖 AI Auto-reply: начало обработки", ['phone' => $phone, 'message' => $message]);
            
            $settings = \App\Models\WhatsAppAutoReplySetting::getSettings();
            
            // Проверяем, включен ли автоответчик
            if (!$settings->enabled) {
                Log::info("🤖 AI Auto-reply: автоответчик выключен");
                return null;
            }

            // Проверяем, не в списке исключений ли номер
            if (in_array($phone, $settings->excluded_phones ?? [])) {
                Log::info("🤖 AI Auto-reply: номер в списке исключений", ['phone' => $phone]);
                return null;
            }

            // Проверяем, отвечаем ли только на новые разговоры
            if ($settings->only_new_conversations) {
                $messagesCount = \App\Models\WhatsAppMessage::where('phone', $phone)
                    ->where('direction', 'incoming')
                    ->count();
                
                Log::info("🤖 AI Auto-reply: проверка новых разговоров", ['count' => $messagesCount, 'only_new' => true]);
                
                if ($messagesCount > 1) {
                    Log::info("🤖 AI Auto-reply: не первое сообщение, пропускаем");
                    return null; // Уже не первое сообщение
                }
            }

            Log::info("🤖 AI Auto-reply: все проверки пройдены, вызываем OpenAI");

            // Получаем историю последних 5 сообщений для контекста
            $history = \App\Models\WhatsAppMessage::where('phone', $phone)
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
                ->reverse()
                ->map(function ($msg) {
                    return [
                        'role' => $msg->direction === 'incoming' ? 'user' : 'assistant',
                        'content' => $msg->message
                    ];
                })
                ->toArray();

            // Вызываем OpenAI API через HTTP
            $apiKey = env('OPENAI_API_KEY');
            
            if (!$apiKey) {
                Log::error('🤖 AI Auto-reply: OPENAI_API_KEY not set in .env file');
                return null;
            }

            $messages = [
                ['role' => 'system', 'content' => $settings->system_prompt]
            ];
            
            $messages = array_merge($messages, $history);
            
            Log::info("🤖 AI Auto-reply: отправляем запрос в OpenAI", [
                'model' => $settings->ai_model,
                'messages_count' => count($messages),
                'max_tokens' => $settings->max_tokens
            ]);

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => $settings->ai_model,
                'messages' => $messages,
                'max_tokens' => $settings->max_tokens,
                'temperature' => $settings->temperature,
            ]);

            if (!$response->successful()) {
                Log::error('🤖 AI Auto-reply: OpenAI API error', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return null;
            }

            $aiResponse = $response->json('choices.0.message.content');

            if (!$aiResponse) {
                Log::error('🤖 AI Auto-reply: Empty AI response');
                return null;
            }

            Log::info("🤖 AI Auto-reply: получен ответ от OpenAI", ['response_length' => strlen($aiResponse)]);

            // Отправляем ответ через WhatsApp
            $sendResponse = Http::timeout(10)->post("{$this->serviceUrl}/send-message", [
                'phone' => $phone,
                'message' => $aiResponse,
            ]);
            
            if (!$sendResponse->successful()) {
                Log::error('🤖 AI Auto-reply: ошибка отправки через WhatsApp', [
                    'status' => $sendResponse->status(),
                    'body' => $sendResponse->body()
                ]);
            } else {
                Log::info("🤖 AI Auto-reply: ответ успешно отправлен через WhatsApp");
            }

            // Сохраняем в БД
            \App\Models\WhatsAppMessage::create([
                'phone' => $phone,
                'message' => $aiResponse,
                'type' => 'text',
                'direction' => 'outgoing',
                'status' => 'sent',
            ]);

            Log::info("🤖 AI Auto-reply: завершено успешно");
            return $aiResponse;
        } catch (\Exception $e) {
            Log::error('🤖 AI auto reply error: ' . $e->getMessage(), [
                'exception' => $e->getTraceAsString()
            ]);
            return null;
        }
    }
}
