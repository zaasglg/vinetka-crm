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

        $orders = $query->orderBy('created_at', 'desc')->get();

        $users = \App\Models\User::whereIn('role', ['photographer', 'editor'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Orders/Index', [
            'orders' => $orders,
            'users' => $users,
            'filters' => $request->only(['q', 'status', 'date_from', 'date_to', 'assigned_photographer_id', 'assigned_editor_id', 'min_price', 'max_price']),
        ]);
    }

    public function update(Request $request, Order $order)
    {
        $validated = $request->validate([
            'current_stage' => 'required|in:new_request,photoshoot_scheduled,photoshoot_in_progress,photoshoot_completed,editing,layout,printing,payment,delivery,completed',
            'comment' => 'nullable|string',
            'photoshoot_dates' => 'nullable|array',
            'photoshoot_dates.*' => 'date',
            'assigned_photographer_id' => 'nullable|exists:users,id',
            'assigned_editor_id' => 'nullable|exists:users,id',
        ]);

        $order->update($validated);

        return redirect()->back()->with('success', 'Заявка обновлена успешно');
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
