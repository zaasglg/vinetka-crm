import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function AttendanceIndex({ auth, attendances, users = [], filters }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAttendance, setEditingAttendance] = useState(null);
    const [startDate, setStartDate] = useState(filters.start_date);
    const [endDate, setEndDate] = useState(filters.end_date);
    const [selectedUserId, setSelectedUserId] = useState(filters.user_id || '');

    const handleFilter = () => {
        router.get('/attendance', {
            start_date: startDate,
            end_date: endDate,
            user_id: selectedUserId || undefined,
        });
    };

    const handleEdit = (attendance) => {
        setEditingAttendance(attendance);
        setIsModalOpen(true);
    };

    const handleDelete = (id) => {
        if (confirm('Удалить эту запись?')) {
            router.delete(`/attendance/${id}`);
        }
    };

    const calculateWorkHours = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return '-';
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        const hours = (outH * 60 + outM - (inH * 60 + inM)) / 60;
        return hours.toFixed(1) + ' ч';
    };

    return (
        <AppLayout auth={auth}>
            <div className="p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-light text-neutral-900 mb-2">
                            Учёт рабочего времени
                        </h1>
                        <p className="text-neutral-600">
                            Отметки прихода и ухода сотрудников
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAttendance(null);
                            setIsModalOpen(true);
                        }}
                        className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                    >
                        Добавить запись
                    </button>
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

                {/* Table */}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-neutral-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Дата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Сотрудник</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Приход</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Уход</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Часов</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase">Заметки</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase">Действия</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200">
                            {attendances.data?.map((attendance) => (
                                <tr key={attendance.id} className="hover:bg-neutral-50">
                                    <td className="px-6 py-4 text-sm text-neutral-900">
                                        {new Date(attendance.date).toLocaleDateString('ru-RU')}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-neutral-900">
                                        {attendance.user?.name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-900">
                                        {attendance.check_in || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-900">
                                        {attendance.check_out || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-900">
                                        {calculateWorkHours(attendance.check_in, attendance.check_out)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-neutral-600">
                                        {attendance.notes || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-right text-sm">
                                        <button
                                            onClick={() => handleEdit(attendance)}
                                            className="text-neutral-600 hover:text-neutral-900 mr-4"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            onClick={() => handleDelete(attendance.id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {(!attendances.data || attendances.data.length === 0) && (
                        <div className="px-6 py-12 text-center text-neutral-500">
                            Нет записей за выбранный период
                        </div>
                    )}
                    
                    {/* Pagination */}
                    {attendances.last_page > 1 && (
                        <div className="px-6 py-4 border-t border-neutral-200 flex items-center justify-between">
                            <div className="text-sm text-neutral-600">
                                Показано {attendances.from} - {attendances.to} из {attendances.total}
                            </div>
                            <div className="flex gap-2">
                                {attendances.links?.map((link, index) => (
                                    <button
                                        key={index}
                                        onClick={() => link.url && router.visit(link.url)}
                                        disabled={!link.url}
                                        className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                            link.active
                                                ? 'bg-neutral-900 text-white'
                                                : link.url
                                                ? 'bg-white text-neutral-700 border border-neutral-300 hover:bg-neutral-50'
                                                : 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <AttendanceModal
                    attendance={editingAttendance}
                    users={users}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingAttendance(null);
                    }}
                />
            )}
        </AppLayout>
    );
}

function AttendanceModal({ attendance, users, onClose }) {
    const [formData, setFormData] = useState({
        user_id: attendance?.user_id || '',
        date: attendance?.date || new Date().toISOString().split('T')[0],
        check_in: attendance?.check_in || '',
        check_out: attendance?.check_out || '',
        notes: attendance?.notes || '',
    });
    const [errors, setErrors] = useState({});

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (attendance) {
            router.put(`/attendance/${attendance.id}`, formData, {
                onSuccess: () => onClose(),
                onError: (errs) => setErrors(errs),
            });
        } else {
            router.post('/attendance', formData, {
                onSuccess: () => onClose(),
                onError: (errs) => setErrors(errs),
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-neutral-900">
                        {attendance ? 'Редактировать запись' : 'Добавить запись'}
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {errors.error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                            {errors.error}
                        </div>
                    )}
                    
                    {!attendance && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                Сотрудник
                            </label>
                            <select
                                value={formData.user_id}
                                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                required
                            >
                                <option value="">Выберите сотрудника</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>{user.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Дата
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            required
                            disabled={!!attendance}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Время прихода
                        </label>
                        <input
                            type="time"
                            value={formData.check_in}
                            onChange={(e) => setFormData({ ...formData, check_in: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Время ухода
                        </label>
                        <input
                            type="time"
                            value={formData.check_out}
                            onChange={(e) => setFormData({ ...formData, check_out: e.target.value })}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Заметки
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            placeholder="Опоздание, отгул и т.д."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
                        >
                            Сохранить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
