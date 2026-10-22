const db = require('../config/database');

/**
 * ==========================================================================
 * DILBAR EDICATION TELEGRAM BOT NOTIFICATION SERVICE
 * ==========================================================================
 */

/**
 * Get Telegram credentials from environment variables or settings table
 */
function getTelegramConfig() {
    let botToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    let chatId = (process.env.TELEGRAM_CHAT_ID || '').trim();

    try {
        if (!botToken) {
            const row = db.get("SELECT value FROM settings WHERE key = 'telegram_bot_token'");
            if (row && row.value) botToken = row.value.trim();
        }
        if (!chatId) {
            const row = db.get("SELECT value FROM settings WHERE key = 'telegram_chat_id'");
            if (row && row.value) chatId = row.value.trim();
        }
    } catch (e) {
        // Ignore DB read errors
    }

    return { botToken, chatId };
}

/**
 * Send raw HTML message to Telegram Chat
 */
async function sendTelegramMessage(htmlText, customToken = null, customChatId = null) {
    const { botToken, chatId } = getTelegramConfig();
    const token = customToken || botToken;
    const targetChat = customChatId || chatId;

    if (!token || !targetChat) {
        console.log('ℹ️ [TELEGRAM BOT] Bot token yoki Chat ID sozlanmagan. Xabar konsolga chiqarildi:');
        console.log(htmlText.replace(/<[^>]*>?/gm, ''));
        return { success: false, reason: 'credentials_missing' };
    }

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: targetChat,
                text: htmlText,
                parse_mode: 'HTML',
                disable_web_page_preview: true
            })
        });

        const data = await res.json();
        if (data.ok) {
            console.log(`✅ [TELEGRAM BOT] Telegram xabari yuborildi (Chat ID: ${targetChat})`);
            return { success: true, data };
        } else {
            console.warn(`⚠️ [TELEGRAM BOT] Telegram rad etdi: ${data.description}`);
            return { success: false, error: data.description };
        }
    } catch (err) {
        console.error('❌ [TELEGRAM BOT] Tarmoq xatosi:', err.message);
        return { success: false, error: err.message };
    }
}

/**
 * Format and send application notification
 */
async function sendApplicationNotification(app) {
    const timeStr = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
    const genderUz = app.gender === 'female' ? '👧 Qiz bola' : "👦 O'g'il bola";

    const text = `
🎓 <b>YANGI QABUL ARIZASI TUSHDI!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Ariza raqami:</b> <code>#${escapeHtml(app.id || 'NOMA\'LUM')}</code>
👤 <b>O'quvchi F.I.SH:</b> <b>${escapeHtml(app.student_name || app.studentName || '-')}</b>
🎂 <b>Tug'ilgan sana:</b> ${escapeHtml(app.birth_date || app.birthDate || "Ko'rsatilmagan")}
⚧ <b>Jinsi:</b> ${genderUz}
🏫 <b>Tanlangan sinf:</b> <b>${escapeHtml(app.class_val || app.applyClass || '-')}</b>
📍 <b>Yashash manzili:</b> ${escapeHtml(app.address || "Toshkent shahri")}

👨‍👩‍👦 <b>Ota-onasi:</b> <b>${escapeHtml(app.parent_name || app.parentName || '-')}</b>
📞 <b>Telefon raqam:</b> <b>${escapeHtml(app.parent_phone || app.parentPhone || '-')}</b>
✉️ <b>Elektron pochta:</b> ${escapeHtml(app.parent_email || app.parentEmail || "Mavjud emas")}

📅 <b>Ariza vaqti:</b> <i>${timeStr}</i>
━━━━━━━━━━━━━━━━━━━━
⚡️ <b>DILBAR EDICATION Rasmiy Portali</b>
`.trim();

    return await sendTelegramMessage(text);
}

/**
 * Format and send message / contact appeal notification
 */
async function sendMessageNotification(msg) {
    const timeStr = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' });
    const text = `
📩 <b>YANGI MUROJAAT (ALOQA BO'LIMI)</b>
━━━━━━━━━━━━━━━━━━━━
👤 <b>Yuboruvchi:</b> <b>${escapeHtml(msg.name || '-')}</b>
📞 <b>Telefon:</b> <b>${escapeHtml(msg.phone || '-')}</b>
✉️ <b>Email:</b> ${escapeHtml(msg.email || "Mavjud emas")}
🏷 <b>Mavzu:</b> <b>${escapeHtml(msg.topic || 'Umumiy savol')}</b>

📝 <b>Murojaat matni:</b>
<i>"${escapeHtml(msg.message || '-')}"</i>

📅 <b>Yuborilgan vaqt:</b> <i>${timeStr}</i>
━━━━━━━━━━━━━━━━━━━━
⚡️ <b>DILBAR EDICATION Rasmiy Portali</b>
`.trim();

    return await sendTelegramMessage(text);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

module.exports = {
    getTelegramConfig,
    sendTelegramMessage,
    sendApplicationNotification,
    sendMessageNotification
};
