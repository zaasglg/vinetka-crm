<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = auth()->user();
        
        // Фильтр по типу учреждения
        $institutionType = $request->get('type', 'all'); // 'school', 'kindergarten', 'all'
        
        $query = Order::with(['photographer', 'editor']);
        
        if ($institutionType !== 'all') {
            $query->where('institution_type', $institutionType);
        }
        
        $orders = $query->orderBy('created_at', 'desc')->get();

        // Получаем все заявки для выбора в модальном окне
        $allOrdersQuery = Order::orderBy('name');
        
        if ($institutionType !== 'all') {
            $allOrdersQuery->where('institution_type', $institutionType);
        }
        
        $allOrders = $allOrdersQuery->get(['id', 'name', 'phone', 'grade_level', 'institution_type', 'city', 'custom_city']);

        // Проверяем, может ли пользователь создавать заявки
        $canCreateOrder = in_array($user->role, ['admin', 'super_admin', 'sales_manager']);

        return Inertia::render('Schedule/Index', [
            'orders' => $orders,
            'allOrders' => $allOrders,
            'canCreateOrder' => $canCreateOrder,
            'currentType' => $institutionType,
        ]);
    }

    /**
     * Добавить дату съёмки к заявке или создать новую заявку
     */
    public function addPhotoshootDate(Request $request)
    {
        $user = auth()->user();
        $date = $request->input('date');
        
        if (!$date) {
            return redirect()->back()->withErrors(['error' => 'Дата не указана']);
        }
        
        $dateString = \Carbon\Carbon::parse($date)->format('Y-m-d');
        
        // Если передан order_id - добавляем дату к существующей заявке
        if ($request->filled('order_id')) {
            $validated = $request->validate([
                'order_id' => 'required|exists:orders,id',
                'date' => 'required|date',
            ]);

            $order = Order::findOrFail($validated['order_id']);
            
            // Получаем текущие даты съёмок
            $photoshootDates = $order->photoshoot_dates ?? [];
            
            // Проверяем, нет ли уже этой даты
            if (!in_array($dateString, $photoshootDates)) {
                $photoshootDates[] = $dateString;
                $order->photoshoot_dates = $photoshootDates;
                
                // Если статус ещё не установлен на photoshoot_scheduled, обновляем его
                if ($order->current_stage === 'new_request') {
                    $order->current_stage = 'photoshoot_scheduled';
                }
                
                $order->save();
                
                return redirect()->back()->with('success', 'Дата съёмки добавлена успешно');
            }
            
            return redirect()->back()->withErrors(['error' => 'Эта дата уже добавлена к заявке']);
        }
        
        // Если order_id не передан - создаём новую заявку (только для админов и менеджеров)
        if (!in_array($user->role, ['admin', 'super_admin', 'sales_manager'])) {
            return redirect()->back()->withErrors(['error' => 'У вас нет прав для создания заявок']);
        }
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:255',
            'grade_level' => 'nullable|string|max:255',
            'institution_type' => 'nullable|in:school,kindergarten',
            'city' => 'nullable|string|max:255',
            'custom_city' => 'nullable|string|max:255',
            'comment' => 'nullable|string',
            'date' => 'required|date',
        ]);
        
        // Создаём новую заявку
        $order = Order::create([
            'name' => $validated['name'],
            'phone' => $validated['phone'] ?? null,
            'grade_level' => $validated['grade_level'] ?? null,
            'institution_type' => $validated['institution_type'] ?? null,
            'city' => $validated['city'] ?? null,
            'custom_city' => $validated['custom_city'] ?? null,
            'comment' => $validated['comment'] ?? null,
            'status' => 'pending',
            'current_stage' => 'photoshoot_scheduled',
            'photoshoot_dates' => [$dateString],
        ]);
        
        return redirect()->back()->with('success', 'Заявка создана и дата съёмки добавлена');
    }

    /**
     * Удалить дату съёмки из заявки
     */
    public function removePhotoshootDate(Request $request, Order $order)
    {
        $date = $request->input('date');
        
        if (!$date) {
            return redirect()->back()->withErrors(['error' => 'Дата не указана']);
        }

        $photoshootDates = $order->photoshoot_dates ?? [];
        $dateString = \Carbon\Carbon::parse($date)->format('Y-m-d');
        
        // Удаляем дату из массива
        $photoshootDates = array_values(array_filter($photoshootDates, function($d) use ($dateString) {
            return $d !== $dateString;
        }));
        
        $order->photoshoot_dates = $photoshootDates;
        $order->save();
        
        return redirect()->back()->with('success', 'Дата съёмки удалена');
    }
}
