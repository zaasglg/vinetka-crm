import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import ClientModal from './ClientModal';

export default function ClientsIndex({ auth, clients = [], filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingClient, setEditingClient] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Filters state
    const [q, setQ] = useState(filters.q || '');
    const [regularFilter, setRegularFilter] = useState(
        filters.is_regular_client === undefined ? '' : String(filters.is_regular_client)
    );

    const handleCreate = () => {
        setEditingClient(null);
        setIsModalOpen(true);
    };

    const handleEdit = (client) => {
        setEditingClient(client);
        setIsModalOpen(true);
    };

    const handleFilter = () => {
        const params = {};
        if (q) params.q = q;
        if (regularFilter !== '') params.is_regular_client = regularFilter;

        router.get('/clients', params, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setQ('');
        setRegularFilter('');
        router.get('/clients', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (userId) => {
        if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
            router.delete(`/clients/${userId}`);
        }
    };

    return (
        <AppLayout auth={auth}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-light text-neutral-900 mb-2">
                            Управление клиентами
                        </h1>
                        <p className="text-neutral-600">
                            Всего клиентов: {clients.length}
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium"
                    >
                        + Добавить клиента
                    </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-sm text-neutral-600 mb-1">Всего клиентов</p>
                        <p className="text-2xl font-light text-neutral-900">{clients.length}</p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-sm text-neutral-600 mb-1">Постоянные клиенты</p>
                        <p className="text-2xl font-light text-neutral-900">
                            {clients.filter(c => c.is_regular_client).length}
                        </p>
                    </div>
                    <div className="bg-white border border-neutral-200 rounded-lg p-4">
                        <p className="text-sm text-neutral-600 mb-1">Обычные клиенты</p>
                        <p className="text-2xl font-light text-neutral-900">
                            {clients.filter(c => !c.is_regular_client).length}
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Поиск</label>
                            <input 
                                type="text" 
                                value={q} 
                                onChange={(e) => setQ(e.target.value)} 
                                placeholder="Имя, email или телефон" 
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Постоянный клиент</label>
                            <select 
                                value={regularFilter} 
                                onChange={(e) => setRegularFilter(e.target.value)} 
                                className="w-full px-3 py-2 border border-neutral-300 rounded-md"
                            >
                                <option value="">Все</option>
                                <option value="1">Да</option>
                                <option value="0">Нет</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={handleFilter} className="px-4 py-2 bg-neutral-900 text-white rounded-md">Применить</button>
                            <button onClick={handleResetFilters} className="px-4 py-2 bg-neutral-100 rounded-md">Сбросить</button>
                        </div>
                    </div>
                </div>

                {/* Clients Table */}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto overflow-visible">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Имя
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Телефон
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Статус
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Комментарий
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Дата создания
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Действия
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {clients.map((client) => (
                                    <tr key={client.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            #{client.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-neutral-600">
                                                        {client.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-neutral-900">
                                                    {client.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {client.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {client.phone || '-'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {client.is_regular_client ? (
                                                <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                                                    Постоянный клиент
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 text-xs font-medium bg-neutral-50 text-neutral-700 border border-neutral-200 rounded-full">
                                                    Обычный клиент
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-neutral-600 max-w-xs">
                                            {client.comment ? (
                                                <div className="truncate" title={client.comment}>
                                                    {client.comment.length > 50 ? `${client.comment.substring(0, 50)}...` : client.comment}
                                                </div>
                                            ) : (
                                                <span className="text-neutral-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {new Date(client.created_at).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === client.id ? null : client.id)}
                                                    className="px-3 py-1 bg-neutral-100 rounded-md hover:bg-neutral-200"
                                                >
                                                    Действия ▾
                                                </button>

                                                {openDropdown === client.id && (
                                                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white border border-neutral-200 z-50">
                                                        <div className="py-1 flex flex-col">
                                                            <button
                                                                type="button"
                                                                onClick={() => { handleEdit(client); setOpenDropdown(null); }}
                                                                className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                                            >
                                                                Редактировать
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={async () => {
                                                                    try {
                                                                        const res = await fetch(`/clients/${client.id}/toggle-regular`, {
                                                                            method: 'POST',
                                                                            headers: {
                                                                                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                                                                                'Content-Type': 'application/json'
                                                                            }
                                                                        });
                                                                        const data = await res.json();
                                                                        if (data.success) {
                                                                            location.reload();
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
                                                                className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
                                                            >
                                                                {client.is_regular_client ? 'Убрать метку постоянного' : 'Сделать постоянным'}
                                                            </button>

                                                            {auth?.user && ['admin', 'super_admin'].includes(auth.user.role) && (
                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        if (!confirm('Сгенерировать новый пароль для клиента?')) return setOpenDropdown(null);
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
                                                                                alert('Сгенерированный пароль: ' + data.password);
                                                                            } else {
                                                                                alert(data.error || 'Ошибка при генерации пароля');
                                                                            }
                                                                        } catch (e) {
                                                                            console.error(e);
                                                                            alert('Ошибка сети');
                                                                        } finally {
                                                                            setOpenDropdown(null);
                                                                        }
                                                                    }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-neutral-50 transition-colors"
                                                                >
                                                                    Сгенерировать пароль
                                                                </button>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={() => { 
                                                                    if (confirm('Вы уверены, что хотите удалить этого клиента?')) {
                                                                        handleDelete(client.id);
                                                                        setOpenDropdown(null);
                                                                    }
                                                                }}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50 transition-colors"
                                                            >
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

                    {clients.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-neutral-500">Клиенты не найдены</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <ClientModal
                    client={editingClient}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingClient(null);
                    }}
                    auth={auth}
                />
            )}
        </AppLayout>
    );
}

