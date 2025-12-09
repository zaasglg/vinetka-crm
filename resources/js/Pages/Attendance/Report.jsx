import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AttendanceReport({ auth, users = [], days = [], filters }) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [selectedUserId, setSelectedUserId] = useState(filters.user_id || '');

    const handleFilter = () => {
        router.get('/attendance/report', {
            start_date: startDate,
            end_date: endDate,
            user_id: selectedUserId || undefined,
        });
    };

    const calculateWorkHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return null;
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        return (outH * 60 + outM - (inH * 60 + inM)) / 60;
    };

    // Вычисляем общее количество часов для каждого сотрудника
    const calculateTotalHours = (user) => {
        let total = 0;
        Object.values(user.attendances || {}).forEach(attendance => {
            if (attendance.check_in && attendance.check_out) {
                const hours = calculateWorkHours(attendance.check_in, attendance.check_out);
                if (hours !== null) {
                    total += hours;
                }
            }
        });
        return total;
    };

    // Получаем всех пользователей для фильтра
    const allUsersForFilter = users.map(u => ({ id: u.id, name: u.name }));

    return (
        <AppLayout auth={auth}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-neutral-900 mb-2">
                        Отчёт по рабочему времени
                    </h1>
                    <p className="text-neutral-600">
                        Календарная таблица отметок сотрудников
                    </p>
                </div>

                {/* Filters */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Дата начала
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Дата окончания
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Сотрудник
                            </label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => setSelectedUserId(e.target.value)}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            >
                                <option value="">Все сотрудники</option>
                                {allUsersForFilter.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleFilter}
                                className="w-full px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                            >
                                Применить
                            </button>
                        </div>
                    </div>
                </div>

                {/* Calendar Table */}
                {users.length > 0 && days.length > 0 ? (
                    <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead>
                                    {/* Header row with days */}
                                    <tr>
                                        <th className="sticky left-0 z-20 bg-neutral-100 border-r-2 border-b-2 border-neutral-300 px-4 py-3 text-left text-sm font-semibold text-neutral-900 min-w-[200px] shadow-sm">
                                            Сотрудник
                                        </th>
                                        {days.map((day, index) => (
                                            <th
                                                key={index}
                                                className="bg-neutral-50 border-b-2 border-r border-neutral-200 px-2 py-2 text-center min-w-[110px]"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-neutral-500 text-[10px] font-medium uppercase mb-0.5">
                                                        {day.day_name_ru}
                                                    </span>
                                                    <span className="text-neutral-900 font-bold text-sm mb-0.5">
                                                        {day.day}
                                                    </span>
                                                    <span className="text-neutral-600 text-[9px] font-medium">
                                                        {day.month_name_ru}
                                                    </span>
                                                </div>
                                            </th>
                                        ))}
                                        <th className="bg-neutral-100 border-b-2 border-r-2 border-neutral-300 px-4 py-3 text-center text-sm font-semibold text-neutral-900 min-w-[120px]">
                                            Итого
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, userIndex) => (
                                        <tr 
                                            key={user.id} 
                                            className={userIndex % 2 === 0 ? 'bg-white hover:bg-neutral-50' : 'bg-neutral-50 hover:bg-neutral-100'}
                                        >
                                            {/* Employee name column */}
                                            <td className="sticky left-0 z-10 bg-inherit border-r-2 border-b border-neutral-200 px-4 py-3 font-medium text-neutral-900 min-w-[200px] shadow-sm">
                                                <div>
                                                    <div className="font-semibold text-sm">{user.name}</div>
                                                    <div className="text-xs text-neutral-500 mt-0.5">{user.email}</div>
                                                </div>
                                            </td>
                                            
                                            {/* Days columns */}
                                            {days.map((day, dayIndex) => {
                                                const attendance = user.attendances[day.date] || null;
                                                const hours = attendance 
                                                    ? calculateWorkHours(attendance.check_in, attendance.check_out)
                                                    : null;
                                                
                                                return (
                                                    <td
                                                        key={dayIndex}
                                                        className="border-r border-b border-neutral-200 px-2 py-3 text-center text-xs align-top"
                                                    >
                                                        {attendance ? (
                                                            <div className="space-y-1.5">
                                                                {attendance.check_in && (
                                                                    <div className="text-blue-700 font-semibold text-[11px]">
                                                                        Приход: {attendance.check_in}
                                                                    </div>
                                                                )}
                                                                {attendance.check_out && (
                                                                    <div className="text-red-700 font-semibold text-[11px]">
                                                                        Уход: {attendance.check_out}
                                                                    </div>
                                                                )}
                                                                {hours !== null && hours > 0 && (
                                                                    <div className="text-neutral-700 font-medium text-[10px] mt-1.5 pt-1 border-t border-neutral-200">
                                                                        {hours.toFixed(1)} ч
                                                                    </div>
                                                                )}
                                                                {!attendance.check_in && !attendance.check_out && (
                                                                    <div className="text-neutral-400 text-[10px]">
                                                                        —
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-neutral-200">—</div>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            {/* Total hours column */}
                                            <td className="border-r-2 border-b border-neutral-200 px-3 py-3 text-center font-bold text-neutral-900 bg-neutral-50 min-w-[120px]">
                                                <div className="text-sm">
                                                    <span className="text-blue-700">{calculateTotalHours(user).toFixed(1)} ч</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white border border-neutral-200 rounded-lg px-6 py-12 text-center text-neutral-500">
                        Нет данных для отображения
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
