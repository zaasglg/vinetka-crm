import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import OrderModal from './OrderModal';

export default function OrdersIndex({ auth, orders = [], users = [], filters = {} }) {
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

        router.get('/orders', params, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setQ(''); setStatusFilter(''); setDateFrom(''); setDateTo(''); setPhotographerFilter(''); setEditorFilter(''); setMinPrice(''); setMaxPrice('');
        router.get('/orders', {}, { preserveState: true, replace: true });
    };

    const getLocationsString = (locations) => {
        if (!locations || !Array.isArray(locations)) return '-';
        return locations.join(', ');
    };

    return (
        <AppLayout auth={auth}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-light text-neutral-900 mb-2">
                            Управление заявками
                        </h1>
                        <p className="text-neutral-600">
                            Всего заявок: {orders.length}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    {Object.entries(workflowStages).slice(0, 5).map(([stage, name]) => {
                        const count = orders.filter(o => o.current_stage === stage).length;
                        return (
                            <div key={stage} className="bg-white border border-neutral-200 rounded-lg p-4">
                                <p className="text-sm text-neutral-600 mb-1">{name}</p>
                                <p className="text-2xl font-light text-neutral-900">{count}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Поиск</label>
                            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя или телефон" className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Статус</label>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                                <option value="">Все статусы</option>
                                {Object.keys(workflowStages).map(s => (
                                    <option key={s} value={s}>{workflowStages[s]}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Фотограф</label>
                            <select value={photographerFilter} onChange={(e) => setPhotographerFilter(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                                <option value="">Все</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Редактор</label>
                            <select value={editorFilter} onChange={(e) => setEditorFilter(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                                <option value="">Все</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Дата с</label>
                            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Дата по</label>
                            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Мин. сумма</label>
                            <input type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Макс. сумма</label>
                            <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="0" className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
                        </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                        <button onClick={handleFilter} className="px-4 py-2 bg-neutral-900 text-white rounded-md">Применить</button>
                        <button onClick={handleResetFilters} className="px-4 py-2 bg-neutral-100 rounded-md">Сбросить</button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    {Object.entries(workflowStages).slice(5).map(([stage, name]) => {
                        const count = orders.filter(o => o.current_stage === stage).length;
                        return (
                            <div key={stage} className="bg-white border border-neutral-200 rounded-lg p-4">
                                <p className="text-sm text-neutral-600 mb-1">{name}</p>
                                <p className="text-2xl font-light text-neutral-900">{count}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Orders Table */}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Клиент
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Город
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Класс
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Альбом
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Этап работы
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Фотограф
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Редактор
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Сумма
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Дата
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-neutral-900">
                                                {order.name || '-'}
                                            </div>
                                            <div className="text-sm text-neutral-500">
                                                {order.phone || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.custom_city || order.city || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.grade_level || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.album_type || '-'}
                                            {order.spreads && <span className="text-neutral-400"> ({order.spreads} стр.)</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium border rounded-full ${stageColors[order.current_stage || 'new_request']}`}>
                                                {workflowStages[order.current_stage || 'new_request']}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.photographer?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.editor?.name || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900">
                                            {order.total_price ? `${parseFloat(order.total_price).toLocaleString('ru-KZ')} ₸` : '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {new Date(order.created_at).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <a
                                                href={`/orders/${order.id}/project`}
                                                className="text-blue-600 hover:text-blue-800 mr-4 transition-colors"
                                            >
                                                Проект
                                            </a>
                                            <button
                                                onClick={() => handleView(order)}
                                                className="text-neutral-600 hover:text-neutral-900 mr-4 transition-colors"
                                            >
                                                Просмотр
                                            </button>
                                            {/* Create client from order (for admins) */}
                                            <button
                                                onClick={async () => {
                                                    if (!confirm('Создать клиента на основе данных заявки?')) return;
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
                                                            // optional: update UI, disable button
                                                            location.reload();
                                                        } else if (res.status === 409) {
                                                            alert('Пользователь уже существует (ID: ' + data.user_id + ')');
                                                        } else {
                                                            alert(data.error || 'Ошибка');
                                                        }
                                                    } catch (e) {
                                                        console.error(e);
                                                        alert('Ошибка сети');
                                                    }
                                                }}
                                                className="text-blue-600 hover:text-blue-800 mr-4 transition-colors"
                                            >
                                                Создать клиента
                                            </button>
                                            <button
                                                onClick={() => handleDelete(order.id)}
                                                className="text-red-600 hover:text-red-800 transition-colors"
                                            >
                                                Удалить
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {orders.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-neutral-500">Заявки не найдены</p>
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
