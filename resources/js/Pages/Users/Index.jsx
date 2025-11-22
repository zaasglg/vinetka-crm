import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router } from '@inertiajs/react';
import UserModal from './UserModal';

export default function UsersIndex({ auth, users = [], filters = {} }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [openDropdown, setOpenDropdown] = useState(null);

    // Filters state
    const [q, setQ] = useState(filters.q || '');
    const [roleFilter, setRoleFilter] = useState(filters.role || '');
    const [regularFilter, setRegularFilter] = useState(
        filters.is_regular_client === undefined ? '' : String(filters.is_regular_client)
    );

    const roleNames = {
        'super_admin': 'Супер-администратор',
        'admin': 'Администратор',
        'sales_manager': 'Менеджер по продажам',
        'photographer': 'Фотограф',
        'editor': 'Монтажёр/Ретушёр',
        'print_operator': 'Оператор печати',
        'client': 'Клиент'
    };

    const roleColors = {
        'super_admin': 'bg-red-50 text-red-700 border-red-200',
        'admin': 'bg-blue-50 text-blue-700 border-blue-200',
        'sales_manager': 'bg-green-50 text-green-700 border-green-200',
        'photographer': 'bg-purple-50 text-purple-700 border-purple-200',
        'editor': 'bg-amber-50 text-amber-700 border-amber-200',
        'print_operator': 'bg-cyan-50 text-cyan-700 border-cyan-200',
        'client': 'bg-neutral-50 text-neutral-700 border-neutral-200',
    };

    const handleCreate = () => {
        setEditingUser(null);
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setEditingUser(user);
        setIsModalOpen(true);
    };

    const handleFilter = () => {
        const params = {};
        if (q) params.q = q;
        if (roleFilter) params.role = roleFilter;
        if (regularFilter !== '') params.is_regular_client = regularFilter;

        router.get('/users', params, { preserveState: true, replace: true });
    };

    const handleResetFilters = () => {
        setQ('');
        setRoleFilter('');
        setRegularFilter('');
        router.get('/users', {}, { preserveState: true, replace: true });
    };

    const handleDelete = (userId) => {
        if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
            router.delete(`/users/${userId}`);
        }
    };

    return (
        <AppLayout auth={auth}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-light text-neutral-900 mb-2">
                            Управление пользователями
                        </h1>
                        <p className="text-neutral-600">
                            Всего пользователей: {users.length}
                        </p>
                    </div>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium"
                    >
                        + Добавить пользователя
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden mb-6 p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Поиск</label>
                            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Имя или email" className="w-full px-3 py-2 border border-neutral-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Роль</label>
                            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md">
                                <option value="">Все роли</option>
                                <option value="super_admin">Супер-администратор</option>
                                <option value="admin">Администратор</option>
                                <option value="sales_manager">Менеджер по продажам</option>
                                <option value="photographer">Фотограф</option>
                                <option value="editor">Монтажёр/Ретушёр</option>
                                <option value="print_operator">Оператор печати</option>
                                <option value="client">Клиент</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Постоянный клиент</label>
                            <select value={regularFilter} onChange={(e) => setRegularFilter(e.target.value)} className="w-full px-3 py-2 border border-neutral-300 rounded-md">
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

                {/* Users Table */}
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
                                        Роль
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
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            #{user.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-sm font-medium text-neutral-600">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-medium text-neutral-900">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium border rounded-full ${roleColors[user.role]}`}>
                                                {roleNames[user.role]}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {new Date(user.created_at).toLocaleDateString('ru-RU')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                                                    className="px-3 py-1 bg-neutral-100 rounded-md hover:bg-neutral-200"
                                                >
                                                    Действия ▾
                                                </button>

                                                {openDropdown === user.id && (
                                                    <div className="origin-top-right absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                                        <div className="py-1">
                                                            <button
                                                                onClick={() => { handleEdit(user); setOpenDropdown(null); }}
                                                                className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                                            >
                                                                Редактировать
                                                            </button>

                                                            {auth?.user?.id !== user.id && (
                                                                <button
                                                                    onClick={() => { if (confirm('Вы уверены, что хотите удалить этого пользователя?')) { handleDelete(user.id); setOpenDropdown(null); } }}
                                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-neutral-50"
                                                                >
                                                                    Удалить
                                                                </button>
                                                            )}

                                                            {user.role === 'client' && (
                                                                <div>
                                                                    <button
                                                                        onClick={async () => {
                                                                            try {
                                                                                const res = await fetch(`/users/${user.id}/toggle-regular`, {
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
                                                                        className="w-full text-left px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                                                                    >
                                                                        {user.is_regular_client ? 'Убрать метку' : 'Сделать постоянным'}
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {auth?.user && ['admin', 'super_admin'].includes(auth.user.role) && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!confirm('Сгенерировать новый пароль для пользователя?')) return setOpenDropdown(null);
                                                                        try {
                                                                            const res = await fetch(`/users/${user.id}/generate-password`, {
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
                                                                    className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-neutral-50"
                                                                >
                                                                    Сгенерировать пароль
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            {user.role === 'client' && user.is_regular_client && (
                                                <span className="ml-3 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded-full">
                                                    Постоянный клиент
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="px-6 py-12 text-center">
                            <p className="text-neutral-500">Пользователи не найдены</p>
                        </div>
                    )}
                </div>
            </div>

            {isModalOpen && (
                <UserModal
                    user={editingUser}
                    onClose={() => setIsModalOpen(false)}
                    auth={auth}
                />
            )}
        </AppLayout>
    );
}
