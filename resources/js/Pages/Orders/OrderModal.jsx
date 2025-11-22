import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function OrderModal({ order, users, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        status: order?.status || 'pending',
        current_stage: order?.current_stage || 'new_request',
        comment: order?.comment || '',
        assigned_photographer_id: order?.assigned_photographer_id || null,
        assigned_editor_id: order?.assigned_editor_id || null,
    });

    const statusOptions = [
        { value: 'pending', label: 'В ожидании' },
        { value: 'confirmed', label: 'Подтверждена' },
        { value: 'in_progress', label: 'В работе' },
        { value: 'completed', label: 'Завершена' },
        { value: 'cancelled', label: 'Отменена' },
    ];

    const workflowStages = [
        { value: 'new_request', label: '1. Получена заявка', icon: '📋' },
        { value: 'photoshoot_scheduled', label: '2. Назначена съёмка', icon: '📅' },
        { value: 'photoshoot_in_progress', label: '3. Съёмка в процессе', icon: '📸' },
        { value: 'photoshoot_completed', label: '4. Съёмка завершена', icon: '✓' },
        { value: 'editing', label: '5. Обработка фото', icon: '🎨' },
        { value: 'layout', label: '6. Создание макета', icon: '📐' },
        { value: 'printing', label: '7. Печать', icon: '🖨️' },
        { value: 'payment', label: '8. Оплата', icon: '💳' },
        { value: 'delivery', label: '9. Доставка', icon: '🚚' },
        { value: 'completed', label: '10. Завершено', icon: '🎉' },
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        put(`/orders/${order.id}`, {
            onSuccess: () => {
                onClose();
            },
        });
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    const getLocationsString = (locations) => {
        if (!locations || !Array.isArray(locations)) return '-';
        return locations.join(', ');
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-neutral-900">
                        Заявка #{order.id}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Order Details */}
                    <div className="space-y-4 mb-6">
                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Детали заявки</h3>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-neutral-600">Клиент</label>
                                <p className="font-medium text-neutral-900">{order.name || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-neutral-600">Телефон</label>
                                <p className="font-medium text-neutral-900">{order.phone || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-neutral-600">Город</label>
                                <p className="font-medium text-neutral-900">{order.custom_city || order.city || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-neutral-600">Класс</label>
                                <p className="font-medium text-neutral-900">{order.grade_level || '-'}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-neutral-600">Тип альбома</label>
                                <p className="font-medium text-neutral-900">{order.album_type || '-'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-neutral-600">Количество разворотов</label>
                                <p className="font-medium text-neutral-900">{order.spreads || '-'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-neutral-600">Локации съемки</label>
                            <p className="font-medium text-neutral-900">{getLocationsString(order.locations)}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-neutral-600">Скидка</label>
                                <p className="font-medium text-neutral-900">{order.has_discount ? 'Да' : 'Нет'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-neutral-600">Сумма</label>
                                <p className="font-medium text-neutral-900">
                                    {order.total_price ? `${parseFloat(order.total_price).toLocaleString('ru-KZ')} ₸` : '-'}
                                </p>
                            </div>
                        </div>

                        {order.comment && (
                            <div>
                                <label className="text-sm text-neutral-600">Комментарий</label>
                                <p className="font-medium text-neutral-900">{order.comment}</p>
                            </div>
                        )}

                        <div>
                            <label className="text-sm text-neutral-600">Дата создания</label>
                            <p className="font-medium text-neutral-900">
                                {new Date(order.created_at).toLocaleString('ru-RU')}
                            </p>
                        </div>

                        {/* Workflow History */}
                        {order.workflow_history && order.workflow_history.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-neutral-200">
                                <h4 className="text-sm font-medium text-neutral-900 mb-3">История этапов</h4>
                                <div className="space-y-3">
                                    {order.workflow_history.map((item, index) => (
                                        <div key={index} className="flex gap-3 text-sm">
                                            <div className="w-2 h-2 rounded-full bg-neutral-400 mt-1.5 flex-shrink-0"></div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-neutral-900">
                                                        {workflowStages.find(s => s.value === item.stage)?.label || item.stage}
                                                    </span>
                                                    <span className="text-neutral-500">
                                                        {new Date(item.timestamp).toLocaleString('ru-RU')}
                                                    </span>
                                                </div>
                                                {item.comment && (
                                                    <p className="text-neutral-600 mt-1">{item.comment}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Status Update Form */}
                    <form onSubmit={handleSubmit} className="space-y-5 pt-6 border-t border-neutral-200">
                        <h3 className="text-lg font-medium text-neutral-900">Управление этапами работы</h3>

                        {/* Workflow Stage */}
                        <div>
                            <label htmlFor="current_stage" className="block text-sm font-medium text-neutral-700 mb-2">
                                Текущий этап
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {workflowStages.map((stage) => (
                                    <button
                                        key={stage.value}
                                        type="button"
                                        onClick={() => setData('current_stage', stage.value)}
                                        className={`px-3 py-2.5 text-sm rounded-md border transition-all text-left ${
                                            data.current_stage === stage.value
                                                ? 'bg-neutral-900 text-white border-neutral-900'
                                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400'
                                        }`}
                                    >
                                        <span className="mr-2">{stage.icon}</span>
                                        {stage.label}
                                    </button>
                                ))}
                            </div>
                            {errors.current_stage && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.current_stage}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-neutral-700 mb-2">
                                Статус заявки
                            </label>
                            <select
                                id="status"
                                value={data.status}
                                onChange={e => setData('status', e.target.value)}
                                className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                            >
                                {statusOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.status && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.status}</p>
                            )}
                        </div>

                        {/* Photographer Assignment */}
                        <div>
                            <label htmlFor="assigned_photographer_id" className="block text-sm font-medium text-neutral-700 mb-2">
                                Фотограф
                            </label>
                            <select
                                id="assigned_photographer_id"
                                value={data.assigned_photographer_id || ''}
                                onChange={e => setData('assigned_photographer_id', e.target.value || null)}
                                className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                            >
                                <option value="">Не назначен</option>
                                {users?.filter(u => u.role === 'photographer').map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            {errors.assigned_photographer_id && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.assigned_photographer_id}</p>
                            )}
                        </div>

                        {/* Editor Assignment */}
                        <div>
                            <label htmlFor="assigned_editor_id" className="block text-sm font-medium text-neutral-700 mb-2">
                                Редактор
                            </label>
                            <select
                                id="assigned_editor_id"
                                value={data.assigned_editor_id || ''}
                                onChange={e => setData('assigned_editor_id', e.target.value || null)}
                                className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                            >
                                <option value="">Не назначен</option>
                                {users?.filter(u => u.role === 'editor').map((user) => (
                                    <option key={user.id} value={user.id}>
                                        {user.name}
                                    </option>
                                ))}
                            </select>
                            {errors.assigned_editor_id && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.assigned_editor_id}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-2">
                                Комментарий
                            </label>
                            <textarea
                                id="comment"
                                value={data.comment}
                                onChange={e => setData('comment', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                                placeholder="Добавить комментарий..."
                            />
                            {errors.comment && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.comment}</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2.5 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 transition-colors font-medium"
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex-1 px-4 py-2.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            >
                                {processing ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
