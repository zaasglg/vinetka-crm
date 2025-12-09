import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function ScheduleIndex({ auth, orders = [], allOrders = [], canCreateOrder = false, currentType = 'all' }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalDate, setModalDate] = useState(null);
    const [selectedOrderId, setSelectedOrderId] = useState('');
    const [createNewOrder, setCreateNewOrder] = useState(false);
    const [institutionType, setInstitutionType] = useState(currentType);
    const [newOrderData, setNewOrderData] = useState({
        name: '',
        phone: '',
        grade_level: '',
        institution_type: '',
        city: '',
        custom_city: '',
        comment: '',
    });

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

    const handleDayClick = (dateKey) => {
        setSelectedDate(dateKey);
    };

    const handleDayDoubleClick = (dateKey) => {
        setModalDate(dateKey);
        setSelectedOrderId('');
        setCreateNewOrder(false);
        setNewOrderData({
            name: '',
            phone: '',
            grade_level: '',
            institution_type: institutionType !== 'all' ? institutionType : '',
            city: '',
            custom_city: '',
            comment: '',
        });
        setIsModalOpen(true);
    };

    const handleTypeChange = (type) => {
        setInstitutionType(type);
        router.get('/schedule', { type }, { preserveState: true, replace: true });
    };

    const handleAddPhotoshoot = (e) => {
        e.preventDefault();
        if (!modalDate) return;

        const data = {
            date: modalDate,
        };

        if (createNewOrder) {
            // Создаём новую заявку
            if (!newOrderData.name) {
                alert('Укажите имя клиента');
                return;
            }
            Object.assign(data, newOrderData);
        } else {
            // Добавляем к существующей заявке
            if (!selectedOrderId) {
                alert('Выберите заявку');
                return;
            }
            data.order_id = selectedOrderId;
        }

        router.post('/schedule/add-photoshoot', data, {
            onSuccess: () => {
                setIsModalOpen(false);
                setModalDate(null);
                setSelectedOrderId('');
                setCreateNewOrder(false);
                setNewOrderData({
                    name: '',
                    phone: '',
                    grade_level: '',
                    institution_type: institutionType !== 'all' ? institutionType : '',
                    city: '',
                    custom_city: '',
                    comment: '',
                });
            },
        });
    };

    const handleRemovePhotoshoot = (orderId, date) => {
        if (confirm('Удалить эту съёмку из расписания?')) {
            router.post(`/schedule/remove-photoshoot/${orderId}`, {
                date,
            }, {
                onSuccess: () => {
                    // Обновляем выбранную дату
                    setSelectedDate(date);
                },
            });
        }
    };

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
                    onClick={() => handleDayClick(dateKey)}
                    onDoubleClick={() => handleDayDoubleClick(dateKey)}
                    className={`p-2 border border-neutral-100 min-h-[100px] cursor-pointer transition-colors ${
                        isToday ? 'bg-blue-50' : ''
                    } ${
                        isSelected ? 'ring-2 ring-neutral-900' : ''
                    } hover:bg-neutral-50`}
                    title="Двойной клик для добавления съёмки"
                >
                    <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-neutral-700'
                    }`}>
                        {day}
                    </div>
                    <div className="space-y-1">
                        {photoshoots.slice(0, 3).map((order, idx) => {
                            const isSchool = order.institution_type === 'school';
                            const isKindergarten = order.institution_type === 'kindergarten';
                            const bgColor = isSchool ? 'bg-blue-100 text-blue-700' : isKindergarten ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700';
                            const icon = isSchool ? '🏫' : isKindergarten ? '🎨' : '📸';
                            
                            return (
                                <div
                                    key={idx}
                                    className={`text-xs px-2 py-1 ${bgColor} rounded truncate`}
                                    title={`${order.name} - ${order.grade_level || 'Без класса'}`}
                                >
                                    {icon} {order.name}
                                </div>
                            );
                        })}
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
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-light text-neutral-900 mb-2">
                                Расписание съёмок
                            </h1>
                            <p className="text-neutral-600">
                                Календарь запланированных фотосессий. Двойной клик по дню для добавления съёмки
                            </p>
                        </div>
                    </div>
                    
                    {/* Type Toggle */}
                    <div className="flex gap-2 p-1 bg-white border border-neutral-200 rounded-lg inline-flex shadow-sm">
                        <button
                            type="button"
                            onClick={() => handleTypeChange('all')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                institutionType === 'all'
                                    ? 'bg-neutral-900 text-white shadow-sm'
                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                            }`}
                        >
                            Все
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('school')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                institutionType === 'school'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                            }`}
                        >
                            🏫 Школы
                        </button>
                        <button
                            type="button"
                            onClick={() => handleTypeChange('kindergarten')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                institutionType === 'kindergarten'
                                    ? 'bg-green-600 text-white shadow-sm'
                                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                            }`}
                        >
                            🎨 Садики
                        </button>
                    </div>
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
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-neutral-900">
                                            {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </h3>
                                        <button
                                            onClick={() => handleDayDoubleClick(selectedDate)}
                                            className="px-3 py-1.5 text-sm bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                                            title="Добавить съёмку"
                                        >
                                            + Добавить
                                        </button>
                                    </div>
                                    
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
                                                        <div className="flex gap-2">
                                                            <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                                                Заявка #{order.id}
                                                            </span>
                                                            <button
                                                                onClick={() => handleRemovePhotoshoot(order.id, selectedDate)}
                                                                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                                                                title="Удалить съёмку"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1 text-sm text-neutral-600">
                                                        <div>📞 {order.phone}</div>
                                                        {order.institution_type === 'school' && (
                                                            <div>🏫 {order.grade_level || 'Без класса'} класс</div>
                                                        )}
                                                        {order.institution_type === 'kindergarten' && (
                                                            <div>🎨 Детский сад</div>
                                                        )}
                                                        {!order.institution_type && (
                                                            <div>🏫 {order.grade_level || 'Без класса'}</div>
                                                        )}
                                                        <div>📍 {order.custom_city || order.city || '—'}</div>
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
                                        <div className="text-center py-8">
                                            <p className="text-neutral-500 text-sm mb-4">
                                                На эту дату нет запланированных съёмок
                                            </p>
                                            <button
                                                onClick={() => handleDayDoubleClick(selectedDate)}
                                                className="px-4 py-2 text-sm bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors"
                                            >
                                                Добавить съёмку
                                            </button>
                                        </div>
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

            {/* Modal for adding photoshoot */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                            <h2 className="text-xl font-medium text-neutral-900">
                                Добавить съёмку
                            </h2>
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setModalDate(null);
                                    setSelectedOrderId('');
                                    setCreateNewOrder(false);
                                    setNewOrderData({
                                        name: '',
                                        phone: '',
                                        grade_level: '',
                                        city: '',
                                        custom_city: '',
                                        comment: '',
                                    });
                                }}
                                className="text-neutral-400 hover:text-neutral-600"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleAddPhotoshoot} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-2">
                                    Дата съёмки
                                </label>
                                <input
                                    type="text"
                                    value={modalDate ? new Date(modalDate + 'T00:00:00').toLocaleDateString('ru-RU', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    }) : ''}
                                    disabled
                                    className="w-full px-4 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-600"
                                />
                            </div>

                            {/* Toggle between existing order and new order */}
                            {canCreateOrder && (
                                <div className="flex gap-2 p-1 bg-neutral-100 rounded-lg">
                                    <button
                                        type="button"
                                        onClick={() => setCreateNewOrder(false)}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            !createNewOrder
                                                ? 'bg-white text-neutral-900 shadow-sm'
                                                : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                    >
                                        Выбрать заявку
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setCreateNewOrder(true)}
                                        className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                            createNewOrder
                                                ? 'bg-white text-neutral-900 shadow-sm'
                                                : 'text-neutral-600 hover:text-neutral-900'
                                        }`}
                                    >
                                        Создать новую
                                    </button>
                                </div>
                            )}

                            {!createNewOrder ? (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                                        Выберите заявку
                                    </label>
                                    <select
                                        value={selectedOrderId}
                                        onChange={(e) => setSelectedOrderId(e.target.value)}
                                        className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                        required={!createNewOrder}
                                    >
                                        <option value="">Выберите заявку</option>
                                        {allOrders.map(order => (
                                            <option key={order.id} value={order.id}>
                                                {order.name} {order.phone ? `(${order.phone})` : ''} - {order.grade_level || 'Без класса'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Имя клиента <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={newOrderData.name}
                                            onChange={(e) => setNewOrderData({ ...newOrderData, name: e.target.value })}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                            required={createNewOrder}
                                            placeholder="Введите имя клиента"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Телефон
                                        </label>
                                        <input
                                            type="text"
                                            value={newOrderData.phone}
                                            onChange={(e) => setNewOrderData({ ...newOrderData, phone: e.target.value })}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                            placeholder="+7 777 123 4567"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Тип учреждения
                                            </label>
                                            <select
                                                value={newOrderData.institution_type}
                                                onChange={(e) => setNewOrderData({ ...newOrderData, institution_type: e.target.value })}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                            >
                                                <option value="">Выберите тип</option>
                                                <option value="school">🏫 Школа</option>
                                                <option value="kindergarten">🎨 Детский сад</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Класс / Группа
                                            </label>
                                            <input
                                                type="text"
                                                value={newOrderData.grade_level}
                                                onChange={(e) => setNewOrderData({ ...newOrderData, grade_level: e.target.value })}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                                placeholder={newOrderData.institution_type === 'kindergarten' ? 'Группа' : '11 класс'}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Город
                                            </label>
                                            <input
                                                type="text"
                                                value={newOrderData.city}
                                                onChange={(e) => setNewOrderData({ ...newOrderData, city: e.target.value })}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                                placeholder="Алматы"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                                                Другой город
                                            </label>
                                            <input
                                                type="text"
                                                value={newOrderData.custom_city}
                                                onChange={(e) => setNewOrderData({ ...newOrderData, custom_city: e.target.value })}
                                                className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                                placeholder="Укажите город"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                                            Комментарий
                                        </label>
                                        <textarea
                                            value={newOrderData.comment}
                                            onChange={(e) => setNewOrderData({ ...newOrderData, comment: e.target.value })}
                                            className="w-full px-4 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                                            rows={3}
                                            placeholder="Дополнительная информация"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsModalOpen(false);
                                        setModalDate(null);
                                        setSelectedOrderId('');
                                        setCreateNewOrder(false);
                                        setNewOrderData({
                                            name: '',
                                            phone: '',
                                            grade_level: '',
                                            institution_type: institutionType !== 'all' ? institutionType : '',
                                            city: '',
                                            custom_city: '',
                                            comment: '',
                                        });
                                    }}
                                    className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50"
                                >
                                    Отмена
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
                                >
                                    {createNewOrder ? 'Создать и добавить' : 'Добавить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
