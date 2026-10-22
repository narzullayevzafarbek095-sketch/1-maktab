const db = require('../config/database');

const clubsController = {
    getAllClubs: (req, res, next) => {
        try {
            const { category, search } = req.query;
            let sql = 'SELECT * FROM clubs WHERE 1=1';
            const params = [];

            if (category && category !== 'all') {
                sql += ' AND category = ?';
                params.push(category);
            }

            if (search) {
                sql += ' AND (name LIKE ? OR description LIKE ? OR teacher LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q);
            }

            sql += ' ORDER BY id ASC';

            const clubs = db.all(sql, params);
            res.json({ success: true, total: clubs.length, data: clubs });
        } catch (err) {
            next(err);
        }
    },

    getClubById: (req, res, next) => {
        try {
            const { id } = req.params;
            const club = db.get('SELECT * FROM clubs WHERE id = ?', [id]);
            if (!club) {
                return res.status(404).json({ success: false, message: "To'garak topilmadi." });
            }
            res.json({ success: true, data: club });
        } catch (err) {
            next(err);
        }
    },

    createClub: (req, res, next) => {
        try {
            const { name, category, schedule, room, teacher, description, icon, badge } = req.body;
            if (!name || !schedule || !teacher) {
                return res.status(400).json({ success: false, message: "To'garak nomi, dars vaqti va ustoz F.I.SH to'ldirilishi shart!" });
            }

            const info = db.run(`
                INSERT INTO clubs (name, category, schedule, room, teacher, description, icon, badge)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                name.trim(),
                category || 'it',
                schedule.trim(),
                room ? room.trim() : "Maktab binosi",
                teacher.trim(),
                description ? description.trim() : "Davlat ta'lim dasturi doirasidagi bepul to'garak.",
                icon || 'fa-shapes',
                badge || 'Bepul'
            ]);

            const created = db.get('SELECT * FROM clubs WHERE id = ?', [info.lastInsertRowid]);
            res.status(201).json({
                success: true,
                message: "Yangi to'garak muvaffaqiyatli ochildi!",
                data: created
            });
        } catch (err) {
            next(err);
        }
    },

    updateClub: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM clubs WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "To'garak topilmadi." });
            }

            const { name, category, schedule, room, teacher, description, icon, badge } = req.body;

            db.run(`
                UPDATE clubs SET
                    name = ?,
                    category = ?,
                    schedule = ?,
                    room = ?,
                    teacher = ?,
                    description = ?,
                    icon = ?,
                    badge = ?
                WHERE id = ?
            `, [
                name ? name.trim() : existing.name,
                category || existing.category,
                schedule ? schedule.trim() : existing.schedule,
                room ? room.trim() : existing.room,
                teacher ? teacher.trim() : existing.teacher,
                description !== undefined ? description.trim() : existing.description,
                icon || existing.icon,
                badge || existing.badge,
                id
            ]);

            const updated = db.get('SELECT * FROM clubs WHERE id = ?', [id]);
            res.json({
                success: true,
                message: "To'garak ma'lumotlari muvaffaqiyatli yangilandi!",
                data: updated
            });
        } catch (err) {
            next(err);
        }
    },

    deleteClub: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM clubs WHERE id = ?', [id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "To'garak topilmadi." });
            }

            db.run('DELETE FROM clubs WHERE id = ?', [id]);
            res.json({ success: true, message: "To'garak muvaffaqiyatli o'chirildi." });
        } catch (err) {
            next(err);
        }
    },

    getRegistrations: (req, res, next) => {
        try {
            const { search, limit, offset } = req.query;
            let sql = 'SELECT * FROM club_registrations WHERE 1=1';
            const params = [];

            if (search) {
                sql += ' AND (student_name LIKE ? OR club_name LIKE ? OR ticket_id LIKE ? OR phone LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q, q);
            }

            sql += ' ORDER BY created_at DESC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const registrations = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM club_registrations').count;

            res.json({
                success: true,
                total,
                count: registrations.length,
                data: registrations
            });
        } catch (err) {
            next(err);
        }
    },

    register: (req, res, next) => {
        try {
            const { studentName, classVal, phone, clubName } = req.body;
            if (!studentName || !phone || !clubName) {
                return res.status(400).json({
                    success: false,
                    message: "O'quvchi F.I.SH, sinf va telefon raqamini to'ldiring!"
                });
            }

            const ticketId = `CLUB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

            db.run(`
                INSERT INTO club_registrations (ticket_id, club_name, student_name, class_val, phone, status)
                VALUES (?, ?, ?, ?, ?, 'Tasdiqlandi')
            `, [
                ticketId,
                clubName.trim(),
                studentName.trim(),
                classVal || "8-9 Sinf",
                phone.trim()
            ]);

            const record = db.get('SELECT * FROM club_registrations WHERE ticket_id = ?', [ticketId]);

            res.status(201).json({
                success: true,
                message: "To'garakka muvaffaqiyatli a'zo bo'ldingiz!",
                ticketId,
                data: record
            });
        } catch (err) {
            next(err);
        }
    },

    deleteRegistration: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM club_registrations WHERE id = ? OR ticket_id = ?', [id, id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "A'zolik ma'lumoti topilmadi." });
            }

            db.run('DELETE FROM club_registrations WHERE id = ? OR ticket_id = ?', [id, id]);
            res.json({ success: true, message: "A'zolik muvaffaqiyatli o'chirildi." });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = clubsController;
