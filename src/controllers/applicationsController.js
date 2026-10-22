const db = require('../config/database');
const telegramService = require('../services/telegramService');

const applicationsController = {
    getAll: (req, res, next) => {
        try {
            const { search, status, classVal, limit, offset } = req.query;
            let sql = 'SELECT * FROM applications WHERE 1=1';
            const params = [];

            if (status && status !== 'all') {
                sql += ' AND status LIKE ?';
                params.push(`%${status}%`);
            }

            if (classVal && classVal !== 'all') {
                sql += ' AND class_val LIKE ?';
                params.push(`%${classVal}%`);
            }

            if (search) {
                sql += ' AND (student_name LIKE ? OR parent_name LIKE ? OR parent_phone LIKE ? OR id LIKE ? OR address LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q, q, q);
            }

            sql += ' ORDER BY created_at DESC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const applications = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM applications').count;
            const pending = db.get("SELECT COUNT(*) as count FROM applications WHERE status NOT LIKE '%Tasdiqlandi%'").count;
            const approved = db.get("SELECT COUNT(*) as count FROM applications WHERE status LIKE '%Tasdiqlandi%'").count;

            res.json({
                success: true,
                total,
                pending,
                approved,
                count: applications.length,
                data: applications
            });
        } catch (err) {
            next(err);
        }
    },

    getStats: (req, res, next) => {
        try {
            const total = db.get('SELECT COUNT(*) as count FROM applications').count;
            const pending = db.get("SELECT COUNT(*) as count FROM applications WHERE status NOT LIKE '%Tasdiqlandi%'").count;
            const approved = db.get("SELECT COUNT(*) as count FROM applications WHERE status LIKE '%Tasdiqlandi%'").count;
            const primary = db.get("SELECT COUNT(*) as count FROM applications WHERE class_val LIKE '%1-%'").count;
            const middle = db.get("SELECT COUNT(*) as count FROM applications WHERE class_val NOT LIKE '%1-%'").count;

            res.json({
                success: true,
                stats: {
                    total,
                    pending,
                    approved,
                    primaryGradeApplications: primary,
                    otherGradeApplications: middle
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const app = db.get('SELECT * FROM applications WHERE id = ?', [req.params.id]);
            if (!app) {
                return res.status(404).json({ success: false, message: "Ariza topilmadi." });
            }
            res.json({ success: true, data: app });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const studentName = req.body.studentName || req.body.student_name;
            const birthDate = req.body.birthDate || req.body.birth_date;
            const gender = req.body.gender || 'male';
            const applyClass = req.body.applyClass || req.body.classVal || req.body.class_val;
            const address = req.body.address;
            const parentName = req.body.parentName || req.body.parent_name;
            const parentPhone = req.body.parentPhone || req.body.parent_phone;
            const parentEmail = req.body.parentEmail || req.body.parent_email;

            if (!studentName || !parentName || !parentPhone) {
                return res.status(400).json({
                    success: false,
                    message: "Iltimos, barcha majburiy maydonlarni to'ldiring!"
                });
            }

            const customId = req.body.id;
            const randomId = customId || `G1-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            const classVal = applyClass ? (applyClass.includes('sinf') ? applyClass : `${applyClass}-sinf`) : '1-sinf';

            db.run(`
                INSERT INTO applications (id, student_name, birth_date, gender, class_val, address, parent_name, parent_phone, parent_email, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                randomId,
                studentName.trim(),
                birthDate || null,
                gender,
                classVal,
                address ? address.trim() : "Toshkent sh.",
                parentName.trim(),
                parentPhone.trim(),
                parentEmail ? parentEmail.trim() : null,
                "Yangi (Ko'rib chiqilmoqda)"
            ]);

            const createdApp = db.get('SELECT * FROM applications WHERE id = ?', [randomId]);

            // Asynchronously dispatch Telegram Bot Notification
            telegramService.sendApplicationNotification(createdApp).catch(err => {
                console.warn('⚠️ [TELEGRAM BOT] Xabar yuborishda xatolik:', err.message);
            });

            res.status(201).json({
                success: true,
                message: "Qabul arizangiz muvaffaqiyatli qabul qilindi!",
                id: randomId,
                data: createdApp
            });
        } catch (err) {
            next(err);
        }
    },

    updateStatus: (req, res, next) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const existing = db.get('SELECT * FROM applications WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Ariza topilmadi." });
            }

            const newStatus = status || 'Tasdiqlandi';
            db.run('UPDATE applications SET status = ? WHERE id = ?', [newStatus, id]);

            res.json({
                success: true,
                message: `Ariza holati "${newStatus}" ga o'zgartirildi!`,
                data: { ...existing, status: newStatus }
            });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM applications WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Ariza topilmadi." });
            }

            const { studentName, birthDate, gender, classVal, address, parentName, parentPhone, parentEmail, status } = req.body;

            db.run(`
                UPDATE applications SET
                    student_name = ?,
                    birth_date = ?,
                    gender = ?,
                    class_val = ?,
                    address = ?,
                    parent_name = ?,
                    parent_phone = ?,
                    parent_email = ?,
                    status = ?
                WHERE id = ?
            `, [
                studentName ? studentName.trim() : existing.student_name,
                birthDate || existing.birth_date,
                gender || existing.gender,
                classVal || existing.class_val,
                address ? address.trim() : existing.address,
                parentName ? parentName.trim() : existing.parent_name,
                parentPhone ? parentPhone.trim() : existing.parent_phone,
                parentEmail ? parentEmail.trim() : existing.parent_email,
                status || existing.status,
                id
            ]);

            const updated = db.get('SELECT * FROM applications WHERE id = ?', [id]);
            res.json({
                success: true,
                message: "Ariza ma'lumotlari muvaffaqiyatli yangilandi!",
                data: updated
            });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM applications WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Ariza topilmadi." });
            }

            db.run('DELETE FROM applications WHERE id = ?', [id]);
            res.json({
                success: true,
                message: "Ariza muvaffaqiyatli o'chirildi."
            });
        } catch (err) {
            next(err);
        }
    },

    exportCsv: (req, res, next) => {
        try {
            const applications = db.all('SELECT * FROM applications ORDER BY created_at DESC');
            
            let csv = '\uFEFF'; // UTF-8 BOM for Excel in Uzbek/Cyrillic/Latin
            csv += 'ID,Oquvchi FISH,Sinf,Tugilgan sana,Jinsi,Manzil,Ota-onasi FISH,Telefon,Email,Holati,Topshirilgan vaqt\n';

            applications.forEach(a => {
                const row = [
                    `"${a.id}"`,
                    `"${(a.student_name || '').replace(/"/g, '""')}"`,
                    `"${(a.class_val || '').replace(/"/g, '""')}"`,
                    `"${a.birth_date || ''}"`,
                    `"${a.gender || ''}"`,
                    `"${(a.address || '').replace(/"/g, '""')}"`,
                    `"${(a.parent_name || '').replace(/"/g, '""')}"`,
                    `"${a.parent_phone || ''}"`,
                    `"${a.parent_email || ''}"`,
                    `"${a.status || ''}"`,
                    `"${a.created_at || ''}"`
                ];
                csv += row.join(',') + '\n';
            });

            res.setHeader('Content-Type', 'text/csv; charset=utf-8');
            res.setHeader('Content-Disposition', 'attachment; filename="dilbar-education-arizalar.csv"');
            res.status(200).send(csv);
        } catch (err) {
            next(err);
        }
    }
};

module.exports = applicationsController;
