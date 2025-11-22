import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';

export default function WhatsAppSettings({ auth }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [testPhone, setTestPhone] = useState('');
    const [testMessage, setTestMessage] = useState('');
    const [connectedAccount, setConnectedAccount] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    
    // AI Auto-reply states
    const [autoReplySettings, setAutoReplySettings] = useState({
        enabled: false,
        system_prompt: '',
        ai_model: 'gpt-4o-mini',
        max_tokens: 500,
        temperature: 0.7,
        excluded_phones: [],
        only_new_conversations: true,
    });
    const [newExcludedPhone, setNewExcludedPhone] = useState('');
    const [savingAutoReply, setSavingAutoReply] = useState(false);

    const fetchStatus = async () => {
        try {
            const response = await fetch('/whatsapp/status');
            const data = await response.json();
            setStatus(data);
            
            // Если отключено (не подключено), очищаем информацию об аккаунте
            if (data.status === 'disconnected' || !data.connected) {
                setConnectedAccount(null);
            } else if (data.connected && data.account) {
                // Если подключено, получаем информацию об аккаунте
                setConnectedAccount(data.account);
            }
        } catch (error) {
            console.error('Ошибка получения статуса:', error);
            // При ошибке также очищаем аккаунт
            setConnectedAccount(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchAutoReplySettings = async () => {
        try {
            const response = await fetch('/whatsapp/auto-reply/settings');
            const data = await response.json();
            if (data.success && data.settings) {
                setAutoReplySettings(data.settings);
            }
        } catch (error) {
            console.error('Ошибка загрузки настроек автоответчика:', error);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchAutoReplySettings();
        const interval = setInterval(fetchStatus, 5000); // Обновляем каждые 5 секунд
        return () => clearInterval(interval);
    }, []);

    const handleReconnect = async () => {
        setLoading(true);
        try {
            const response = await fetch('/whatsapp/reconnect', { 
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Ждем немного дольше, чтобы дать время для генерации QR
                await new Promise(resolve => setTimeout(resolve, 3000));
                await fetchStatus();
            }
        } catch (error) {
            console.error('Ошибка переподключения:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        setShowDeleteConfirm(false);
        setLoading(true);
        try {
            // Используем delete-session вместо disconnect для полного удаления
            await fetch('/whatsapp/delete-session', { 
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                }
            });
            setConnectedAccount(null);
            setTimeout(fetchStatus, 1000);
        } catch (error) {
            console.error('Ошибка отключения:', error);
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        // Используем ту же функцию
        handleDisconnect();
    };

    const handleSaveAutoReply = async (e) => {
        e.preventDefault();
        setSavingAutoReply(true);
        
        try {
            const response = await fetch('/whatsapp/auto-reply/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || '',
                },
                body: JSON.stringify(autoReplySettings),
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Настройки автоответчика сохранены!');
                setAutoReplySettings(data.settings);
            } else {
                // Show validation details if available
                if (data.details) {
                    const messages = Object.values(data.details).flat().join('\n');
                    alert('Ошибка валидации:\n' + messages);
                } else if (data.exception) {
                    alert('Ошибка: ' + data.error + '\n' + data.exception);
                } else {
                    alert('Ошибка: ' + (data.error || 'Неизвестная ошибка'));
                }
            }
        } catch (error) {
            alert('Ошибка сохранения настроек');
            console.error(error);
        } finally {
            setSavingAutoReply(false);
        }
    };

    const handleAddExcludedPhone = () => {
        if (newExcludedPhone && !autoReplySettings.excluded_phones.includes(newExcludedPhone)) {
            setAutoReplySettings({
                ...autoReplySettings,
                excluded_phones: [...autoReplySettings.excluded_phones, newExcludedPhone]
            });
            setNewExcludedPhone('');
        }
    };

    const handleRemoveExcludedPhone = (phone) => {
        setAutoReplySettings({
            ...autoReplySettings,
            excluded_phones: autoReplySettings.excluded_phones.filter(p => p !== phone)
        });
    };

    const handleSendTest = async (e) => {
        e.preventDefault();
        setSending(true);
        
        try {
            const response = await fetch('/whatsapp/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                },
                body: JSON.stringify({
                    phone: testPhone,
                    message: testMessage,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Тестовое сообщение отправлено!');
                setTestPhone('');
                setTestMessage('');
            } else {
                alert('Ошибка: ' + data.error);
            }
        } catch (error) {
            alert('Ошибка отправки сообщения');
        } finally {
            setSending(false);
        }
    };

    const getStatusBadge = () => {
        if (!status) return null;

        const badges = {
            connected: { text: 'Подключено', color: 'bg-green-100 text-green-800' },
            qr: { text: 'Ожидание сканирования QR', color: 'bg-yellow-100 text-yellow-800' },
            connecting: { text: 'Подключение...', color: 'bg-blue-100 text-blue-800' },
            disconnected: { text: 'Отключено', color: 'bg-red-100 text-red-800' },
        };

        const badge = badges[status.status] || badges.disconnected;
        return (
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${badge.color}`}>
                {badge.text}
            </span>
        );
    };

    return (
        <AppLayout auth={auth}>
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-light text-neutral-900 mb-2">
                        WhatsApp интеграция
                    </h1>
                    <p className="text-neutral-600">
                        Управление подключением и отправка сообщений
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Статус подключения */}
                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-neutral-900 mb-4">
                            Статус подключения
                        </h2>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    {getStatusBadge()}
                                    
                                    {/* Информация о подключенном аккаунте */}
                                    {connectedAccount && status?.status === 'connected' && (
                                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-800">
                                                <span className="font-medium">Номер:</span> {connectedAccount.phone || connectedAccount.user}
                                            </p>
                                            {connectedAccount.name && (
                                                <p className="text-sm text-green-800 mt-1">
                                                    <span className="font-medium">Имя:</span> {connectedAccount.name}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {status?.status === 'qr' && status?.qr && (
                                    <div className="mb-6">
                                        <p className="text-sm text-neutral-600 mb-3">
                                            Отсканируйте QR-код в WhatsApp:
                                        </p>
                                        <div className="bg-neutral-50 p-4 rounded-lg">
                                            <img 
                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(status.qr)}`}
                                                alt="QR Code"
                                                className="mx-auto"
                                            />
                                        </div>
                                        <p className="text-xs text-neutral-500 mt-2">
                                            WhatsApp → Настройки → Связанные устройства → Связать устройство
                                        </p>
                                    </div>
                                )}
                                
                                {/* Предупреждение если статус disconnected */}
                                {status?.status === 'disconnected' && (
                                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                                        <p className="text-sm text-amber-800">
                                            ⚠️ WhatsApp отключен. Нажмите "Переподключить" для новой авторизации.
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    {status?.status === 'connected' && (
                                        <button
                                            onClick={handleDisconnect}
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            Отключить
                                        </button>
                                    )}
                                    <button
                                        onClick={handleReconnect}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                    >
                                        Переподключить
                                    </button>
                                </div>
                            </>
                        )}
                    </div>

                    {/* AI Автоответчик */}
                    <div className="bg-white border border-neutral-200 rounded-lg p-6">
                        <h2 className="text-lg font-medium text-neutral-900 mb-4">
                            🤖 AI Автоответчик
                        </h2>

                        <form onSubmit={handleSaveAutoReply} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-neutral-700">
                                    Включить автоответчик
                                </label>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoReplySettings.enabled}
                                        onChange={(e) => setAutoReplySettings({
                                            ...autoReplySettings,
                                            enabled: e.target.checked
                                        })}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Системный промпт
                                </label>
                                <textarea
                                    value={autoReplySettings.system_prompt}
                                    onChange={(e) => setAutoReplySettings({
                                        ...autoReplySettings,
                                        system_prompt: e.target.value
                                    })}
                                    placeholder="Ты - вежливый ассистент фотостудии..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                                    required
                                />
                                <p className="text-xs text-neutral-500 mt-1">
                                    Опишите, как AI должен отвечать клиентам
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Модель AI
                                    </label>
                                    <select
                                        value={autoReplySettings.ai_model}
                                        onChange={(e) => setAutoReplySettings({
                                            ...autoReplySettings,
                                            ai_model: e.target.value
                                        })}
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    >
                                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                                        <option value="gpt-4o">GPT-4o</option>
                                        <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Макс. токены
                                    </label>
                                    <input
                                        type="number"
                                        value={autoReplySettings.max_tokens}
                                        onChange={(e) => setAutoReplySettings({
                                            ...autoReplySettings,
                                            max_tokens: parseInt(e.target.value)
                                        })}
                                        min="50"
                                        max="2000"
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">
                                        Temperature
                                    </label>
                                    <input
                                        type="number"
                                        value={autoReplySettings.temperature}
                                        onChange={(e) => setAutoReplySettings({
                                            ...autoReplySettings,
                                            temperature: parseFloat(e.target.value)
                                        })}
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={autoReplySettings.only_new_conversations}
                                    onChange={(e) => setAutoReplySettings({
                                        ...autoReplySettings,
                                        only_new_conversations: e.target.checked
                                    })}
                                    className="w-4 h-4 text-blue-600 border-neutral-300 rounded focus:ring-blue-500"
                                />
                                <label className="ml-2 text-sm text-neutral-700">
                                    Отвечать только на первое сообщение в разговоре
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    Исключенные номера
                                </label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newExcludedPhone}
                                        onChange={(e) => setNewExcludedPhone(e.target.value)}
                                        placeholder="79161234567"
                                        className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddExcludedPhone}
                                        className="px-4 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 text-sm"
                                    >
                                        Добавить
                                    </button>
                                </div>
                                {autoReplySettings.excluded_phones?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {autoReplySettings.excluded_phones.map((phone) => (
                                            <span
                                                key={phone}
                                                className="inline-flex items-center gap-1 px-3 py-1 bg-neutral-100 text-neutral-700 rounded-full text-sm"
                                            >
                                                {phone}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveExcludedPhone(phone)}
                                                    className="text-neutral-500 hover:text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <p className="text-xs text-neutral-500 mt-1">
                                    AI не будет отвечать на сообщения с этих номеров
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={savingAutoReply}
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                            >
                                {savingAutoReply ? 'Сохранение...' : 'Сохранить настройки'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* Модалка подтверждения удаления */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-neutral-900">Выйти из WhatsApp?</h3>
                            </div>
                        </div>
                        <p className="text-sm text-neutral-600 mb-6">
                            Это действие отключит текущий WhatsApp аккаунт и удалит все данные подключения. 
                            После выхода вы сможете подключить другой номер.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
