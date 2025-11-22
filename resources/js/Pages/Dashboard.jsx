import AppLayout from '@/Layouts/AppLayout';

export default function Dashboard({ auth, stats, recentOrders }) {

    const statusColors = {
        'Новая заявка': 'bg-gray-50 text-gray-700 border-gray-200',
        'Съёмка запланирована': 'bg-blue-50 text-blue-700 border-blue-200',
        'Обработка': 'bg-amber-50 text-amber-700 border-amber-200',
        'Печать': 'bg-purple-50 text-purple-700 border-purple-200',
        'Завершено': 'bg-green-50 text-green-700 border-green-200',
    };

    return (
        <AppLayout auth={auth}>
            <div className="p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-light text-neutral-900 mb-2">
                        Главная панель
                    </h1>
                    <p className="text-neutral-600">
                        Обзор активности системы
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {stats.map((stat) => (
                        <div key={stat.name} className="bg-white border border-neutral-200 rounded-lg p-6">
                            <p className="text-sm text-neutral-600 mb-1">{stat.name}</p>
                            <div className="flex items-baseline gap-2">
                                <p className="text-3xl font-light text-neutral-900">{stat.value}</p>
                                <span className={`text-sm ${
                                    stat.trend === 'up' ? 'text-green-600' : 
                                    stat.trend === 'down' ? 'text-red-600' : 
                                    'text-neutral-500'
                                }`}>
                                    {stat.change}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Recent Orders */}
                <div className="bg-white border border-neutral-200 rounded-lg">
                    <div className="px-6 py-4 border-b border-neutral-200">
                        <h2 className="text-lg font-medium text-neutral-900">
                            Последние заявки
                        </h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-neutral-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Учреждение
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Дата
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Статус
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-600 uppercase tracking-wider">
                                        Детали
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-200">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-neutral-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            #{order.id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                                            {order.school}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.date}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-medium border rounded-full ${statusColors[order.status] || 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-600">
                                            {order.photographer || order.editor || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
