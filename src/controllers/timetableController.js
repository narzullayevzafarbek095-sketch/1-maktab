const db = require('../config/database');

const timetableController = {
    getTimetable: (req, res, next) => {
        try {
            const className = (req.params.className || req.query.className || '7-A').trim();
            const dayNum = req.query.day ? parseInt(req.query.day, 10) : null;

            let sql = 'SELECT * FROM timetable WHERE class_name = ?';
            const params = [className];

            if (dayNum) {
                sql += ' AND day_num = ?';
                params.push(dayNum);
            }

            sql += ' ORDER BY day_num ASC, lesson_num ASC';

            const lessons = db.all(sql, params);
            
            // Format for frontend
            const formatted = lessons.map(l => ({
                id: l.id,
                className: l.class_name,
                dayNum: l.day_num,
                num: l.lesson_num,
                time: l.time_range,
                name: l.subject_name,
                teacher: l.teacher_name,
                room: l.room_name,
                icon: l.icon || 'fa-book-open'
            }));

            res.json({
                success: true,
                className,
                dayNum: dayNum || 'all',
                total: formatted.length,
                data: formatted
            });
        } catch (err) {
            next(err);
        }
    },

    getClasses: (req, res, next) => {
        try {
            const classes = db.all('SELECT DISTINCT class_name FROM timetable ORDER BY class_name ASC');
            res.json({ success: true, data: classes.map(c => c.class_name) });
        } catch (err) {
            next(err);
        }
    },

    getBellSchedule: (req, res, next) => {
        try {
            const bells = [
                { lesson: 1, start: "08:00", end: "08:45", breakAfter: "5 daqiqa" },
                { lesson: 2, start: "08:50", end: "09:35", breakAfter: "15 daqiqa (Katta tanaffus)" },
                { lesson: 3, start: "09:50", end: "10:35", breakAfter: "5 daqiqa" },
                { lesson: 4, start: "10:40", end: "11:25", breakAfter: "10 daqiqa" },
                { lesson: 5, start: "11:35", end: "12:20", breakAfter: "5 daqiqa" },
                { lesson: 6, start: "12:25", end: "13:10", breakAfter: "Darslar yakuni" }
            ];

            res.json({ success: true, bellSchedule: bells });
        } catch (err) {
            next(err);
        }
    },

    createLesson: (req, res, next) => {
        try {
            const { class_name, day_num, lesson_num, time_range, subject_name, teacher_name, room_name, icon } = req.body;
            if (!class_name || !day_num || !lesson_num || !subject_name) {
                return res.status(400).json({ success: false, message: "Sinf, kun raqami, dars tartibi va fan nomi talab qilinadi!" });
            }

            const info = db.run(`
                INSERT INTO timetable (class_name, day_num, lesson_num, time_range, subject_name, teacher_name, room_name, icon)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                class_name.trim(),
                parseInt(day_num, 10),
                parseInt(lesson_num, 10),
                time_range || "08:00 - 08:45",
                subject_name.trim(),
                teacher_name ? teacher_name.trim() : "Fan ustozi",
                room_name ? room_name.trim() : "Sinfxona",
                icon || 'fa-book-open'
            ]);

            const created = db.get('SELECT * FROM timetable WHERE id = ?', [info.lastInsertRowid]);
            res.status(201).json({ success: true, message: "Dars jadvali yangilandi!", data: created });
        } catch (err) {
            next(err);
        }
    },

    deleteLesson: (req, res, next) => {
        try {
            const { id } = req.params;
            db.run('DELETE FROM timetable WHERE id = ?', [id]);
            res.json({ success: true, message: "Dars jadvaldan o'chirildi." });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = timetableController;
