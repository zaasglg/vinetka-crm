<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));
        $userId = $request->get('user_id');

        $query = Attendance::with('user')
            ->whereBetween('date', [$startDate, $endDate])
            ->orderBy('date', 'desc')
            ->orderBy('user_id');

        if ($userId) {
            $query->where('user_id', $userId);
        }

        $attendances = $query->paginate(20);

        $users = User::whereIn('role', ['super_admin', 'admin', 'sales_manager', 'photographer', 'editor', 'print_operator'])
            ->orderBy('name')
            ->get();

        return Inertia::render('Attendance/Index', [
            'attendances' => $attendances,
            'users' => $users,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'user_id' => $userId,
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'date' => 'required|date',
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        // Check if attendance already exists for this user and date
        $existing = Attendance::where('user_id', $validated['user_id'])
            ->whereDate('date', $validated['date'])
            ->first();

        if ($existing) {
            // If trying to add check_in when already exists, return error
            if (!empty($validated['check_in']) && !empty($existing->check_in)) {
                return redirect()->back()->withErrors(['error' => 'Сотрудник уже отметился на эту дату']);
            }
            
            // Update existing record (e.g., adding check_out)
            $updateData = [];
            if (!empty($validated['check_out'])) {
                $updateData['check_out'] = $validated['check_out'];
            }
            if (!empty($validated['notes'])) {
                $updateData['notes'] = $validated['notes'];
            }
            
            if (!empty($updateData)) {
                $existing->update($updateData);
            }
            
            return redirect()->back()->with('success', 'Запись обновлена');
        } else {
            // Create new record only if check_in is provided
            if (empty($validated['check_in'])) {
                return redirect()->back()->withErrors(['error' => 'Укажите время прихода']);
            }
            
            Attendance::create([
                'user_id' => $validated['user_id'],
                'date' => $validated['date'],
                'check_in' => $validated['check_in'],
                'check_out' => $validated['check_out'],
                'notes' => $validated['notes'],
            ]);
            
            return redirect()->back()->with('success', 'Запись добавлена');
        }
    }

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'check_in' => 'nullable|date_format:H:i',
            'check_out' => 'nullable|date_format:H:i',
            'notes' => 'nullable|string',
        ]);

        $attendance->update($validated);

        return redirect()->back()->with('success', 'Запись обновлена');
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();

        return redirect()->back()->with('success', 'Запись удалена');
    }

    public function report(Request $request)
    {
        $startDate = $request->get('start_date', now()->startOfMonth()->format('Y-m-d'));
        $endDate = $request->get('end_date', now()->endOfMonth()->format('Y-m-d'));
        $userId = $request->get('user_id');

        $query = User::whereIn('role', ['super_admin', 'admin', 'sales_manager', 'photographer', 'editor', 'print_operator'])
            ->with(['attendances' => function ($q) use ($startDate, $endDate) {
                $q->whereBetween('date', [$startDate, $endDate])
                  ->orderBy('date');
            }])
            ->orderBy('name');

        if ($userId) {
            $query->where('id', $userId);
        }

        $users = $query->get();

        return Inertia::render('Attendance/Report', [
            'users' => $users,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'user_id' => $userId,
            ],
        ]);
    }
}
