const db = require('../config/database');

const studentsController = {
    getReport: (req, res, next) => {
        try {
            const query = (req.params.idOrName || req.query.query || '2026-01').trim();
            
            // Search by exact ID code first
            let student = db.get('SELECT * FROM students WHERE student_id_code = ?', [query]);
            if (!student) {
                // Search by name match
                student = db.get('SELECT * FROM students WHERE full_name LIKE ?', [`%${query}%`]);
            }
            if (!student) {
                // Fallback to default student
                student = db.get('SELECT * FROM students WHERE student_id_code = ?', ['2026-01']);
            }

            if (!student) {
                return res.status(404).json({ success: false, message: "O'quvchi tabeli topilmadi." });
            }

            const grades = db.all('SELECT num, subject_name as name, q1, q2, q3, q4, yearly as yr FROM student_grades WHERE student_id_code = ? ORDER BY num ASC', [student.student_id_code]);

            res.json({
                success: true,
                data: {
                    id: `№ ${student.student_id_code}`,
                    idCode: student.student_id_code,
                    name: student.full_name,
                    classVal: student.class_val,
                    att: student.attendance,
                    gpa: student.gpa,
                    level: student.level_badge,
                    classTeacher: student.class_teacher || 'S.Ergasheva',
                    director: student.director_name || 'D.Yusupova',
                    grades
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getAll: (req, res, next) => {
        try {
            const { search, classVal, limit, offset } = req.query;
            let sql = 'SELECT * FROM students WHERE 1=1';
            const params = [];

            if (classVal && classVal !== 'all') {
                sql += ' AND class_val LIKE ?';
                params.push(`%${classVal}%`);
            }

            if (search) {
                sql += ' AND (full_name LIKE ? OR student_id_code LIKE ? OR class_val LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q);
            }

            sql += ' ORDER BY student_id_code ASC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const students = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM students').count;

            res.json({ success: true, total, count: students.length, data: students });
        } catch (err) {
            next(err);
        }
    },

    getById: (req, res, next) => {
        try {
            const { id } = req.params;
            const student = db.get('SELECT * FROM students WHERE student_id_code = ? OR id = ?', [id, id]);
            if (!student) {
                return res.status(404).json({ success: false, message: "O'quvchi topilmadi." });
            }

            const grades = db.all('SELECT num, subject_name as name, q1, q2, q3, q4, yearly as yr FROM student_grades WHERE student_id_code = ? ORDER BY num ASC', [student.student_id_code]);

            res.json({ success: true, data: { ...student, grades } });
        } catch (err) {
            next(err);
        }
    },

    createStudent: (req, res, next) => {
        try {
            const { studentIdCode, fullName, classVal, attendance, gpa, levelBadge, classTeacher, directorName, grades } = req.body;
            if (!studentIdCode || !fullName) {
                return res.status(400).json({ success: false, message: "ID raqami va o'quvchi F.I.SH to'ldirilishi shart!" });
            }

            const existing = db.get('SELECT id FROM students WHERE student_id_code = ?', [studentIdCode.trim()]);
            if (existing) {
                return res.status(400).json({ success: false, message: "Ushbu ID raqamli o'quvchi mavjud!" });
            }

            // Calculate GPA from grades if provided
            let calculatedGpa = gpa || "4.50";
            if (Array.isArray(grades) && grades.length > 0) {
                const totalYearly = grades.reduce((acc, g) => acc + (parseInt(g.yr || g.q4 || 5, 10)), 0);
                calculatedGpa = (totalYearly / grades.length).toFixed(2);
            }

            db.run(`
                INSERT INTO students (student_id_code, full_name, class_val, attendance, gpa, level_badge, class_teacher, director_name)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                studentIdCode.trim(),
                fullName.trim(),
                classVal || "7-A Sinf",
                attendance || "98.0% (A'lo)",
                calculatedGpa,
                levelBadge || "A'lochi",
                classTeacher || "S.Ergasheva",
                directorName || "D.Yusupova"
            ]);

            if (Array.isArray(grades)) {
                const insertG = db.prepare(`
                    INSERT INTO student_grades (student_id_code, num, subject_name, q1, q2, q3, q4, yearly)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);
                grades.forEach((g, idx) => {
                    insertG.run(studentIdCode.trim(), idx + 1, g.name, g.q1 || 5, g.q2 || 5, g.q3 || 5, g.q4 || 5, g.yr || 5);
                });
            }

            res.status(201).json({ success: true, message: "O'quvchi tabeli muvaffaqiyatli saqlandi!" });
        } catch (err) {
            next(err);
        }
    },

    updateStudent: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM students WHERE student_id_code = ? OR id = ?', [id, id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "O'quvchi topilmadi." });
            }

            const { fullName, classVal, attendance, gpa, levelBadge, classTeacher, directorName, grades } = req.body;

            let updatedGpa = gpa || existing.gpa;
            if (Array.isArray(grades) && grades.length > 0) {
                const totalYearly = grades.reduce((acc, g) => acc + (parseInt(g.yr || g.q4 || 5, 10)), 0);
                updatedGpa = (totalYearly / grades.length).toFixed(2);
            }

            db.run(`
                UPDATE students SET
                    full_name = ?,
                    class_val = ?,
                    attendance = ?,
                    gpa = ?,
                    level_badge = ?,
                    class_teacher = ?,
                    director_name = ?
                WHERE student_id_code = ?
            `, [
                fullName ? fullName.trim() : existing.full_name,
                classVal || existing.class_val,
                attendance || existing.attendance,
                updatedGpa,
                levelBadge || existing.level_badge,
                classTeacher || existing.class_teacher,
                directorName || existing.director_name,
                existing.student_id_code
            ]);

            if (Array.isArray(grades)) {
                db.run('DELETE FROM student_grades WHERE student_id_code = ?', [existing.student_id_code]);
                const insertG = db.prepare(`
                    INSERT INTO student_grades (student_id_code, num, subject_name, q1, q2, q3, q4, yearly)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);
                grades.forEach((g, idx) => {
                    insertG.run(existing.student_id_code, idx + 1, g.name, g.q1 || 5, g.q2 || 5, g.q3 || 5, g.q4 || 5, g.yr || 5);
                });
            }

            res.json({ success: true, message: "O'quvchi tabeli muvaffaqiyatli yangilandi!" });
        } catch (err) {
            next(err);
        }
    },

    deleteStudent: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM students WHERE student_id_code = ? OR id = ?', [id, id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "O'quvchi topilmadi." });
            }

            db.run('DELETE FROM student_grades WHERE student_id_code = ?', [existing.student_id_code]);
            db.run('DELETE FROM students WHERE student_id_code = ?', [existing.student_id_code]);

            res.json({ success: true, message: "O'quvchi va uning tabeli o'chirildi." });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = studentsController;
