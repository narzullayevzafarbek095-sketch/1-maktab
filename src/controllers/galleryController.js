const db = require('../config/database');

const galleryController = {
    getAll: (req, res, next) => {
        try {
            const { category, search } = req.query;
            let sql = 'SELECT * FROM gallery WHERE 1=1';
            const params = [];

            if (category && category !== 'all') {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (search) {
                sql += ' AND (title LIKE ? OR tag LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q);
            }

            sql += ' ORDER BY id DESC';

            const photos = db.all(sql, params);
            res.json({ success: true, total: photos.length, data: photos });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const { id } = req.params;
            const photo = db.get('SELECT * FROM gallery WHERE id = ?', [id]);
            if (!photo) {
                return res.status(404).json({ success: false, message: "Surat topilmadi." });
            }
            res.json({ success: true, data: photo });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { title, tag, category, img_url } = req.body;
            if (!title || !img_url) {
                return res.status(400).json({ success: false, message: "Surat sarlavhasi va havolasini kiriting!" });
            }

            const info = db.run(`
                INSERT INTO gallery (title, tag, category, img_url)
                VALUES (?, ?, ?, ?)
            `, [
                title.trim(),
                tag ? tag.trim() : "Maktab Hayoti",
                category || "campus",
                img_url.trim()
            ]);

            const created = db.get('SELECT * FROM gallery WHERE id = ?', [info.lastInsertRowid]);
            res.status(201).json({ success: true, message: "Surat galereyaga muvaffaqiyatli qo'shildi!", data: created });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM gallery WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Surat topilmadi." });
            }

            const { title, tag, category, img_url } = req.body;

            db.run(`
                UPDATE gallery SET
                    title = ?,
                    tag = ?,
                    category = ?,
                    img_url = ?
                WHERE id = ?
            `, [
                title ? title.trim() : existing.title,
                tag ? tag.trim() : existing.tag,
                category || existing.category,
                img_url ? img_url.trim() : existing.img_url,
                id
            ]);

            const updated = db.get('SELECT * FROM gallery WHERE id = ?', [id]);
            res.json({ success: true, message: "Surat ma'lumotlari yangilandi!", data: updated });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM gallery WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Surat topilmadi." });
            }

            db.run('DELETE FROM gallery WHERE id = ?', [id]);
            res.json({ success: true, message: "Surat galereyadan o'chirildi." });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = galleryController;
