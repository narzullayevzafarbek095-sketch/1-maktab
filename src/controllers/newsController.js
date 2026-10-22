const db = require('../config/database');

const newsController = {
    getAll: (req, res, next) => {
        try {
            const { category, search, limit, offset } = req.query;
            let sql = 'SELECT * FROM news WHERE 1=1';
            const params = [];

            if (category && category !== 'all') {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (search) {
                sql += ' AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q);
            }

            sql += ' ORDER BY id DESC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const newsList = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM news').count;

            res.json({
                success: true,
                total,
                count: newsList.length,
                data: newsList
            });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const { id } = req.params;
            const news = db.get('SELECT * FROM news WHERE id = ?', [id]);
            if (!news) {
                return res.status(404).json({ success: false, message: "Yangilik topilmadi." });
            }

            // Increment views
            db.run('UPDATE news SET views = views + 1 WHERE id = ?', [id]);
            news.views += 1;

            res.json({ success: true, data: news });
        } catch (err) {
            next(err);
        }
    },

    create: (req, res, next) => {
        try {
            const { title, category, img, summary, content, date } = req.body;
            if (!title || !content) {
                return res.status(400).json({
                    success: false,
                    message: "Yangilik sarlavhasi va matnini to'ldiring!"
                });
            }

            const categoryMap = {
                yutuq: { name: "🏆 Yutuqlar", badge: "badge-gold" },
                elon: { name: "📢 Muhim E'lon", badge: "badge-cyan" },
                tadbir: { name: "🎉 Tadbirlar", badge: "badge-purple" },
                sport: { name: "⚽ Sport", badge: "badge-green" }
            };

            const cat = category || 'elon';
            const catInfo = categoryMap[cat] || { name: "📢 E'lon", badge: "badge-cyan" };
            const publishDate = date || new Date().toLocaleDateString('uz-UZ');
            const defaultImg = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop";

            const info = db.run(`
                INSERT INTO news (title, category, category_name, badge_class, date, views, img, summary, content)
                VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
            `, [
                title.trim(),
                cat,
                catInfo.name,
                catInfo.badge,
                publishDate,
                img && img.trim() ? img.trim() : defaultImg,
                summary && summary.trim() ? summary.trim() : title.trim().substring(0, 120),
                content.trim()
            ]);

            const created = db.get('SELECT * FROM news WHERE id = ?', [info.lastInsertRowid]);

            res.status(201).json({
                success: true,
                message: "Yangi yangilik / e'lon muvaffaqiyatli chop etildi!",
                data: created
            });
        } catch (err) {
            next(err);
        }
    },

    update: (req, res, next) => {
        try {
            const { id } = req.params;
            const { title, category, img, summary, content, date } = req.body;

            const existing = db.get('SELECT * FROM news WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Yangilik topilmadi." });
            }

            const categoryMap = {
                yutuq: { name: "🏆 Yutuqlar", badge: "badge-gold" },
                elon: { name: "📢 Muhim E'lon", badge: "badge-cyan" },
                tadbir: { name: "🎉 Tadbirlar", badge: "badge-purple" },
                sport: { name: "⚽ Sport", badge: "badge-green" }
            };

            const cat = category || existing.category;
            const catInfo = categoryMap[cat] || { name: existing.category_name, badge: existing.badge_class };

            db.run(`
                UPDATE news SET
                    title = ?,
                    category = ?,
                    category_name = ?,
                    badge_class = ?,
                    date = ?,
                    img = ?,
                    summary = ?,
                    content = ?
                WHERE id = ?
            `, [
                title ? title.trim() : existing.title,
                cat,
                catInfo.name,
                catInfo.badge,
                date || existing.date,
                img ? img.trim() : existing.img,
                summary ? summary.trim() : existing.summary,
                content ? content.trim() : existing.content,
                id
            ]);

            const updated = db.get('SELECT * FROM news WHERE id = ?', [id]);
            res.json({
                success: true,
                message: "Yangilik muvaffaqiyatli tahrirlandi!",
                data: updated
            });
        } catch (err) {
            next(err);
        }
    },

    delete: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM news WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Yangilik topilmadi." });
            }

            db.run('DELETE FROM news WHERE id = ?', [id]);
            res.json({ success: true, message: "Yangilik muvaffaqiyatli o'chirildi." });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = newsController;
