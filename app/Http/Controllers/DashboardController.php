<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Получаем статистику
        $today = Carbon::today();
        
        // Считаем активные заявки (не в статусе "completed")
        $activeOrdersCount = Order::where('status', '!=', 'completed')->count();
        $previousActiveOrdersCount = Order::where('status', '!=', 'completed')
            ->where('created_at', '<', $today)
            ->count();
        
        // Заявки на сегодня (с датами съемки на сегодня)
        $todayOrdersCount = Order::whereNotNull('photoshoot_dates')
            ->whereJsonContains('photoshoot_dates', $today->format('Y-m-d'))
            ->count();
        
        // Заявки в обработке
        $inProcessCount = Order::where('current_stage', 'editing')->count();
        $previousInProcessCount = Order::where('current_stage', 'editing')
            ->where('updated_at', '<', $today)
            ->count();
        
        // Готово к печати
        $readyToPrintCount = Order::where('current_stage', 'printing')->count();
        $previousReadyToPrintCount = Order::where('current_stage', 'printing')
            ->where('updated_at', '<', $today)
            ->count();
        
        // Маппинг статусов на русский
        $statusMap = [
            'new_request' => 'Новая заявка',
            'photoshoot_scheduled' => 'Съёмка запланирована',
            'editing' => 'Обработка',
            'printing' => 'Печать',
            'completed' => 'Завершено',
        ];
        
        // Последние 10 заявок
        $recentOrders = Order::with(['photographer', 'editor'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($order) use ($statusMap) {
                $status = $order->current_stage ?? $order->status;
                return [
                    'id' => $order->id,
                    'school' => $order->name,
                    'date' => $order->created_at->format('Y-m-d'),
                    'status' => $statusMap[$status] ?? $status,
                    'photographer' => $order->photographer ? $order->photographer->name : null,
                    'editor' => $order->editor ? $order->editor->name : null,
                ];
            });
        
        $stats = [
            [
                'name' => 'Активные заявки',
                'value' => (string)$activeOrdersCount,
                'change' => $activeOrdersCount >= $previousActiveOrdersCount 
                    ? '+' . ($activeOrdersCount - $previousActiveOrdersCount)
                    : (string)($activeOrdersCount - $previousActiveOrdersCount),
                'trend' => $activeOrdersCount > $previousActiveOrdersCount ? 'up' : 
                          ($activeOrdersCount < $previousActiveOrdersCount ? 'down' : 'neutral'),
            ],
            [
                'name' => 'Заявки на сегодня',
                'value' => (string)$todayOrdersCount,
                'change' => '0',
                'trend' => 'neutral',
            ],
            [
                'name' => 'В обработке',
                'value' => (string)$inProcessCount,
                'change' => $inProcessCount >= $previousInProcessCount 
                    ? '+' . ($inProcessCount - $previousInProcessCount)
                    : (string)($inProcessCount - $previousInProcessCount),
                'trend' => $inProcessCount > $previousInProcessCount ? 'up' : 
                          ($inProcessCount < $previousInProcessCount ? 'down' : 'neutral'),
            ],
            [
                'name' => 'Готово к печати',
                'value' => (string)$readyToPrintCount,
                'change' => $readyToPrintCount >= $previousReadyToPrintCount 
                    ? '+' . ($readyToPrintCount - $previousReadyToPrintCount)
                    : (string)($readyToPrintCount - $previousReadyToPrintCount),
                'trend' => $readyToPrintCount > $previousReadyToPrintCount ? 'up' : 
                          ($readyToPrintCount < $previousReadyToPrintCount ? 'down' : 'neutral'),
            ],
        ];
        
        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
        ]);
    }
}
