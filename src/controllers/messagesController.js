const db = require('../config/database');
const telegramService = require('../services/telegramService');

const messagesController = {
    getAll: (req, res, next) => {
        try {
            const { is_read, search, limit, offset } = req.query;
            let sql = 'SELECT * FROM messages WHERE 1=1';
            const params = [];

            if (is_read !== undefined) {
                sql += ' AND is_read = ?';
                params.push(parseInt(is_read, 10));
            }

            if (search) {
                sql += ' AND (name LIKE ? OR phone LIKE ? OR topic LIKE ? OR message LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q, q);
            }

            sql += ' ORDER BY created_at DESC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const messages = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM messages').count;
            const unread = db.get('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').count;

            res.json({
                success: true,
                total,
                unread,
                count: messages.length,
                data: messages
            });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const { id } = req.params;
            const msg = db.get('SELECT * FROM messages WHERE id = ?', [id]);
            if (!msg) {
                return res.status(404).json({ success: false, message: "Murojaat topilmadi." });
            }
            res.json({ success: true, data: msg });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { name, phone, topic, message } = req.body;
            if (!name || !phone || !message) {
                return res.status(400).json({
                    success: false,
                    message: "Ismingiz, telefon raqamingiz va xabar matnini to'ldiring!"
                });
            }

            const info = db.run(`
                INSERT INTO messages (name, phone, topic, message, is_read)
                VALUES (?, ?, ?, ?, 0)
            `, [name.trim(), phone.trim(), topic ? topic.trim() : "Umumiy Murojaat", message.trim()]);

            const createdMsg = db.get('SELECT * FROM messages WHERE id = ?', [info.lastInsertRowid]);

            // Asynchronously dispatch Telegram Bot Notification
            telegramService.sendMessageNotification(createdMsg).catch(err => {
                console.warn('⚠️ [TELEGRAM BOT] Xabar yuborishda xatolik:', err.message);
            });

            res.status(201).json({
                success: true,
                message: "Murojaatingiz maktab ma'muriyatiga muvaffaqiyatli yuborildi!",
                data: createdMsg
            });
        } catch (err) {
            next(err);
        }
    },

    markRead: (req, res, next) => {
        try {
            const { id } = req.params;
            const { is_read } = req.body;
            const readVal = is_read !== undefined ? (is_read ? 1 : 0) : 1;

            const existing = db.get('SELECT * FROM messages WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Murojaat topilmadi." });
            }

            db.run('UPDATE messages SET is_read = ? WHERE id = ?', [readVal, id]);
            res.json({ success: true, message: "Murojaat holati yangilandi." });
        } catch (err) {
            next(err);
        }
    },

    markAllRead: (req, res, next) => {
        try {
            db.run('UPDATE messages SET is_read = 1 WHERE is_read = 0');
            res.json({ success: true, message: "Barcha murojaatlar o'qilgan deb belgilandi." });
        } catch (err) {
            next(err);
        }
    },

    reply: (req, res, next) => {
        try {
            const { id } = req.params;
            const { replyText } = req.body;

            if (!replyText || !replyText.trim()) {
                return res.status(400).json({ success: false, message: "Javob matnini kiriting!" });
            }

            const existing = db.get('SELECT * FROM messages WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Murojaat topilmadi." });
            }

            db.run('UPDATE messages SET reply = ?, is_read = 1 WHERE id = ?', [replyText.trim(), id]);
            const updated = db.get('SELECT * FROM messages WHERE id = ?', [id]);

            res.json({
                success: true,
                message: "Murojaatga javob muvaffaqiyatli biriktirildi!",
                data: updated
            });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM messages WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Murojaat topilmadi." });
            }

            db.run('DELETE FROM messages WHERE id = ?', [id]);
            res.json({ success: true, message: "Murojaat muvaffaqiyatli o'chirildi." });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = messagesController;
