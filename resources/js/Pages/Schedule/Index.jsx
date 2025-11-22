import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';

export default function ScheduleIndex({ auth, orders = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    // Get calendar data
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    // Process photoshoot dates from orders
    const photoshootsByDate = {};
    orders.forEach(order => {
        if (order.photoshoot_dates && Array.isArray(order.photoshoot_dates)) {
            order.photoshoot_dates.forEach(date => {
                const dateKey = new Date(date).toISOString().split('T')[0];
                if (!photoshootsByDate[dateKey]) {
                    photoshootsByDate[dateKey] = [];
                }
                photoshootsByDate[dateKey].push(order);
            });
        }
    });

    const previousMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const today = new Date();
    const todayString = today.toISOString().split('T')[0];

    const renderCalendar = () => {
        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            days.push(<div key={`empty-${i}`} className="p-2 border border-neutral-100"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateKey = date.toISOString().split('T')[0];
            const photoshoots = photoshootsByDate[dateKey] || [];
            const isToday = dateKey === todayString;
            const isSelected = selectedDate === dateKey;

            days.push(
                <div
                    key={day}
                    onClick={() => setSelectedDate(dateKey)}
                    className={`p-2 border border-neutral-100 min-h-[100px] cursor-pointer transition-colors ${
                        isToday ? 'bg-blue-50' : ''
                    } ${
                        isSelected ? 'ring-2 ring-neutral-900' : ''
                    } hover:bg-neutral-50`}
                >
                    <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-neutral-700'
                    }`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {photoshoots.slice(0, 3).map((order, idx) => (
                            <div
                                key={idx}
                                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded truncate"
                                title={`${order.name} - ${order.grade_level} класс`}
                            >
                                📸 {order.name}
                            </div>
                        ))}
                        {photoshoots.length > 3 && (
                            <div className="text-xs text-neutral-500 px-2">
                                +{photoshoots.length - 3} ещё
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return days;
    };

    const selectedPhotoshoots = selectedDate ? (photoshootsByDate[selectedDate] || []) : [];

    return (
        <AppLayout auth={auth}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-light text-neutral-900 mb-2">
                        Расписание съёмок
                    </h1>
                    <p className="text-neutral-600">
                        Календарь запланированных фотосессий
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                            {/* Calendar Header */}
                            <div className="px-6 py-4 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                                <button
                                    onClick={previousMonth}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h2 className="text-xl font-medium text-neutral-900">
                                    {monthNames[month]} {year}
                                </h2>
                                <button
                                    onClick={nextMonth}
                                    className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            {/* Day names */}
                            <div className="grid grid-cols-7 bg-neutral-50">
                                {dayNames.map((day) => (
                                    <div key={day} className="px-2 py-3 text-center text-sm font-medium text-neutral-600 border-b border-neutral-200">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            {/* Calendar grid */}
                            <div className="grid grid-cols-7">
                                {renderCalendar()}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Selected Date Details */}
                    <div className="lg:col-span-1">
                        <div className="bg-white border border-neutral-200 rounded-lg p-6 sticky top-8">
                            {selectedDate ? (
                                <>
                                    <h3 className="text-lg font-medium text-neutral-900 mb-4">
                                        {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </h3>
                                    
                                    {selectedPhotoshoots.length > 0 ? (
                                        <div className="space-y-3">
                                            {selectedPhotoshoots.map((order) => (
                                                <div
                                                    key={order.id}
                                                    className="p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="font-medium text-neutral-900">
                                                            {order.name}
                                                        </div>
                                                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                            Заявка #{order.id}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1 text-sm text-neutral-600">
                                                        <div>📞 {order.phone}</div>
                                                        <div>🏫 {order.grade_level} класс</div>
                                                        <div>📍 {order.custom_city || order.city}</div>
                                                        {order.photographer && (
                                                            <div className="mt-2 pt-2 border-t border-neutral-100">
                                                                👤 Фотограф: {order.photographer.name}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-neutral-500 text-sm">
                                            На эту дату нет запланированных съёмок
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="text-center py-8">
                                    <div className="text-4xl mb-2">📅</div>
                                    <p className="text-neutral-500 text-sm">
                                        Выберите дату для просмотра съёмок
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6 mt-6">
                            <h3 className="text-lg font-medium text-neutral-900 mb-4">
                                Статистика месяца
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600">Всего съёмок:</span>
                                    <span className="font-medium text-neutral-900">
                                        {Object.keys(photoshootsByDate).filter(date => {
                                            const d = new Date(date);
                                            return d.getMonth() === month && d.getFullYear() === year;
                                        }).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600">Заявок с датами:</span>
                                    <span className="font-medium text-neutral-900">
                                        {orders.filter(o => o.photoshoot_dates && o.photoshoot_dates.length > 0).length}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-neutral-600">Без даты съёмки:</span>
                                    <span className="font-medium text-neutral-900">
                                        {orders.filter(o => !o.photoshoot_dates || o.photoshoot_dates.length === 0).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
