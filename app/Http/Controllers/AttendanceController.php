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

        // Генерируем список всех дней в периоде
        $days = [];
        $currentDate = \Carbon\Carbon::parse($startDate);
        $endDateCarbon = \Carbon\Carbon::parse($endDate);
        
        $dayNamesRu = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
        $dayNamesRuShort = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
        $monthNamesRu = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        $monthNamesRuShort = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
        
        while ($currentDate->lte($endDateCarbon)) {
            $dayOfWeek = $currentDate->dayOfWeek; // 0 = воскресенье, 1 = понедельник...
            $dayIndex = $dayOfWeek == 0 ? 6 : $dayOfWeek - 1; // Преобразуем в 0-6 где 0 = понедельник
            $monthIndex = $currentDate->month - 1; // 0-11 для массива
            
            $days[] = [
                'date' => $currentDate->format('Y-m-d'),
                'day' => $currentDate->format('d'),
                'day_name' => $currentDate->format('D'),
                'day_name_ru' => $dayNamesRuShort[$dayIndex],
                'month_name_ru' => $monthNamesRuShort[$monthIndex],
            ];
            $currentDate->addDay();
        }

        // Преобразуем attendances в удобный формат для таблицы
        $usersWithAttendances = $users->map(function ($user) {
            $attendancesMap = [];
            foreach ($user->attendances as $attendance) {
                // Форматируем дату в строку Y-m-d
                $dateKey = is_string($attendance->date) 
                    ? $attendance->date 
                    : \Carbon\Carbon::parse($attendance->date)->format('Y-m-d');
                
                $attendancesMap[$dateKey] = [
                    'check_in' => $attendance->check_in,
                    'check_out' => $attendance->check_out,
                    'notes' => $attendance->notes,
                ];
            }
            
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'attendances' => $attendancesMap,
            ];
        });

        return Inertia::render('Attendance/Report', [
            'users' => $usersWithAttendances,
            'days' => $days,
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'user_id' => $userId,
            ],
        ]);
    }

    /**
     * Страница для самостоятельной отметки сотрудника
     */
    public function myAttendance()
    {
        $user = auth()->user();
        
        // Админы не могут отмечаться самостоятельно
        if (in_array($user->role, ['super_admin', 'admin'])) {
            abort(403, 'Администраторы не могут отмечаться самостоятельно');
        }
        
        $today = now()->format('Y-m-d');
        
        // Получаем отметку на сегодня
        $todayAttendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        // Получаем последние 30 дней отметок
        $recentAttendances = Attendance::where('user_id', $user->id)
            ->where('date', '>=', now()->subDays(30)->format('Y-m-d'))
            ->orderBy('date', 'desc')
            ->get();

        return Inertia::render('Attendance/MyAttendance', [
            'todayAttendance' => $todayAttendance,
            'recentAttendances' => $recentAttendances,
        ]);
    }

    /**
     * Отметка прихода (check-in)
     */
    public function checkIn()
    {
        $user = auth()->user();
        
        // Админы не могут отмечаться самостоятельно
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return redirect()->back()->withErrors(['error' => 'Администраторы не могут отмечаться самостоятельно']);
        }
        
        $today = now()->format('Y-m-d');
        $currentTime = now()->format('H:i');

        // Проверяем, не отметился ли уже сегодня
        $existing = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if ($existing && $existing->check_in) {
            return redirect()->back()->withErrors(['error' => 'Вы уже отметились сегодня']);
        }

        if ($existing) {
            // Обновляем существующую запись
            $existing->update(['check_in' => $currentTime]);
            return redirect()->back()->with('success', 'Время прихода обновлено: ' . $currentTime);
        } else {
            // Создаём новую запись
            Attendance::create([
                'user_id' => $user->id,
                'date' => $today,
                'check_in' => $currentTime,
            ]);
            return redirect()->back()->with('success', 'Вы отметились на работу: ' . $currentTime);
        }
    }

    /**
     * Отметка ухода (check-out)
     */
    public function checkOut()
    {
        $user = auth()->user();
        
        // Админы не могут отмечаться самостоятельно
        if (in_array($user->role, ['super_admin', 'admin'])) {
            return redirect()->back()->withErrors(['error' => 'Администраторы не могут отмечаться самостоятельно']);
        }
        
        $today = now()->format('Y-m-d');
        $currentTime = now()->format('H:i');

        // Проверяем, есть ли отметка прихода
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('date', $today)
            ->first();

        if (!$attendance) {
            return redirect()->back()->withErrors(['error' => 'Сначала отметьтесь на приход']);
        }

        if (!$attendance->check_in) {
            return redirect()->back()->withErrors(['error' => 'Сначала отметьтесь на приход']);
        }

        if ($attendance->check_out) {
            return redirect()->back()->withErrors(['error' => 'Вы уже отметились на уход сегодня']);
        }

        $attendance->update(['check_out' => $currentTime]);

        // Вычисляем отработанные часы
        $checkIn = \Carbon\Carbon::parse($attendance->check_in);
        $checkOut = \Carbon\Carbon::parse($currentTime);
        $hours = $checkOut->diffInMinutes($checkIn) / 60;

        return redirect()->back()->with('success', 'Вы отметились на уход: ' . $currentTime . ' (отработано: ' . number_format($hours, 1) . ' ч)');
    }
}
