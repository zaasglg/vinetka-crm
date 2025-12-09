<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ClientController extends Controller
{
    /**
     * Display a listing of clients.
     */
    public function index(Request $request)
    {
        $query = User::where('role', 'client');

        // Search by name, email or phone
        if ($request->filled('q')) {
            $q = $request->get('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%");
                if (\Illuminate\Support\Facades\Schema::hasColumn('users', 'phone')) {
                    $sub->orWhere('phone', 'like', "%{$q}%");
                }
            });
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

        $clients = $query->orderBy('created_at', 'desc')->get();

        return Inertia::render('Clients/Index', [
            'clients' => $clients,
            'filters' => $request->only(['q', 'is_regular_client']),
        ]);
    }

    /**
     * Store a newly created client.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8',
            'comment' => 'nullable|string',
        ]);

        // Generate password if not provided
        if (empty($validated['password'])) {
            $validated['password'] = Hash::make(Str::random(10));
        } else {
            $validated['password'] = Hash::make($validated['password']);
        }

        $validated['role'] = 'client';

        $client = User::create($validated);

        return redirect()->back()->with('success', 'Клиент создан успешно');
    }

    /**
     * Update the specified client.
     */
    public function update(Request $request, User $user)
    {
        // Ensure it's a client
        if ($user->role !== 'client') {
            return redirect()->back()->withErrors(['error' => 'Этот пользователь не является клиентом']);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'phone' => 'nullable|string|max:255',
            'password' => 'nullable|string|min:8',
            'is_regular_client' => 'nullable|boolean',
            'comment' => 'nullable|string',
        ]);

        if (!empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()->back()->with('success', 'Клиент обновлен успешно');
    }

    /**
     * Remove the specified client.
     */
    public function destroy(User $user)
    {
        // Ensure it's a client
        if ($user->role !== 'client') {
            return redirect()->back()->withErrors(['error' => 'Этот пользователь не является клиентом']);
        }

        $user->delete();

        return redirect()->back()->with('success', 'Клиент удален успешно');
    }

    /**
     * Toggle "Постоянный клиент" flag
     */
    public function toggleRegular(Request $request, User $user)
    {
        if ($user->role !== 'client') {
            return response()->json(['success' => false, 'error' => 'Этот пользователь не является клиентом'], 403);
        }

        $user->is_regular_client = !$user->is_regular_client;
        $user->save();

        return response()->json(['success' => true, 'is_regular_client' => $user->is_regular_client]);
    }

    /**
     * Generate a random password for a client (admins only).
     */
    public function generatePassword(Request $request, User $user)
    {
        if ($user->role !== 'client') {
            return response()->json(['success' => false, 'error' => 'Этот пользователь не является клиентом'], 403);
        }

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

