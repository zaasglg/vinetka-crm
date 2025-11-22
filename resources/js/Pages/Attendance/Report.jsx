import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AttendanceReport({ auth, users = [], filters }) {
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [selectedUserId, setSelectedUserId] = useState(filters.user_id || '');
    // Track which user panels are open in the accordion
    const [openUserIds, setOpenUserIds] = useState([]);

    const toggleUser = (userId) => {
        setOpenUserIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const handleFilter = () => {
        router.get('/attendance/report', {
            start_date: startDate,
            end_date: endDate,
            user_id: selectedUserId || undefined,
        });
    };

    const calculateWorkHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        return (outH * 60 + outM - (inH * 60 + inM)) / 60;
    };

    const getTotalHours = (attendances) => {
        return attendances.reduce((sum, att) => {
            return sum + calculateWorkHours(att.check_in, att.check_out);
        }, 0).toFixed(1);
    };

    const getWorkDays = (attendances) => {
        return attendances.filter(att => att.check_in && att.check_out).length;
    };

    return (
        <AppLayout auth={auth}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-neutral-900 mb-2">
                        Отчёт по рабочему времени
                    </h1>
                    <p className="text-neutral-600">
                        Детальный отчёт по каждому сотруднику
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
                                {users.map(user => (
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

                {/* Report */}
                <div className="space-y-6">
                    {users.map(user => {
                        const isOpen = openUserIds.includes(user.id);
                        return (
                            <div key={user.id} className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                                {/* Accordion header */}
                                <button
                                    type="button"
                                    onClick={() => toggleUser(user.id)}
                                    className="w-full text-left px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between hover:bg-neutral-100"
                                    aria-expanded={isOpen}
                                >
                                    <div>
                                        <h3 className="text-lg font-medium text-neutral-900">{user.name}</h3>
                                        <p className="text-sm text-neutral-600">{user.email}</p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="text-sm text-neutral-600">Рабочих дней</div>
                                            <div className="text-2xl font-light text-neutral-900">
                                                {getWorkDays(user.attendances)}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-neutral-600">Всего часов</div>
                                            <div className="text-2xl font-light text-neutral-900">
                                                {getTotalHours(user.attendances)} ч
                                            </div>
                                        </div>

                                        <svg
                                            className={`w-5 h-5 text-neutral-500 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                                            viewBox="0 0 20 20"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path d="M5 8L10 13L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Accordion content */}
                                {isOpen ? (
                                    user.attendances && user.attendances.length > 0 ? (
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-neutral-50 border-b border-neutral-200">
                                                    <tr>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                                                            Дата
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                                                            День недели
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                                                            Приход
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                                                            Уход
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                                                            Часов
                                                        </th>
                                                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">
                                                            Заметки
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-neutral-200">
                                                    {user.attendances.map((attendance) => {
                                                        const date = new Date(attendance.date);
                                                        const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'short' });
                                                        const hours = calculateWorkHours(attendance.check_in, attendance.check_out);
                                                        
                                                        return (
                                                            <tr key={attendance.id} className="hover:bg-neutral-50">
                                                                <td className="px-6 py-3 text-sm text-neutral-900">
                                                                    {date.toLocaleDateString('ru-RU')}
                                                                </td>
                                                                <td className="px-6 py-3 text-sm text-neutral-600 capitalize">
                                                                    {dayOfWeek}
                                                                </td>
                                                                <td className="px-6 py-3 text-sm text-neutral-900">
                                                                    {attendance.check_in || '-'}
                                                                </td>
                                                                <td className="px-6 py-3 text-sm text-neutral-900">
                                                                    {attendance.check_out || '-'}
                                                                </td>
                                                                <td className="px-6 py-3 text-sm font-medium text-neutral-900">
                                                                    {hours > 0 ? hours.toFixed(1) + ' ч' : '-'}
                                                                </td>
                                                                <td className="px-6 py-3 text-sm text-neutral-600">
                                                                    {attendance.notes || '-'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="px-6 py-8 text-center text-neutral-500">
                                            Нет записей за выбранный период
                                        </div>
                                    )
                                ) : null}
                            </div>
                        );
                    })}

                    {users.length === 0 && (
                        <div className="bg-white border border-neutral-200 rounded-lg px-6 py-12 text-center text-neutral-500">
                            Нет данных для отображения
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
