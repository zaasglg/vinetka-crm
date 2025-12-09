import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function OrderModal({ order, users, onClose }) {
    const { data, setData, put, processing, errors } = useForm({
        status: order?.status || 'pending',
        current_stage: order?.current_stage || 'new_request',
        priority: order?.priority || 'normal',
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

    const priorityOptions = [
        { value: 'low', label: 'Низкий', color: 'text-gray-600' },
        { value: 'normal', label: 'Обычный', color: 'text-blue-600' },
        { value: 'high', label: 'Высокий', color: 'text-orange-600' },
        { value: 'urgent', label: 'Срочный', color: 'text-red-600' },
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
                                <label className="text-sm text-neutral-600">Приоритет</label>
                                <p className="font-medium text-neutral-900">
                                    {order.priority ? (
                                        <span className={`inline-flex px-2.5 py-1 text-xs font-medium border rounded-md ${
                                            order.priority === 'low' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                                            order.priority === 'normal' ? 'bg-blue-100 text-blue-700 border-blue-300' :
                                            order.priority === 'high' ? 'bg-orange-100 text-orange-700 border-orange-300' :
                                            'bg-red-100 text-red-700 border-red-300'
                                        }`}>
                                            {priorityOptions.find(p => p.value === order.priority)?.label || order.priority}
                                        </span>
                                    ) : 'Обычный'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm text-neutral-600">Скидка</label>
                                <p className="font-medium text-neutral-900">{order.has_discount ? 'Да' : 'Нет'}</p>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-neutral-600">Сумма</label>
                            <p className="font-medium text-neutral-900">
                                {order.total_price ? `${parseFloat(order.total_price).toLocaleString('ru-KZ')} ₸` : '-'}
                            </p>
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

                        {/* Contract Section */}
                        <div className="mt-6 pt-6 border-t border-neutral-200">
                            <label className="text-sm font-medium text-neutral-700 mb-3 block">
                                Договор
                            </label>
                            {order.contract_path ? (
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 flex items-center gap-2 px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-md">
                                        <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span className="text-sm text-neutral-700">Договор загружен</span>
                                    </div>
                                    <a
                                        href={`/orders/${order.id}/download-contract`}
                                        target="_blank"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                                    >
                                        Скачать
                                    </a>
                                    <button
                                        onClick={async () => {
                                            if (!confirm('Удалить договор?')) return;
                                            try {
                                                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
                                                const res = await fetch(`/orders/${order.id}/contract`, {
                                                    method: 'DELETE',
                                                    headers: {
                                                        'X-CSRF-TOKEN': csrfToken,
                                                        'Content-Type': 'application/json',
                                                        'Accept': 'application/json',
                                                        'X-Requested-With': 'XMLHttpRequest',
                                                    },
                                                });
                                                
                                                const data = await res.json();
                                                
                                                if (res.ok && data.success) {
                                                    location.reload();
                                                } else {
                                                    alert(data.error || 'Ошибка при удалении');
                                                }
                                            } catch (e) {
                                                console.error('Delete contract error:', e);
                                                alert('Ошибка сети: ' + e.message);
                                            }
                                        }}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            const formData = new FormData(e.target);
                                            try {
                                                const res = await fetch(`/orders/${order.id}/upload-contract`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                                                    },
                                                    body: formData,
                                                });
                                                if (res.ok) {
                                                    location.reload();
                                                } else {
                                                    const data = await res.json();
                                                    alert(data.message || 'Ошибка при загрузке');
                                                }
                                            } catch (e) {
                                                console.error(e);
                                                alert('Ошибка сети');
                                            }
                                        }}
                                        className="flex items-center gap-3"
                                    >
                                        <input
                                            type="file"
                                            name="contract"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            required
                                            className="flex-1 px-4 py-2 border border-neutral-300 rounded-md text-sm"
                                        />
                                        <button
                                            type="submit"
                                            className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors text-sm font-medium"
                                        >
                                            Загрузить
                                        </button>
                                    </form>
                                    <p className="text-xs text-neutral-500 mt-2">
                                        Поддерживаемые форматы: PDF, DOC, DOCX, JPG, PNG (макс. 10MB)
                                    </p>
                                </div>
                            )}
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

                        {/* Priority */}
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-neutral-700 mb-2">
                                Приоритет
                            </label>
                            <div className="grid grid-cols-4 gap-2">
                                {priorityOptions.map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setData('priority', option.value)}
                                        className={`px-3 py-2.5 text-sm rounded-md border transition-all ${
                                            data.priority === option.value
                                                ? 'bg-neutral-900 text-white border-neutral-900'
                                                : `bg-white ${option.color} border-neutral-300 hover:border-neutral-400`
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                            {errors.priority && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.priority}</p>
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
