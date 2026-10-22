const db = require('../config/database');

const settingsController = {
    getAllSettings: (req, res, next) => {
        try {
            const rows = db.all('SELECT key, value FROM settings');
            const settingsObj = {};
            rows.forEach(r => {
                settingsObj[r.key] = r.value;
            });

            res.json({
                success: true,
                settings: settingsObj
            });
        } catch (err) {
            next(err);
        }
    },

    updateSettings: (req, res, next) => {
        try {
            const updates = req.body;
            if (!updates || typeof updates !== 'object') {
                return res.status(400).json({ success: false, message: "Sozlamalar ma'lumotlari kiritilmadi." });
            }

            const upsertStmt = db.prepare(`
                INSERT INTO settings (key, value)
                VALUES (?, ?)
                ON CONFLICT(key) DO UPDATE SET value = excluded.value
            `);

            for (const [k, v] of Object.entries(updates)) {
                upsertStmt.run(k, String(v));
            }

            const rows = db.all('SELECT key, value FROM settings');
            const settingsObj = {};
            rows.forEach(r => {
                settingsObj[r.key] = r.value;
            });

            res.json({
                success: true,
                message: "Tizim sozlamalari muvaffaqiyatli saqlandi!",
                settings: settingsObj
            });
        } catch (err) {
            next(err);
        }
    },

    testTelegram: async (req, res, next) => {
        try {
            const { botToken, chatId } = req.body;
            const telegramService = require('../services/telegramService');

            const timeStr = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
            const testMsg = `
🔔 <b>DILBAR EDICATION BOT TEST XABARI</b>
━━━━━━━━━━━━━━━━━━━━
✅ Telegram bot integratsiyasi muvaffaqiyatli ulandi!
📅 Sana: <i>${timeStr}</i>
🌐 Sayt: <b>DILBAR EDICATION Rasmiy Portali</b>
━━━━━━━━━━━━━━━━━━━━
⚡️ <i>Endi barcha onlayn arizalar ushbu chatga kelib tushadi!</i>
`.trim();

            const sendRes = await telegramService.sendTelegramMessage(testMsg, botToken, chatId);
            if (sendRes.success) {
                return res.json({
                    success: true,
                    message: "Telegram botga test xabari muvaffaqiyatli yuborildi!"
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: `Telegram xabari yuborilmadi: ${sendRes.error || sendRes.reason || "Bot Token yoki Chat ID noto'g'ri"}`
                });
            }
        } catch (err) {
            next(err);
        }
    }
};

module.exports = settingsController;
