import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

export default function ClientModal({ client, onClose, auth }) {
    const isEditing = !!client;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        password: '',
        is_regular_client: client?.is_regular_client || false,
        comment: client?.comment || '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(`/clients/${client.id}`, {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        } else {
            post('/clients', {
                onSuccess: () => {
                    reset();
                    onClose();
                },
            });
        }
    };

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
                    <h2 className="text-xl font-medium text-neutral-900">
                        {isEditing ? 'Редактировать клиента' : 'Добавить клиента'}
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                            Имя <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                            placeholder="Иван Иванов"
                            required
                        />
                        {errors.name && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                            placeholder="client@example.com"
                            required
                        />
                        {errors.email && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.email}</p>
                        )}
                    </div>

                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-2">
                            Телефон
                        </label>
                        <input
                            id="phone"
                            type="text"
                            value={data.phone}
                            onChange={e => setData('phone', e.target.value)}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                            placeholder="+7 777 123 4567"
                        />
                        {errors.phone && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                            Пароль {isEditing && <span className="text-neutral-500">(оставьте пустым, чтобы не менять)</span>}
                            {isEditing && auth?.user && ['admin','super_admin'].includes(auth.user.role) && (
                                <button
                                    type="button"
                                    onClick={async () => {
                                        if (!confirm('Сгенерировать пароль для этого клиента?')) return;
                                        try {
                                            const res = await fetch(`/clients/${client.id}/generate-password`, {
                                                method: 'POST',
                                                headers: {
                                                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                                                    'Content-Type': 'application/json'
                                                }
                                            });
                                            const data = await res.json();
                                            if (res.ok && data.success) {
                                                setData('password', data.password);
                                                alert('Сгенерированный пароль: ' + data.password);
                                            } else {
                                                alert(data.error || 'Ошибка при генерации пароля');
                                            }
                                        } catch (e) {
                                            console.error(e);
                                            alert('Ошибка сети');
                                        }
                                    }}
                                    className="ml-3 inline-block text-xs px-2 py-1 bg-neutral-100 hover:bg-neutral-200 rounded"
                                >
                                    Сгенерировать
                                </button>
                            )}
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={e => setData('password', e.target.value)}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all"
                            placeholder="••••••••"
                            required={!isEditing}
                        />
                        {errors.password && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.password}</p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label htmlFor="comment" className="block text-sm font-medium text-neutral-700 mb-2">
                            Комментарий
                        </label>
                        <textarea
                            id="comment"
                            value={data.comment}
                            onChange={e => setData('comment', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none"
                            placeholder="Добавьте заметки о клиенте..."
                        />
                        {errors.comment && (
                            <p className="mt-1.5 text-sm text-red-600">{errors.comment}</p>
                        )}
                    </div>

                    {/* Regular Client Flag */}
                    {isEditing && (
                        <div>
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={data.is_regular_client}
                                    onChange={e => setData('is_regular_client', e.target.checked)}
                                    className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-900"
                                />
                                <span className="text-sm font-medium text-neutral-700">
                                    Постоянный клиент
                                </span>
                            </label>
                            {errors.is_regular_client && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.is_regular_client}</p>
                            )}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
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
                            {processing ? 'Сохранение...' : isEditing ? 'Обновить' : 'Создать'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

