import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function PublicView({ project, order }) {
    const getLinkIcon = (type) => {
        if (type === 'youtube') return '🎥';
        if (type === 'drive') return '📁';
        return '🔗';
    };

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <h1 className="text-3xl font-light text-neutral-900 mb-2">
                        {project.title}
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span>Клиент: {order.name}</span>
                        <span>•</span>
                        <span>{order.grade_level}</span>
                        <span>•</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                            project.status === 'completed' ? 'bg-green-100 text-green-700' :
                            project.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                        }`}>
                            {project.status === 'in_progress' ? 'В работе' :
                             project.status === 'review' ? 'На проверке' : 'Завершён'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        {project.description && (
                            <div className="bg-white border border-neutral-200 rounded-lg p-6">
                                <h2 className="text-lg font-medium text-neutral-900 mb-4">Описание проекта</h2>
                                <p className="text-neutral-700 whitespace-pre-wrap">{project.description}</p>
                            </div>
                        )}

                        {/* Links */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <h2 className="text-lg font-medium text-neutral-900 mb-4">Ссылки на материалы</h2>
                            {project.links && project.links.length > 0 ? (
                                <div className="space-y-3">
                                    {project.links.map((link, index) => (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-4 border border-neutral-200 rounded-md hover:bg-neutral-50 hover:border-neutral-300 transition-colors"
                                        >
                                            <span className="text-3xl">{getLinkIcon(link.type)}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-neutral-900 truncate">
                                                    {link.title || 'Открыть ссылку'}
                                                </div>
                                                <div className="text-xs text-neutral-500 truncate">
                                                    {link.type === 'youtube' ? 'YouTube видео' :
                                                     link.type === 'drive' ? 'Google Drive' : 'Ссылка'}
                                                </div>
                                            </div>
                                            <svg className="w-5 h-5 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-neutral-500 text-sm py-8 text-center">
                                    Материалы ещё не загружены
                                </p>
                            )}
                        </div>

                        {/* Client Review Form */}
                        <ClientReviewForm project={project} existingReview={project.client_review} />

                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <h3 className="text-sm font-medium text-neutral-900 mb-3">Статус проекта</h3>
                            <div className={`px-4 py-3 rounded-md text-center ${
                                project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                project.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                                {project.status === 'in_progress' ? 'В работе' :
                                 project.status === 'review' ? 'На проверке' : 'Завершён'}
                            </div>
                        </div>

                        {/* Team */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <h3 className="text-sm font-medium text-neutral-900 mb-3">Команда</h3>
                            <div className="space-y-3">
                                {order.photographer && (
                                    <div>
                                        <div className="text-xs text-neutral-600">Фотограф</div>
                                        <div className="text-sm text-neutral-900">{order.photographer.name}</div>
                                    </div>
                                )}
                                {order.editor && (
                                    <div>
                                        <div className="text-xs text-neutral-600">Редактор</div>
                                        <div className="text-sm text-neutral-900">{order.editor.name}</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Info */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <h3 className="text-sm font-medium text-neutral-900 mb-3">Информация о заказе</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Альбом:</span>
                                    <span className="text-neutral-900">{order.album_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Развороты:</span>
                                    <span className="text-neutral-900">{order.spreads}</span>
                                </div>
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">
                                💡 Нужна помощь?
                            </h3>
                            <p className="text-xs text-blue-700">
                                Если у вас есть вопросы по проекту, свяжитесь с нами по телефону или email.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-neutral-200 mt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <p className="text-center text-sm text-neutral-600">
                        © 2025 Vinetka Pro CRM. Все права защищены.
                    </p>
                </div>
            </div>
        </div>
    );
}

function ClientReviewForm({ project, existingReview }) {
    const [rating, setRating] = useState(existingReview?.rating || 0);
    const [comment, setComment] = useState(existingReview?.comment || '');
    const [clientName, setClientName] = useState(existingReview?.client_name || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        router.post(`/public/project/${project.public_token}/review`, {
            rating,
            comment,
            client_name: clientName,
        }, {
            onSuccess: () => {
                setShowSuccess(true);
                setTimeout(() => setShowSuccess(false), 3000);
                setIsSubmitting(false);
            },
            onError: () => {
                setIsSubmitting(false);
            }
        });
    };

    if (existingReview) {
        return (
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-neutral-900 mb-4">Ваша оценка</h2>
                <div className="space-y-4">
                    <div>
                        <div className="flex gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span key={star} className="text-2xl text-yellow-400">
                                    {star <= existingReview.rating ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                    </div>
                    {existingReview.comment && (
                        <div className="p-4 bg-neutral-50 rounded-md">
                            <p className="text-sm text-neutral-700 whitespace-pre-wrap">{existingReview.comment}</p>
                        </div>
                    )}
                    <p className="text-xs text-neutral-500">
                        Спасибо за вашу оценку! Мы ценим ваше мнение.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h2 className="text-lg font-medium text-neutral-900 mb-4">Оцените нашу работу</h2>
            
            {showSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-800">✓ Спасибо за вашу оценку!</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Ваше имя
                    </label>
                    <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Введите ваше имя"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Оценка (от 1 до 5)
                    </label>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                className="text-3xl transition-colors hover:scale-110 transform"
                            >
                                <span className={star <= rating ? 'text-yellow-400' : 'text-neutral-300'}>
                                    {star <= rating ? '★' : '☆'}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Комментарий (необязательно)
                    </label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Расскажите о вашем опыте работы с нами..."
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting || rating === 0}
                    className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-neutral-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {isSubmitting ? 'Отправка...' : 'Отправить оценку'}
                </button>
            </form>
        </div>
    );
}
