import makeWASocket, { 
    DisconnectReason, 
    useMultiFileAuthState,
    fetchLatestBaileysVersion
} from '@whiskeysockets/baileys';
import express from 'express';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import pino from 'pino';

const app = express();
app.use(express.json());

const PORT = process.env.WHATSAPP_SERVICE_PORT || 3001;
const logger = pino({ level: 'info' });

let sock = null;
let qrCodeData = null;
let connectionState = 'disconnected'; // disconnected, connecting, qr, connected

async function connectToWhatsApp() {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_state');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        logger,
        printQRInTerminal: false,
        auth: state,
        getMessage: async (key) => {
            return { conversation: 'Сообщение недоступно' };
        }
    });

    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            qrCodeData = qr;
            connectionState = 'qr';
            console.log('QR Code сгенерирован. Отсканируйте его в WhatsApp.');
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const statusCode = lastDisconnect?.error instanceof Boom 
                ? lastDisconnect.error.output.statusCode 
                : null;
            
            // Если сессия удалена в WhatsApp или разлогинились
            if (statusCode === DisconnectReason.loggedOut) {
                console.log('❌ Сессия удалена. Требуется повторная авторизация.');
                connectionState = 'disconnected';
                qrCodeData = null;
                // Очищаем auth_state для возможности новой авторизации
                try {
                    const fs = await import('fs');
                    const path = await import('path');
                    const authPath = path.default.resolve('./auth_state');
                    if (fs.default.existsSync(authPath)) {
                        fs.default.rmSync(authPath, { recursive: true, force: true });
                        console.log('🗑️ Auth state очищен');
                    }
                } catch (err) {
                    console.error('Ошибка очистки auth_state:', err);
                }
                return;
            }

            const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
            console.log('Соединение закрыто. Переподключение:', shouldReconnect);
            connectionState = 'disconnected';
            
            if (shouldReconnect) {
                setTimeout(() => connectToWhatsApp(), 5000);
            }
        } else if (connection === 'open') {
            console.log('✅ Подключено к WhatsApp');
            connectionState = 'connected';
            qrCodeData = null;
        } else if (connection === 'connecting') {
            connectionState = 'connecting';
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // Обработка входящих сообщений
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        for (const message of messages) {
            if (!message.message) continue;
            
            const from = message.key.remoteJid;
            const isFromMe = message.key.fromMe;
            const text = message.message.conversation || 
                        message.message.extendedTextMessage?.text || '';
            
            console.log(`📩 ${isFromMe ? 'Исходящее' : 'Входящее'} сообщение ${isFromMe ? 'для' : 'от'} ${from}: ${text}`);
            
            // Отправляем в Laravel для сохранения (и входящие и исходящие)
            try {
                const laravelUrl = process.env.LARAVEL_URL || 'http://127.0.0.1:8000';
                const phone = from.replace('@s.whatsapp.net', '');
                
                console.log(`📤 Отправка в Laravel: ${laravelUrl}/api/whatsapp/incoming`);
                console.log(`   Phone: ${phone}, Message: "${text}", Direction: ${isFromMe ? 'outgoing' : 'incoming'}`);
                
                const response = await fetch(`${laravelUrl}/api/whatsapp/incoming`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        phone: phone,
                        message: text,
                        direction: isFromMe ? 'outgoing' : 'incoming',
                        timestamp: message.messageTimestamp
                    })
                });
                
                if (response.ok) {
                    console.log(`✅ Сообщение успешно отправлено в Laravel`);
                } else {
                    const errorText = await response.text();
                    console.error(`❌ Laravel ответил с ошибкой (${response.status}): ${errorText}`);
                }
            } catch (error) {
                console.error('❌ Ошибка отправки в Laravel:', error.message);
            }
        }
    });
}

// API endpoints

// Получить статус подключения
app.get('/status', (req, res) => {
    res.json({
        status: connectionState,
        qr: connectionState === 'qr' ? qrCodeData : null,
        connected: connectionState === 'connected'
    });
});

// Отправить текстовое сообщение
app.post('/send-message', async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ 
                success: false, 
                error: 'Требуются параметры: phone и message' 
            });
        }

        if (connectionState !== 'connected' || !sock) {
            return res.status(503).json({ 
                success: false, 
                error: 'WhatsApp не подключен' 
            });
        }

        // Форматируем номер (добавляем @s.whatsapp.net если нужно)
        const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;

        await sock.sendMessage(jid, { text: message });

        res.json({ 
            success: true, 
            message: 'Сообщение отправлено',
            to: jid
        });
    } catch (error) {
        console.error('Ошибка отправки:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Отправить медиа (изображение/документ)
app.post('/send-media', async (req, res) => {
    try {
        const { phone, url, caption, type = 'image' } = req.body;

        if (!phone || !url) {
            return res.status(400).json({ 
                success: false, 
                error: 'Требуются параметры: phone и url' 
            });
        }

        if (connectionState !== 'connected' || !sock) {
            return res.status(503).json({ 
                success: false, 
                error: 'WhatsApp не подключен' 
            });
        }

        const jid = phone.includes('@') ? phone : `${phone}@s.whatsapp.net`;

        const mediaMessage = type === 'image' 
            ? { image: { url }, caption }
            : { document: { url }, caption, mimetype: 'application/pdf', fileName: 'document.pdf' };

        await sock.sendMessage(jid, mediaMessage);

        res.json({ 
            success: true, 
            message: 'Медиа отправлено',
            to: jid
        });
    } catch (error) {
        console.error('Ошибка отправки медиа:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// Отключить WhatsApp
app.post('/disconnect', async (req, res) => {
    try {
        if (sock) {
            await sock.logout();
            sock = null;
            connectionState = 'disconnected';
            qrCodeData = null;
        }
        res.json({ success: true, message: 'Отключено от WhatsApp' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Удалить сессию полностью (файлы auth_state)
app.post('/delete-session', async (req, res) => {
    try {
        if (sock) {
            await sock.logout();
            sock = null;
        }
        
        connectionState = 'disconnected';
        qrCodeData = null;
        
        // Удаляем папку с сессией
        const fs = await import('fs');
        const path = await import('path');
        const authPath = path.join(process.cwd(), 'auth_state');
        
        if (fs.existsSync(authPath)) {
            fs.rmSync(authPath, { recursive: true, force: true });
            console.log('🗑️ Сессия WhatsApp удалена');
        }
        
        res.json({ success: true, message: 'Сессия WhatsApp удалена' });
    } catch (error) {
        console.error('Ошибка удаления сессии:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Переподключиться
app.post('/reconnect', async (req, res) => {
    try {
        // Если уже подключено, просто отключаемся и переподключаемся
        if (sock) {
            sock.end(undefined);
            sock = null;
        }
        
        // Запускаем переподключение
        connectionState = 'connecting';
        setTimeout(() => connectToWhatsApp(), 500);
        
        res.json({ success: true, message: 'Переподключение инициировано' });
    } catch (error) {
        console.error('Reconnect error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 WhatsApp сервис запущен на порту ${PORT}`);
    connectToWhatsApp();
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('Останавливаем сервис...');
    if (sock) {
        await sock.end();
    }
    process.exit(0);
});
