const db = require('../config/database');

const booksController = {
    getAll: (req, res, next) => {
        try {
            const { category, classLevel, search, limit, offset } = req.query;
            let sql = 'SELECT * FROM books WHERE 1=1';
            const params = [];

            if (category && category !== 'all') {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (classLevel && classLevel !== 'all') {
                sql += ' AND class_level = ?';
                params.push(classLevel);
            }

            if (search) {
                sql += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q);
            }

            sql += ' ORDER BY id ASC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const books = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM books').count;

            res.json({
                success: true,
                total,
                count: books.length,
                data: books
            });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const { id } = req.params;
            const book = db.get('SELECT * FROM books WHERE id = ?', [id]);
            if (!book) {
                return res.status(404).json({ success: false, message: "Darslik / kitob topilmadi." });
            }
            res.json({ success: true, data: book });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { title, author, category, class_level, pages, cover_img, pdf_url, file_size, description } = req.body;
            if (!title || !author) {
                return res.status(400).json({
                    success: false,
                    message: "Darslik nomi va muallifini to'ldiring!"
                });
            }

            const defaultCover = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop";

            const info = db.run(`
                INSERT INTO books (title, author, category, class_level, pages, cover_img, pdf_url, file_size, downloads_count, description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
            `, [
                title.trim(),
                author.trim(),
                category || 'exact',
                class_level || '7-sinf',
                pages ? parseInt(pages, 10) : 180,
                cover_img && cover_img.trim() ? cover_img.trim() : defaultCover,
                pdf_url && pdf_url.trim() ? pdf_url.trim() : '#',
                file_size ? file_size.trim() : '15.4 MB',
                description ? description.trim() : "Davlat ta'lim standarti asosidagi rasmiy umumta'lim darsligi."
            ]);

            const created = db.get('SELECT * FROM books WHERE id = ?', [info.lastInsertRowid]);
            res.status(201).json({
                success: true,
                message: "Yangi elektron darslik muvaffaqiyatli saqlandi!",
                data: created
            });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM books WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Darslik topilmadi." });
            }

            const { title, author, category, class_level, pages, cover_img, pdf_url, file_size, description } = req.body;

            db.run(`
                UPDATE books SET
                    title = ?,
                    author = ?,
                    category = ?,
                    class_level = ?,
                    pages = ?,
                    cover_img = ?,
                    pdf_url = ?,
                    file_size = ?,
                    description = ?
                WHERE id = ?
            `, [
                title ? title.trim() : existing.title,
                author ? author.trim() : existing.author,
                category || existing.category,
                class_level || existing.class_level,
                pages !== undefined ? parseInt(pages, 10) : existing.pages,
                cover_img ? cover_img.trim() : existing.cover_img,
                pdf_url ? pdf_url.trim() : existing.pdf_url,
                file_size ? file_size.trim() : existing.file_size,
                description !== undefined ? description.trim() : existing.description,
                id
            ]);

            const updated = db.get('SELECT * FROM books WHERE id = ?', [id]);
            res.json({
                success: true,
                message: "Darslik ma'lumotlari muvaffaqiyatli yangilandi!",
                data: updated
            });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM books WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Darslik topilmadi." });
            }

            db.run('DELETE FROM books WHERE id = ?', [id]);
            res.json({ success: true, message: "Darslik kutubxonadan o'chirildi." });
        } catch (err) {
            next(err);
        }
    },

    incrementDownload: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM books WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Darslik topilmadi." });
            }

            db.run('UPDATE books SET downloads_count = downloads_count + 1 WHERE id = ?', [id]);
            res.json({
                success: true,
                message: "Yuklab olish hisoblandi.",
                downloads: existing.downloads_count + 1
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = booksController;
