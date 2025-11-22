import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

export default function ProjectShow({ auth, order, project }) {
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [showCommentModal, setShowCommentModal] = useState(false);

    return (
        <AppLayout auth={auth}>
            <div className="p-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 mb-2">
                        <a href="/orders" className="hover:text-neutral-900">Заявки</a>
                        <span>/</span>
                        <span>Проект #{order.id}</span>
                    </div>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <h2 className="text-lg font-medium text-neutral-900 mb-4">Описание проекта</h2>
                            <DescriptionEditor project={project} />
                        </div>

                        {/* Links */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-neutral-900">Ссылки</h2>
                                <button
                                    onClick={() => setShowLinkModal(true)}
                                    className="px-3 py-1.5 text-sm bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
                                >
                                    Добавить ссылку
                                </button>
                            </div>
                            <LinksList project={project} />
                        </div>

                        {/* Comments & Remarks */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-lg font-medium text-neutral-900">Комментарии и замечания</h2>
                                <button
                                    onClick={() => setShowCommentModal(true)}
                                    className="px-3 py-1.5 text-sm bg-neutral-900 text-white rounded-md hover:bg-neutral-800"
                                >
                                    Добавить
                                </button>
                            </div>
                            <CommentsList project={project} authUserId={auth.user.id} />
                        </div>

                        {/* Client Review */}
                        {project.client_review && (
                            <div className="bg-white border border-green-200 rounded-lg p-6">
                                <h2 className="text-lg font-medium text-neutral-900 mb-4">Отзыв клиента</h2>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-neutral-900">
                                                {project.client_review.client_name}
                                            </span>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span key={star} className="text-yellow-400">
                                                        {star <= project.client_review.rating ? '★' : '☆'}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        {project.client_review.comment && (
                                            <p className="text-neutral-700 text-sm whitespace-pre-wrap p-4 bg-neutral-50 rounded-md">
                                                {project.client_review.comment}
                                            </p>
                                        )}
                                        <p className="text-xs text-neutral-500 mt-2">
                                            {new Date(project.client_review.created_at).toLocaleString('ru-RU')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Status */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <h3 className="text-sm font-medium text-neutral-900 mb-3">Статус проекта</h3>
                            <StatusSelector project={project} />
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
                            <h3 className="text-sm font-medium text-neutral-900 mb-3">Информация о заявке</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Альбом:</span>
                                    <span className="text-neutral-900">{order.album_type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Развороты:</span>
                                    <span className="text-neutral-900">{order.spreads}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-neutral-600">Сумма:</span>
                                    <span className="text-neutral-900">{order.total_price?.toLocaleString('ru-KZ')} ₸</span>
                                </div>
                            </div>
                        </div>

                        {/* Public Link */}
                        <div className="bg-white border border-neutral-200 rounded-lg p-6">
                            <h3 className="text-sm font-medium text-neutral-900 mb-3">Ссылка для клиента</h3>
                            <PublicLinkSection project={project} />
                        </div>
                    </div>
                </div>
            </div>

            {showLinkModal && <LinkModal project={project} onClose={() => setShowLinkModal(false)} />}
            {showCommentModal && <CommentModal project={project} onClose={() => setShowCommentModal(false)} />}
        </AppLayout>
    );
}

function PublicLinkSection({ project }) {
    const [copied, setCopied] = useState(false);

    const generateLink = () => {
        router.post(`/projects/${project.id}/generate-link`);
    };

    const copyToClipboard = () => {
        const url = `${window.location.origin}/public/project/${project.public_token}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!project.public_token) {
        return (
            <button
                onClick={generateLink}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
                Сгенерировать ссылку
            </button>
        );
    }

    const publicUrl = `${window.location.origin}/public/project/${project.public_token}`;

    return (
        <div className="space-y-3">
            <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200">
                <p className="text-xs text-neutral-600 mb-1">Публичная ссылка</p>
                <p className="text-xs text-neutral-900 break-all font-mono">{publicUrl}</p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={copyToClipboard}
                    className="flex-1 px-3 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 text-sm transition-colors"
                >
                    {copied ? '✓ Скопировано' : 'Копировать'}
                </button>
                <a
                    href={publicUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 border border-neutral-300 text-neutral-700 rounded-md hover:bg-neutral-50 text-sm text-center transition-colors"
                >
                    Открыть
                </a>
            </div>
        </div>
    );
}

function DescriptionEditor({ project }) {
    const [isEditing, setIsEditing] = useState(false);
    const { data, setData, put, processing } = useForm({
        description: project.description || '',
    });

    const handleSave = () => {
        put(`/projects/${project.id}`, {
            onSuccess: () => setIsEditing(false),
        });
    };

    if (isEditing) {
        return (
            <div className="space-y-3">
                <textarea
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    placeholder="Опишите детали проекта..."
                />
                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={processing}
                        className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-50"
                    >
                        Сохранить
                    </button>
                    <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
                    >
                        Отмена
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div onClick={() => setIsEditing(true)} className="cursor-pointer hover:bg-neutral-50 p-3 rounded-md transition-colors min-h-[100px]">
            {project.description ? (
                <p className="text-neutral-700 whitespace-pre-wrap">{project.description}</p>
            ) : (
                <p className="text-neutral-400 italic">Нажмите, чтобы добавить описание...</p>
            )}
        </div>
    );
}

function LinksList({ project }) {
    const links = project.links || [];

    const handleDelete = (index) => {
        const newLinks = links.filter((_, i) => i !== index);
        router.put(`/projects/${project.id}`, { links: newLinks });
    };

    const getLinkIcon = (type) => {
        if (type === 'youtube') return '🎥';
        if (type === 'drive') return '📁';
        return '🔗';
    };

    if (links.length === 0) {
        return <p className="text-neutral-500 text-sm">Нет добавленных ссылок</p>;
    }

    return (
        <div className="space-y-2">
            {links.map((link, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-neutral-200 rounded-md hover:bg-neutral-50">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="text-2xl">{getLinkIcon(link.type)}</span>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-neutral-900 truncate">
                                {link.title || link.url}
                            </div>
                            <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:underline truncate block"
                            >
                                {link.url}
                            </a>
                        </div>
                    </div>
                    <button
                        onClick={() => handleDelete(index)}
                        className="text-red-600 hover:text-red-800 text-sm ml-3"
                    >
                        Удалить
                    </button>
                </div>
            ))}
        </div>
    );
}

function CommentsList({ project, authUserId }) {
    const comments = project.comments || [];

    const handleResolve = (commentId) => {
        router.put(`/projects/comments/${commentId}/resolve`);
    };

    const handleDelete = (commentId) => {
        if (confirm('Удалить комментарий?')) {
            router.delete(`/projects/comments/${commentId}`);
        }
    };

    if (comments.length === 0) {
        return <p className="text-neutral-500 text-sm">Нет комментариев</p>;
    }

    return (
        <div className="space-y-4">
            {comments.map((comment) => (
                <div
                    key={comment.id}
                    className={`p-4 rounded-lg border ${
                        comment.type === 'remark'
                            ? comment.is_resolved
                                ? 'bg-green-50 border-green-200'
                                : 'bg-yellow-50 border-yellow-200'
                            : 'bg-neutral-50 border-neutral-200'
                    }`}
                >
                    <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-neutral-900">{comment.user?.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded ${
                                comment.type === 'remark' ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-200 text-blue-800'
                            }`}>
                                {comment.type === 'remark' ? 'Замечание' : 'Комментарий'}
                            </span>
                            {comment.is_resolved && (
                                <span className="text-xs px-2 py-0.5 rounded bg-green-200 text-green-800">
                                    Решено
                                </span>
                            )}
                        </div>
                        <span className="text-xs text-neutral-500">
                            {new Date(comment.created_at).toLocaleString('ru-RU')}
                        </span>
                    </div>
                    <p className="text-neutral-700 text-sm whitespace-pre-wrap mb-3">{comment.comment}</p>
                    <div className="flex gap-2">
                        {comment.type === 'remark' && (
                            <button
                                onClick={() => handleResolve(comment.id)}
                                className="text-xs text-neutral-600 hover:text-neutral-900"
                            >
                                {comment.is_resolved ? 'Отменить решение' : 'Отметить решённым'}
                            </button>
                        )}
                        {comment.user_id === authUserId && (
                            <button
                                onClick={() => handleDelete(comment.id)}
                                className="text-xs text-red-600 hover:text-red-800"
                            >
                                Удалить
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

function StatusSelector({ project }) {
    const statuses = [
        { value: 'in_progress', label: 'В работе', color: 'blue' },
        { value: 'review', label: 'На проверке', color: 'yellow' },
        { value: 'completed', label: 'Завершён', color: 'green' },
    ];

    const handleChange = (status) => {
        router.put(`/projects/${project.id}`, { status });
    };

    return (
        <div className="space-y-2">
            {statuses.map((status) => (
                <button
                    key={status.value}
                    onClick={() => handleChange(status.value)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                        project.status === status.value
                            ? `bg-${status.color}-100 text-${status.color}-800 border border-${status.color}-200`
                            : 'bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                    {status.label}
                </button>
            ))}
        </div>
    );
}

function LinkModal({ project, onClose }) {
    const { data, setData, processing, setData: setFormData, reset } = useForm({
        type: 'youtube',
        url: '',
        title: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentLinks = project.links || [];
        const newLinks = [...currentLinks, { type: data.type, url: data.url, title: data.title }];
        
        router.put(`/projects/${project.id}`, 
            { links: newLinks },
            { 
                onSuccess: () => {
                    onClose();
                },
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-medium text-neutral-900 mb-4">Добавить ссылку</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Тип</label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                            <option value="youtube">YouTube</option>
                            <option value="drive">Google Drive</option>
                            <option value="other">Другое</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">URL</label>
                        <input
                            type="url"
                            value={data.url}
                            onChange={(e) => setData('url', e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            placeholder="https://..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Название (необязательно)</label>
                        <input
                            type="text"
                            value={data.title}
                            onChange={(e) => setData('title', e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            placeholder="Фото со съёмки"
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-50"
                        >
                            Добавить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function CommentModal({ project, onClose }) {
    const { data, setData, post, processing } = useForm({
        comment: '',
        type: 'comment',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/projects/${project.id}/comments`, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h2 className="text-xl font-medium text-neutral-900 mb-4">Добавить комментарий</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Тип</label>
                        <select
                            value={data.type}
                            onChange={(e) => setData('type', e.target.value)}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        >
                            <option value="comment">Комментарий</option>
                            <option value="remark">Замечание</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Текст</label>
                        <textarea
                            value={data.comment}
                            onChange={(e) => setData('comment', e.target.value)}
                            rows={5}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            placeholder="Введите комментарий или замечание..."
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 disabled:opacity-50"
                        >
                            Добавить
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
