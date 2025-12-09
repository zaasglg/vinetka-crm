<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Inertia\Inertia;

class OrderManagementController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['photographer', 'editor']);

        // Search by client name or phone
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        // Filter by status (current_stage)
        if ($request->filled('status')) {
            $query->where('current_stage', $request->get('status'));
        }

        // Date range filter (created_at)
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->get('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->get('date_to'));
        }

        // Assigned photographer/editor
        if ($request->filled('assigned_photographer_id')) {
            $query->where('assigned_photographer_id', $request->get('assigned_photographer_id'));
        }
        if ($request->filled('assigned_editor_id')) {
            $query->where('assigned_editor_id', $request->get('assigned_editor_id'));
        }

        // Price range
        if ($request->filled('min_price')) {
            $query->where('total_price', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('total_price', '<=', $request->get('max_price'));
        }

        // Sorting
        $sortBy = $request->get('sort_by', 'created_at');
        $sortOrder = $request->get('sort_order', 'desc');
        
        if ($sortBy === 'priority') {
            // Сортировка по приоритету: urgent > high > normal > low
            $query->orderByRaw("CASE 
                WHEN priority = 'urgent' THEN 1 
                WHEN priority = 'high' THEN 2 
                WHEN priority = 'normal' THEN 3 
                WHEN priority = 'low' THEN 4 
                ELSE 5 
            END");
            if ($sortOrder === 'desc') {
                $query->orderBy('created_at', 'desc');
            } else {
                $query->orderBy('created_at', 'asc');
            }
        } else {
            $query->orderBy($sortBy, $sortOrder);
        }

        $orders = $query->get();

        $users = \App\Models\User::whereIn('role', ['photographer', 'editor'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'users' => $users,
            'filters' => $request->only(['q', 'status', 'date_from', 'date_to', 'assigned_photographer_id', 'assigned_editor_id', 'min_price', 'max_price']),
            'sort' => [
                'by' => $sortBy,
                'order' => $sortOrder,
            ],
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'current_stage' => 'required|in:new_request,photoshoot_scheduled,photoshoot_in_progress,photoshoot_completed,editing,layout,printing,payment,delivery,completed',
            'priority' => 'nullable|in:low,normal,high,urgent',
            'comment' => 'nullable|string',
            'photoshoot_dates' => 'nullable|array',
            'photoshoot_dates.*' => 'date',
            'assigned_photographer_id' => 'nullable|exists:users,id',
            'assigned_editor_id' => 'nullable|exists:users,id',
        ]);

        $order->update($validated);

        return redirect()->back()->with('success', 'Заявка обновлена успешно');
    }

    /**
     * Загрузить договор к заявке
     */
    public function uploadContract(Request $request, Order $order)
    {
        $validated = $request->validate([
            'contract' => 'required|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240', // Максимум 10MB
        ]);

        // Удаляем старый договор, если есть
        if ($order->contract_path) {
            $oldPath = storage_path('app/public/' . $order->contract_path);
            if (file_exists($oldPath)) {
                unlink($oldPath);
            }
        }

        // Сохраняем новый файл
        $file = $request->file('contract');
        
        // Убеждаемся, что папка contracts существует
        $contractsDir = storage_path('app/public/contracts');
        if (!\Illuminate\Support\Facades\File::exists($contractsDir)) {
            \Illuminate\Support\Facades\File::makeDirectory($contractsDir, 0755, true);
        }
        
        $fileName = 'order_' . $order->id . '_' . time() . '.' . $file->getClientOriginalExtension();
        $filePath = 'contracts/' . $fileName;
        
        // Сохраняем файл напрямую в папку contracts
        $fullPath = $contractsDir . '/' . $fileName;
        $file->move($contractsDir, $fileName);
        
        // Проверяем, что файл действительно сохранился
        if (!file_exists($fullPath)) {
            \Log::error('Failed to store contract file', [
                'order_id' => $order->id,
                'file_name' => $fileName,
                'full_path' => $fullPath
            ]);
            return redirect()->back()->withErrors(['error' => 'Ошибка при сохранении файла']);
        }

        // Обновляем заявку
        $order->contract_path = $filePath;
        $order->save();

        \Log::info('Contract uploaded successfully', [
            'order_id' => $order->id,
            'file_path' => $filePath,
            'full_path' => $fullPath
        ]);

        return redirect()->back()->with('success', 'Договор успешно загружен');
    }

    /**
     * Удалить договор
     */
    public function deleteContract(Request $request, Order $order)
    {
        try {
            if ($order->contract_path) {
                $filePath = storage_path('app/public/' . $order->contract_path);
                
                \Log::info('Attempting to delete contract', [
                    'order_id' => $order->id,
                    'contract_path' => $order->contract_path,
                    'full_path' => $filePath,
                    'file_exists' => file_exists($filePath)
                ]);
                
                if (file_exists($filePath)) {
                    if (!unlink($filePath)) {
                        \Log::error('Failed to unlink contract file', [
                            'order_id' => $order->id,
                            'file_path' => $filePath
                        ]);
                        throw new \Exception('Не удалось удалить файл');
                    }
                } else {
                    \Log::warning('Contract file not found, but path exists in DB', [
                        'order_id' => $order->id,
                        'file_path' => $filePath
                    ]);
                }
                
                $order->contract_path = null;
                $order->save();
                
                \Log::info('Contract deleted successfully', [
                    'order_id' => $order->id
                ]);
            }

            // Если это AJAX запрос, возвращаем JSON
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json(['success' => true, 'message' => 'Договор удалён']);
            }

            return redirect()->back()->with('success', 'Договор удалён');
        } catch (\Exception $e) {
            \Log::error('Error deleting contract', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Если это AJAX запрос, возвращаем JSON с ошибкой
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json(['success' => false, 'error' => 'Ошибка при удалении: ' . $e->getMessage()], 500);
            }

            return redirect()->back()->withErrors(['error' => 'Ошибка при удалении: ' . $e->getMessage()]);
        }
    }

    /**
     * Скачать договор
     */
    public function downloadContract(Order $order)
    {
        if (!$order->contract_path) {
            abort(404, 'Договор не найден');
        }

        $filePath = storage_path('app/public/' . $order->contract_path);
        
        if (!file_exists($filePath)) {
            abort(404, 'Файл не найден');
        }

        return response()->download($filePath);
    }

    public function destroy(Order $order)
    {
        $order->delete();

        return redirect()->back()->with('success', 'Заявка удалена успешно');
    }

    /**
     * Create a client user from order data (name, phone, email if available)
     */
    public function createClientFromOrder(Request $request, Order $order)
    {
        // Only allow admins or super_admin
        $user = auth()->user();
        if (!in_array($user->role, ['admin', 'super_admin'])) {
            return response()->json(['success' => false, 'error' => 'Доступ запрещен'], 403);
        }

        $phone = $order->phone;
        $email = $order->email ?? null;
        $name = $order->name ?? 'Клиент';

        if (!$phone && !$email) {
            return response()->json(['success' => false, 'error' => 'Нет данных для создания клиента'], 400);
        }

        // Try to find existing user by phone or email
        $existing = \App\Models\User::when($phone, function ($q) use ($phone) {
            return $q->orWhere('phone', $phone);
        })->when($email, function ($q) use ($email) {
            return $q->orWhere('email', $email);
        })->first();

        if ($existing) {
            return response()->json(['success' => false, 'error' => 'Пользователь уже существует', 'user_id' => $existing->id], 409);
        }

        $password = \Illuminate\Support\Facades\Hash::make(\Illuminate\Support\Str::random(10));

        // Ensure we have unique email; if not provided, synthesize one from phone
        $createEmail = $email;
        if (!$createEmail) {
            $safe = preg_replace('/[^0-9]/', '', $phone ?? '');
            $createEmail = $safe ? "client_{$safe}@local" : "client_" . uniqid() . "@local";
        }

        $new = \App\Models\User::create([
            'name' => $name,
            'email' => $createEmail,
            'password' => $password,
            'role' => 'client',
        ]);

        // Store phone if column exists
        if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'phone')) {
            $new->phone = $phone;
            $new->save();
        }

        return response()->json(['success' => true, 'user_id' => $new->id]);
    }
}
