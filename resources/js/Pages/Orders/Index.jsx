import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import OrderModal from './OrderModal';

export default function OrdersIndex({ auth, orders = [], users = [], filters = {}, sort = { by: 'created_at', order: 'desc' } }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Filters state
    const [q, setQ] = useState(filters.q || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');
    const [photographerFilter, setPhotographerFilter] = useState(filters.assigned_photographer_id || '');
    const [editorFilter, setEditorFilter] = useState(filters.assigned_editor_id || '');
    const [minPrice, setMinPrice] = useState(filters.min_price || '');
    const [maxPrice, setMaxPrice] = useState(filters.max_price || '');
    const [sortBy, setSortBy] = useState(sort.by || 'created_at');
    const [sortOrder, setSortOrder] = useState(sort.order || 'desc');

    const workflowStages = {
        'new_request': 'Получена заявка',
        'photoshoot_scheduled': 'Назначена съёмка',
        'photoshoot_in_progress': 'Съёмка в процессе',
        'photoshoot_completed': 'Съёмка завершена',
        'editing': 'Обработка фото',
        'layout': 'Создание макета',
        'printing': 'Печать',
        'payment': 'Оплата',
        'delivery': 'Доставка',
        'completed': 'Завершено',
    };

    const stageColors = {
        'new_request': 'bg-blue-50 text-blue-700 border-blue-200',
        'photoshoot_scheduled': 'bg-purple-50 text-purple-700 border-purple-200',
        'photoshoot_in_progress': 'bg-indigo-50 text-indigo-700 border-indigo-200',
        'photoshoot_completed': 'bg-cyan-50 text-cyan-700 border-cyan-200',
        'editing': 'bg-amber-50 text-amber-700 border-amber-200',
        'layout': 'bg-orange-50 text-orange-700 border-orange-200',
        'printing': 'bg-pink-50 text-pink-700 border-pink-200',
        'payment': 'bg-teal-50 text-teal-700 border-teal-200',
        'delivery': 'bg-lime-50 text-lime-700 border-lime-200',
        'completed': 'bg-green-50 text-green-700 border-green-200',
    };

    const priorityColors = {
        'low': 'bg-gray-100 text-gray-700 border-gray-300',
        'normal': 'bg-blue-100 text-blue-700 border-blue-300',
        'high': 'bg-orange-100 text-orange-700 border-orange-300',
        'urgent': 'bg-red-100 text-red-700 border-red-300',
    };

    const priorityLabels = {
        'low': 'Низкий',
        'normal': 'Обычный',
        'high': 'Высокий',
        'urgent': 'Срочный',
    };

    const handleView = (order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleDelete = (orderId) => {
        if (confirm('Вы уверены, что хотите удалить эту заявку?')) {
            router.delete(`/orders/${orderId}`);
        }
    };

    const handleFilter = () => {
        const params = {};
        if (q) params.q = q;
        if (statusFilter) params.status = statusFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (photographerFilter) params.assigned_photographer_id = photographerFilter;
        if (editorFilter) params.assigned_editor_id = editorFilter;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        // Сохраняем текущую сортировку при применении фильтров
        params.sort_by = sortBy;
        params.sort_order = sortOrder;

        router.get('/orders', params, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setQ(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setPhotographerFilter(''); setEditorFilter(''); setMinPrice(''); setMaxPrice('');
        setSortBy('created_at');
        setSortOrder('desc');
        router.get('/orders', {}, { preserveState: true, replace: true });
    };

    const handleSortChange = (newSortBy) => {
        const newSortOrder = (sortBy === newSortBy && sortOrder === 'desc') ? 'asc' : 'desc';
        setSortBy(newSortBy);
        setSortOrder(newSortOrder);
        
        const params = {};
        if (q) params.q = q;
        if (statusFilter) params.status = statusFilter;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (photographerFilter) params.assigned_photographer_id = photographerFilter;
        if (editorFilter) params.assigned_editor_id = editorFilter;
        if (minPrice) params.min_price = minPrice;
        if (maxPrice) params.max_price = maxPrice;
        params.sort_by = newSortBy;
        params.sort_order = newSortOrder;

        router.get('/orders', params, { preserveState: true, replace: true });
    };

    const getLocationsString = (locations) => {
        if (!locations || !Array.isArray(locations)) return '-';
        return locations.join(', ');
    };

    const [openDropdown, setOpenDropdown] = useState(null);

    return (
        <AppLayout auth={auth}>
            <div className="p-6 bg-neutral-50 min-h-screen">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-light text-neutral-900 mb-1">
                            Управление заявками
                        </h1>
                        <p className="text-neutral-500 text-sm">
                            Всего заявок: <span className="font-medium text-neutral-700">{orders.length}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-neutral-700">Сортировка:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => handleSortChange(e.target.value)}
                                className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm bg-white"
                            >
                                <option value="created_at">По дате</option>
                                <option value="priority">По приоритету</option>
                            </select>
                            <button
                                onClick={() => handleSortChange(sortBy)}
                                className="p-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                                title={sortOrder === 'desc' ? 'По убыванию' : 'По возрастанию'}
                            >
                                {sortOrder === 'desc' ? (
                                    <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats - Compact */}
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-3 mb-6">
                    {Object.entries(workflowStages).map(([stage, name]) => {
                        const count = orders.filter(o => o.current_stage === stage).length;
                        return (
                            <div key={stage} className="bg-white border border-neutral-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
                                <p className="text-xs text-neutral-500 mb-1 truncate">{name}</p>
                                <p className="text-xl font-semibold text-neutral-900">{count}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Filters - Improved Design */}
                <div className="bg-white border border-neutral-200 rounded-lg shadow-sm mb-6 overflow-hidden">
                    <div className="px-5 py-4 border-b border-neutral-200 bg-neutral-50">
                        <h2 className="text-sm font-semibold text-neutral-700 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                            Фильтры
                        </h2>
                    </div>
                    <div className="p-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Поиск</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        value={q} 
                                        onChange={(e) => setQ(e.target.value)} 
                                        placeholder="Имя или телефон" 
                                        className="w-full px-3 py-2 pl-9 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm" 
                                    />
                                    <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Статус</label>
                                <select 
                                    value={statusFilter} 
                                    onChange={(e) => setStatusFilter(e.target.value)} 
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm bg-white"
                                >
                                    <option value="">Все статусы</option>
                                    {Object.keys(workflowStages).map(s => (
                                        <option key={s} value={s}>{workflowStages[s]}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Фотограф</label>
                                <select 
                                    value={photographerFilter} 
                                    onChange={(e) => setPhotographerFilter(e.target.value)} 
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm bg-white"
                                >
                                    <option value="">Все фотографы</option>
                                    {users.filter(u => u.role === 'photographer').map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Редактор</label>
                                <select 
                                    value={editorFilter} 
                                    onChange={(e) => setEditorFilter(e.target.value)} 
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm bg-white"
                                >
                                    <option value="">Все редакторы</option>
                                    {users.filter(u => u.role === 'editor').map(u => (
                                        <option key={u.id} value={u.id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Дата с</label>
                                <input 
                                    type="date" 
                                    value={dateFrom} 
                                    onChange={(e) => setDateFrom(e.target.value)} 
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Дата по</label>
                                <input 
                                    type="date" 
                                    value={dateTo} 
                                    onChange={(e) => setDateTo(e.target.value)} 
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Мин. сумма (₸)</label>
                                <input 
                                    type="number" 
                                    value={minPrice} 
                                    onChange={(e) => setMinPrice(e.target.value)} 
                                    placeholder="0" 
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm" 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-neutral-700 mb-1.5">Макс. сумма (₸)</label>
                                <input 
                                    type="number" 
                                    value={maxPrice} 
                                    onChange={(e) => setMaxPrice(e.target.value)} 
                                    placeholder="0" 
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all text-sm" 
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2 border-t border-neutral-200">
                            <button 
                                onClick={handleFilter} 
                                className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Применить
                            </button>
                            <button 
                                onClick={handleResetFilters} 
                                className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-md hover:bg-neutral-200 transition-colors text-sm font-medium flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Сбросить
                            </button>
                        </div>
                    </div>
                </div>

                {/* Orders Table - Improved Design */}
                <div className="bg-white border border-neutral-200 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50 border-b border-neutral-200">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Клиент
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Город
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Класс
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Альбом
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleSortChange('priority')}
                                            className="flex items-center gap-1 hover:text-neutral-900 transition-colors"
                                        >
                                            Приоритет
                                            {sortBy === 'priority' && (
                                                sortOrder === 'desc' ? (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                ) : (
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                                    </svg>
                                                )
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Этап
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Фотограф
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Редактор
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Сумма
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Дата
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Договор
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors group">
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-neutral-900">#{order.id}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="text-sm font-medium text-neutral-900">
                                                {order.name || <span className="text-neutral-400">—</span>}
                                            </div>
                                            {order.phone && (
                                                <div className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                    </svg>
                                                    {order.phone}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm text-neutral-600">
                                                {order.custom_city || order.city || <span className="text-neutral-400">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm text-neutral-600">
                                                {order.grade_level || <span className="text-neutral-400">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm text-neutral-600">
                                                {order.album_type || <span className="text-neutral-400">—</span>}
                                            </div>
                                            {order.spreads && (
                                                <div className="text-xs text-neutral-400 mt-0.5">
                                                    {order.spreads} стр.
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {order.priority ? (
                                                <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-md ${priorityColors[order.priority] || priorityColors.normal}`}>
                                                    {priorityLabels[order.priority] || order.priority}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-neutral-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-md ${stageColors[order.current_stage || 'new_request']}`}>
                                                {workflowStages[order.current_stage || 'new_request']}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm text-neutral-600">
                                                {order.photographer?.name || <span className="text-neutral-400">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm text-neutral-600">
                                                {order.editor?.name || <span className="text-neutral-400">—</span>}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {order.total_price ? (
                                                <span className="text-sm font-semibold text-neutral-900">
                                                    {parseFloat(order.total_price).toLocaleString('ru-KZ')} ₸
                                                </span>
                                            ) : (
                                                <span className="text-sm text-neutral-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="text-sm text-neutral-600">
                                                {new Date(order.created_at).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            {order.contract_path ? (
                                                <a
                                                    href={`/orders/${order.id}/download-contract`}
                                                    target="_blank"
                                                    className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
                                                    title="Скачать договор"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Договор
                                                </a>
                                            ) : (
                                                <span className="text-neutral-300 text-sm">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap text-right">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenDropdown(openDropdown === order.id ? null : order.id)}
                                                    className="px-3 py-1.5 bg-neutral-100 rounded-md hover:bg-neutral-200 transition-colors text-sm font-medium text-neutral-700 flex items-center gap-1"
                                                >
                                                    Действия
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>

                                                {openDropdown === order.id && (
                                                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                        <div className="py-1 flex flex-col">
                                                            <a
                                                                href={`/orders/${order.id}/project`}
                                                                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left flex items-center gap-2"
                                                                onClick={() => setOpenDropdown(null)}
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                                                </svg>
                                                                Проект
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => { handleView(order); setOpenDropdown(null); }}
                                                                className="px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 text-left flex items-center gap-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                </svg>
                                                                Просмотр
                                                            </button>
                                                            {auth?.user && ['admin', 'super_admin'].includes(auth.user.role) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        if (!confirm('Создать клиента на основе данных заявки?')) return setOpenDropdown(null);
                                                                        try {
                                                                            const res = await fetch(`/orders/${order.id}/create-client`, {
                                                                                method: 'POST',
                                                                                headers: {
                                                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                                                                                    'Content-Type': 'application/json'
                                                                                }
                                                                            });
                                                                            const data = await res.json();
                                                                            if (res.status === 200 && data.success) {
                                                                                alert('Клиент создан (ID: ' + data.user_id + ')');
                                                                                location.reload();
                                                                            } else if (res.status === 409) {
                                                                                alert('Пользователь уже существует (ID: ' + data.user_id + ')');
                                                                            } else {
                                                                                alert(data.error || 'Ошибка');
                                                                            }
                                                                        } catch (e) {
                                                                            console.error(e);
                                                                            alert('Ошибка сети');
                                                                        } finally {
                                                                            setOpenDropdown(null);
                                                                        }
                                                                    }}
                                                                    className="px-4 py-2 text-sm text-blue-600 hover:bg-neutral-50 text-left flex items-center gap-2"
                                                                >
                                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                                                    </svg>
                                                                    Создать клиента
                                                                </button>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={() => { if (confirm('Вы уверены, что хотите удалить эту заявку?')) { handleDelete(order.id); setOpenDropdown(null); } }}
                                                                className="px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 text-left flex items-center gap-2"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                                Удалить
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {orders.length === 0 && (
                        <div className="px-6 py-16 text-center">
                            <svg className="mx-auto h-12 w-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="mt-4 text-sm text-neutral-500">Заявки не найдены</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <OrderModal
                    order={selectedOrder}
                    users={users}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedOrder(null);
                    }}
                />
            )}
        </AppLayout>
    );
}
