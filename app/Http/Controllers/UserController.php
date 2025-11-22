<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = User::query();

        // Search by name or email
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
            });
        }

        // Filter by role
        if ($request->filled('role')) {
            $query->where('role', $request->get('role'));
        }

        // Filter by regular client flag
        if ($request->has('is_regular_client')) {
            $val = $request->get('is_regular_client');
            if ($val === '1' || $val === 'true' || $val === 1) {
                $query->where('is_regular_client', true);
            } elseif ($val === '0' || $val === 'false' || $val === 0) {
                $query->where('is_regular_client', false);
            }
        }

        $users = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['q', 'role', 'is_regular_client']),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|in:super_admin,admin,sales_manager,photographer,editor,print_operator,client',
        ]);

        $validated['password'] = Hash::make($validated['password']);

        User::create($validated);

        return redirect()->back()->with('success', 'Пользователь создан успешно');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|in:super_admin,admin,sales_manager,photographer,editor,print_operator,client',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Пользователь обновлен успешно');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        // Prevent deleting own account
        if ($user->id === auth()->id()) {
            return redirect()->back()->with('error', 'Нельзя удалить свой аккаунт');
        }

        $user->delete();

        return redirect()->back()->with('success', 'Пользователь удален успешно');
    }

    /**
     * Toggle "Постоянный клиент" flag for a client user
     */
    public function toggleRegular(Request $request, User $user)
    {
        // Only allow for users with role 'client'
        if ($user->role !== 'client') {
            return response()->json(['success' => false, 'error' => 'Тег можно назначать только клиентам'], 403);
        }

        $user->is_regular_client = !$user->is_regular_client;
        $user->save();

        return response()->json(['success' => true, 'is_regular_client' => $user->is_regular_client]);
    }

    /**
     * Generate a random password for a user (admins only).
     * Returns the plain password in response so admin can copy it.
     */
    public function generatePassword(Request $request, User $user)
    {
        $auth = auth()->user();
        if (!in_array($auth->role, ['admin', 'super_admin'])) {
            return response()->json(['success' => false, 'error' => 'Доступ запрещен'], 403);
        }

        $plain = Str::random(10);
        $user->password = Hash::make($plain);
        $user->save();

        return response()->json(['success' => true, 'password' => $plain]);
    }
}
