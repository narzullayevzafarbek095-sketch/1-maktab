const db = require('../config/database');

const teachersController = {
    getAll: (req, res, next) => {
        try {
            const { category, search } = req.query;
            let sql = 'SELECT * FROM teachers WHERE 1=1';
            const params = [];

            if (category && category !== 'all') {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (search) {
                sql += ' AND (name LIKE ? OR role LIKE ? OR bio LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q);
            }

            sql += ' ORDER BY id ASC';

            const teachers = db.all(sql, params);
            res.json({ success: true, total: teachers.length, data: teachers });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const { id } = req.params;
            const teacher = db.get('SELECT * FROM teachers WHERE id = ?', [id]);
            if (!teacher) {
                return res.status(404).json({ success: false, message: "O'qituvchi topilmadi." });
            }
            res.json({ success: true, data: teacher });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { name, role, category, bio, email, hours, photo_url } = req.body;
            if (!name || !role) {
                return res.status(400).json({ success: false, message: "Ustoz F.I.SH va lavozimi to'ldirilishi shart!" });
            }

            const defaultPhoto = "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop";

            const info = db.run(`
                INSERT INTO teachers (name, role, category, bio, email, hours, photo_url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                name.trim(),
                role.trim(),
                category || "exact",
                bio ? bio.trim() : "Oliy toifali tajribali pedagog.",
                email ? email.trim() : "ustoz@dilbareducation.uz",
                hours ? hours.trim() : "Dushanba – Juma",
                photo_url && photo_url.trim() ? photo_url.trim() : defaultPhoto
            ]);

            const created = db.get('SELECT * FROM teachers WHERE id = ?', [info.lastInsertRowid]);
            res.status(201).json({ success: true, message: "O'qituvchi muvaffaqiyatli qo'shildi!", data: created });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM teachers WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "O'qituvchi topilmadi." });
            }

            const { name, role, category, bio, email, hours, photo_url } = req.body;

            db.run(`
                UPDATE teachers SET
                    name = ?,
                    role = ?,
                    category = ?,
                    bio = ?,
                    email = ?,
                    hours = ?,
                    photo_url = ?
                WHERE id = ?
            `, [
                name ? name.trim() : existing.name,
                role ? role.trim() : existing.role,
                category || existing.category,
                bio !== undefined ? bio.trim() : existing.bio,
                email ? email.trim() : existing.email,
                hours ? hours.trim() : existing.hours,
                photo_url ? photo_url.trim() : existing.photo_url,
                id
            ]);

            const updated = db.get('SELECT * FROM teachers WHERE id = ?', [id]);
            res.json({ success: true, message: "O'qituvchi ma'lumotlari yangilandi!", data: updated });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM teachers WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "O'qituvchi topilmadi." });
            }

            db.run('DELETE FROM teachers WHERE id = ?', [id]);
            res.json({ success: true, message: "O'qituvchi muvaffaqiyatli o'chirildi." });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = teachersController;
