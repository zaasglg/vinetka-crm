import { useState, useEffect, useRef } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { router } from '@inertiajs/react';

export default function WhatsAppChat({ auth, initialMessages = [] }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [showNewChat, setShowNewChat] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchStatus = async () => {
        try {
            const response = await fetch('/whatsapp/status');
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Ошибка получения статуса:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async () => {
        try {
            const response = await fetch('/whatsapp/messages');
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
                
                // Группируем по телефонам для списка чатов
                const chatMap = {};
                data.messages.forEach(msg => {
                    if (!chatMap[msg.phone]) {
                        chatMap[msg.phone] = {
                            phone: msg.phone,
                            lastMessage: msg.message,
                            lastTime: msg.created_at,
                            unread: 0
                        };
                    } else if (new Date(msg.created_at) > new Date(chatMap[msg.phone].lastTime)) {
                        chatMap[msg.phone].lastMessage = msg.message;
                        chatMap[msg.phone].lastTime = msg.created_at;
                    }
                });
                setChats(Object.values(chatMap).sort((a, b) => 
                    new Date(b.lastTime) - new Date(a.lastTime)
                ));
            }
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    };

    useEffect(() => {
        fetchStatus();
        fetchMessages();
        const statusInterval = setInterval(fetchStatus, 10000);
        const messagesInterval = setInterval(fetchMessages, 5000);
        return () => {
            clearInterval(statusInterval);
            clearInterval(messagesInterval);
        };
    }, []);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !activeChat) return;

        if (!status?.connected) {
            alert('WhatsApp не подключен. Перейдите в настройки для подключения.');
            return;
        }

        setSending(true);
        try {
            // Получаем CSRF токен из мета-тега или cookie
            const token = document.querySelector('meta[name="csrf-token"]')?.content 
                       || document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            const response = await fetch('/whatsapp/send-message', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    phone: activeChat,
                    message: newMessage,
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                setNewMessage('');
                // Добавляем сообщение в локальный список
                const newMsg = {
                    phone: activeChat,
                    message: newMessage,
                    direction: 'outgoing',
                    status: 'sent',
                    created_at: new Date().toISOString()
                };
                setMessages(prev => [...prev, newMsg]);
                fetchMessages(); // Обновляем с сервера
            } else {
                alert('Ошибка отправки: ' + (data.error || 'Неизвестная ошибка'));
            }
        } catch (error) {
            console.error('Send error:', error);
            alert('Ошибка отправки сообщения: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    const handleStartNewChat = () => {
        if (!newPhone.trim()) return;
        setActiveChat(newPhone);
        setShowNewChat(false);
        setNewPhone('');
    };

    const formatPhone = (phone) => {
        // Форматируем номер для отображения
        if (phone.startsWith('7') && phone.length === 11) {
            return `+7 (${phone.slice(1, 4)}) ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`;
        }
        return phone;
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) return 'только что';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
        if (diff < 86400000) return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    const activeChatMessages = messages.filter(msg => msg.phone === activeChat);

    return (
        <AppLayout auth={auth}>
            <div className="h-[calc(100vh-4rem)] flex">
                {/* Левая панель - список чатов */}
                <div className="w-80 bg-white border-r border-neutral-200 flex flex-col">
                    <div className="p-4 border-b border-neutral-200">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-lg font-medium text-neutral-900">Чаты</h2>
                            <button
                                onClick={() => setShowNewChat(true)}
                                className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                                title="Новый чат"
                            >
                                <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            {status?.connected ? (
                                <>
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-sm text-green-600">Подключено</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                    <span className="text-sm text-red-600">Не подключено</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {chats.length === 0 ? (
                            <div className="p-4 text-center text-neutral-500">
                                <p className="text-sm">Нет чатов</p>
                                <p className="text-xs mt-1">Начните новый разговор</p>
                            </div>
                        ) : (
                            chats.map(chat => (
                                <button
                                    key={chat.phone}
                                    onClick={() => setActiveChat(chat.phone)}
                                    className={`w-full p-4 text-left border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                                        activeChat === chat.phone ? 'bg-blue-50' : ''
                                    }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-neutral-900 truncate">
                                                {formatPhone(chat.phone)}
                                            </p>
                                            <p className="text-sm text-neutral-500 truncate mt-1">
                                                {chat.lastMessage}
                                            </p>
                                        </div>
                                        <span className="text-xs text-neutral-400 ml-2 flex-shrink-0">
                                            {formatTime(chat.lastTime)}
                                        </span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Правая панель - сообщения */}
                <div className="flex-1 flex flex-col bg-neutral-50">
                    {!activeChat ? (
                        <div className="flex-1 flex items-center justify-center text-neutral-500">
                            <div className="text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <p className="text-lg">Выберите чат для начала общения</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Шапка чата */}
                            <div className="bg-white border-b border-neutral-200 p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-medium text-neutral-900">
                                            {formatPhone(activeChat)}
                                        </h3>
                                        <p className="text-sm text-neutral-500">WhatsApp</p>
                                    </div>
                                    {status?.connected ? (
                                        <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                            В сети
                                        </span>
                                    ) : (
                                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                            Не подключено
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Сообщения */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeChatMessages.length === 0 ? (
                                    <div className="text-center text-neutral-400 py-8">
                                        Нет сообщений. Начните диалог!
                                    </div>
                                ) : (
                                    activeChatMessages.map((msg, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex ${msg.direction === 'outgoing' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-md px-4 py-2 rounded-2xl ${
                                                    msg.direction === 'outgoing'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white text-neutral-900 border border-neutral-200'
                                                }`}
                                            >
                                                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                <div className={`flex items-center gap-1 mt-1 text-xs ${
                                                    msg.direction === 'outgoing' ? 'text-blue-100' : 'text-neutral-400'
                                                }`}>
                                                    <span>{formatTime(msg.created_at)}</span>
                                                    {msg.direction === 'outgoing' && (
                                                        <span>
                                                            {msg.status === 'sent' ? '✓✓' : msg.status === 'failed' ? '✗' : '✓'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Поле ввода */}
                            <div className="bg-white border-t border-neutral-200 p-4">
                                {!status?.connected ? (
                                    <div className="text-center py-3 text-amber-600 bg-amber-50 rounded-lg">
                                        ⚠️ WhatsApp не подключен. Перейдите в настройки для подключения.
                                    </div>
                                ) : (
                                    <form onSubmit={handleSendMessage} className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Введите сообщение..."
                                            className="flex-1 px-4 py-2 border border-neutral-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            disabled={sending}
                                        />
                                        <button
                                            type="submit"
                                            disabled={sending || !newMessage.trim()}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed"
                                        >
                                            {sending ? '...' : 'Отправить'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Модалка нового чата */}
            {showNewChat && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96">
                        <h3 className="text-lg font-medium text-neutral-900 mb-4">Новый чат</h3>
                        <input
                            type="text"
                            value={newPhone}
                            onChange={(e) => setNewPhone(e.target.value)}
                            placeholder="Номер телефона (79161234567)"
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowNewChat(false)}
                                className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleStartNewChat}
                                disabled={!newPhone.trim()}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-neutral-300"
                            >
                                Начать
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
