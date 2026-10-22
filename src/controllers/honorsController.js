const db = require('../config/database');

const honorsController = {
    getAll: (req, res, next) => {
        try {
            const { category, search, limit, offset } = req.query;
            let sql = 'SELECT * FROM honors WHERE 1=1';
            const params = [];

            if (category && category !== 'all') {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (search) {
                sql += ' AND (student_name LIKE ? OR achievement_title LIKE ? OR description LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q);
            }

            sql += ' ORDER BY id ASC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const honors = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM honors').count;

            res.json({
                success: true,
                total,
                count: honors.length,
                data: honors
            });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const { id } = req.params;
            const honor = db.get('SELECT * FROM honors WHERE id = ?', [id]);
            if (!honor) {
                return res.status(404).json({ success: false, message: "Faxriy o'quvchi ma'lumoti topilmadi." });
            }
            res.json({ success: true, data: honor });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { student_name, class_val, achievement_title, category, badge_text, award_year, photo_url, description } = req.body;
            if (!student_name || !achievement_title) {
                return res.status(400).json({
                    success: false,
                    message: "O'quvchi F.I.SH va yutug'i to'ldirilishi shart!"
                });
            }

            const defaultPhoto = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop";

            const info = db.run(`
                INSERT INTO honors (student_name, class_val, achievement_title, category, badge_text, award_year, photo_url, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                student_name.trim(),
                class_val ? class_val.trim() : "10-A Sinf",
                achievement_title.trim(),
                category || 'olympiad',
                badge_text || "1-O'rin",
                award_year || '2026',
                photo_url && photo_url.trim() ? photo_url.trim() : defaultPhoto,
                description ? description.trim() : "Maktabimizning faxriy va iqtidorli o'quvchisi."
            ]);

            const created = db.get('SELECT * FROM honors WHERE id = ?', [info.lastInsertRowid]);
            res.status(201).json({
                success: true,
                message: "Faxriy o'quvchi muvaffaqiyatli saqlandi!",
                data: created
            });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM honors WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Yozuv topilmadi." });
            }

            const { student_name, class_val, achievement_title, category, badge_text, award_year, photo_url, description } = req.body;

            db.run(`
                UPDATE honors SET
                    student_name = ?,
                    class_val = ?,
                    achievement_title = ?,
                    category = ?,
                    badge_text = ?,
                    award_year = ?,
                    photo_url = ?,
                    description = ?
                WHERE id = ?
            `, [
                student_name ? student_name.trim() : existing.student_name,
                class_val ? class_val.trim() : existing.class_val,
                achievement_title ? achievement_title.trim() : existing.achievement_title,
                category || existing.category,
                badge_text || existing.badge_text,
                award_year || existing.award_year,
                photo_url ? photo_url.trim() : existing.photo_url,
                description !== undefined ? description.trim() : existing.description,
                id
            ]);

            const updated = db.get('SELECT * FROM honors WHERE id = ?', [id]);
            res.json({
                success: true,
                message: "Faxriy o'quvchi ma'lumoti yangilandi!",
                data: updated
            });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM honors WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Yozuv topilmadi." });
            }

            db.run('DELETE FROM honors WHERE id = ?', [id]);
            res.json({ success: true, message: "Faxriy o'quvchi o'chirildi." });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = honorsController;
