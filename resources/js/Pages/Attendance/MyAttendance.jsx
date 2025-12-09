import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function MyAttendance({ auth, todayAttendance, recentAttendances }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckIn = () => {
        if (confirm('Отметить приход на работу?')) {
            setIsLoading(true);
            router.post('/attendance/check-in', {}, {
                onFinish: () => setIsLoading(false),
            });
        }
    };

    const handleCheckOut = () => {
        if (confirm('Отметить уход с работы?')) {
            setIsLoading(true);
            router.post('/attendance/check-out', {}, {
                onFinish: () => setIsLoading(false),
            });
        }
    };

    const calculateWorkHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return null;
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        const hours = (outH * 60 + outM - (inH * 60 + inM)) / 60;
        return hours.toFixed(1);
    };

    const getStatusColor = (attendance) => {
        if (!attendance) return 'text-neutral-500';
        if (attendance.check_in && attendance.check_out) return 'text-green-600';
        if (attendance.check_in) return 'text-blue-600';
        return 'text-neutral-500';
    };

    const getStatusText = (attendance) => {
        if (!attendance) return 'Не отмечен';
        if (attendance.check_in && attendance.check_out) return 'Завершён';
        if (attendance.check_in) return 'На работе';
        return 'Не отмечен';
    };

    return (
        <AppLayout auth={auth}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-neutral-900 mb-2">
                        Моя отметка
                    </h1>
                    <p className="text-neutral-600">
                        Отмечайте приход и уход с работы
                    </p>
                </div>

                {/* Today's Status Card */}
                <div className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-xl font-medium text-neutral-900 mb-1">
                                Сегодня ({new Date().toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })})
                            </h2>
                            <p className={`text-lg font-medium ${getStatusColor(todayAttendance)}`}>
                                {getStatusText(todayAttendance)}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-4xl font-light text-neutral-900">
                                {new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>

                    {/* Today's Times */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-neutral-50 rounded-lg p-4">
                            <div className="text-sm text-neutral-600 mb-1">Время прихода</div>
                            <div className="text-2xl font-medium text-neutral-900">
                                {todayAttendance?.check_in || '—'}
                            </div>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-4">
                            <div className="text-sm text-neutral-600 mb-1">Время ухода</div>
                            <div className="text-2xl font-medium text-neutral-900">
                                {todayAttendance?.check_out || '—'}
                            </div>
                        </div>
                    </div>

                    {/* Work Hours */}
                    {todayAttendance?.check_in && todayAttendance?.check_out && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                            <div className="text-sm text-green-700 mb-1">Отработано сегодня</div>
                            <div className="text-2xl font-medium text-green-900">
                                {calculateWorkHours(todayAttendance.check_in, todayAttendance.check_out)} ч
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={handleCheckIn}
                            disabled={isLoading || (todayAttendance?.check_in && !todayAttendance?.check_out)}
                            className={`flex-1 px-6 py-4 rounded-lg font-medium transition-colors ${
                                todayAttendance?.check_in && !todayAttendance?.check_out
                                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        >
                            {todayAttendance?.check_in ? '✓ Приход отмечен' : 'Отметить приход'}
                        </button>
                        <button
                            onClick={handleCheckOut}
                            disabled={isLoading || !todayAttendance?.check_in || todayAttendance?.check_out}
                            className={`flex-1 px-6 py-4 rounded-lg font-medium transition-colors ${
                                !todayAttendance?.check_in || todayAttendance?.check_out
                                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                        >
                            {todayAttendance?.check_out ? '✓ Уход отмечен' : 'Отметить уход'}
                        </button>
                    </div>
                </div>

                {/* Recent Attendances */}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="px-6 py-4 border-b border-neutral-200">
                        <h2 className="text-lg font-medium text-neutral-900">
                            История отметок (последние 30 дней)
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Дата</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Приход</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Уход</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Часов</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Статус</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {recentAttendances.length > 0 ? (
                                    recentAttendances.map((attendance) => {
                                        const hours = calculateWorkHours(attendance.check_in, attendance.check_out);
                                        return (
                                            <tr key={attendance.id} className="hover:bg-neutral-50">
                                                <td className="px-6 py-4 text-sm text-neutral-900">
                                                    {new Date(attendance.date).toLocaleDateString('ru-RU', {
                                                        weekday: 'short',
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-900">
                                                    {attendance.check_in || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-900">
                                                    {attendance.check_out || '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-neutral-900">
                                                    {hours ? hours + ' ч' : '—'}
                                                </td>
                                                <td className="px-6 py-4 text-sm">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                        attendance.check_in && attendance.check_out
                                                            ? 'bg-green-100 text-green-700'
                                                            : attendance.check_in
                                                            ? 'bg-blue-100 text-blue-700'
                                                            : 'bg-neutral-100 text-neutral-600'
                                                    }`}>
                                                        {attendance.check_in && attendance.check_out
                                                            ? 'Завершён'
                                                            : attendance.check_in
                                                            ? 'На работе'
                                                            : 'Не завершён'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-neutral-500">
                                            Нет записей
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

