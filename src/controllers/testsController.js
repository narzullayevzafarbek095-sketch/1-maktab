const db = require('../config/database');

const testsController = {
    getSubjects: (req, res, next) => {
        try {
            const subjects = db.all('SELECT * FROM test_subjects ORDER BY id ASC');
            // Attach question counts
            const enriched = subjects.map(s => {
                const qCount = db.get('SELECT COUNT(*) as count FROM test_questions WHERE subject_key = ?', [s.key_name]).count;
                return {
                    ...s,
                    questionCount: qCount
                };
            });

            res.json({ success: true, total: enriched.length, data: enriched });
        } catch (err) {
            next(err);
        }
    },

    getSubjectQuestions: (req, res, next) => {
        try {
            const { subjectKey } = req.params;
            const subject = db.get('SELECT * FROM test_subjects WHERE key_name = ?', [subjectKey]);
            if (!subject) {
                return res.status(404).json({ success: false, message: "Fan topilmadi." });
            }

            const rawQuestions = db.all('SELECT id, question, options_json FROM test_questions WHERE subject_key = ? ORDER BY id ASC', [subjectKey]);
            const questions = rawQuestions.map((q, idx) => ({
                id: q.id,
                index: idx,
                q: q.question,
                opts: JSON.parse(q.options_json)
            }));

            res.json({
                success: true,
                subject,
                total: questions.length,
                questions
            });
        } catch (err) {
            next(err);
        }
    },

    submitExam: (req, res, next) => {
        try {
            const studentName = req.body.studentName || req.body.student_name;
            const classVal = req.body.classVal || req.body.class_val || "7-A";
            const subjectKey = req.body.subjectKey || req.body.subject_key;
            const userAnswers = req.body.userAnswers || req.body.user_answers || req.body.answers || {};

            if (!studentName || !subjectKey) {
                return res.status(400).json({
                    success: false,
                    message: "O'quvchi ismi va fani kiritilishi shart!"
                });
            }

            const subject = db.get('SELECT * FROM test_subjects WHERE key_name = ?', [subjectKey]);
            if (!subject) {
                return res.status(404).json({ success: false, message: "Fan topilmadi." });
            }

            const questions = db.all('SELECT * FROM test_questions WHERE subject_key = ? ORDER BY id ASC', [subjectKey]);
            let correctCount = 0;
            const review = [];

            questions.forEach((q, idx) => {
                const userChoice = userAnswers[idx];
                const isCorrect = userChoice !== undefined && parseInt(userChoice, 10) === q.correct_idx;
                if (isCorrect) correctCount++;

                const opts = JSON.parse(q.options_json);
                review.push({
                    index: idx + 1,
                    question: q.question,
                    userChoice: userChoice !== undefined ? parseInt(userChoice, 10) : null,
                    userChoiceText: userChoice !== undefined ? opts[userChoice] : "Javob berilmagan",
                    correctIdx: q.correct_idx,
                    correctText: opts[q.correct_idx],
                    isCorrect,
                    explanation: q.explanation
                });
            });

            const total = questions.length;
            const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;
            const certCode = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            const today = new Date().toLocaleDateString('uz-UZ');

            let gradeLevel = "A'lochi (5 baho)";
            if (percentage < 60) gradeLevel = "Qoniqarli (3 baho)";
            else if (percentage < 85) gradeLevel = "Yaxshi (4 baho)";

            // Save test result
            db.run(`
                INSERT INTO test_results (cert_code, student_name, class_val, subject_key, subject_title, score, total_questions, percentage, grade_level)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                certCode,
                studentName.trim(),
                classVal || "7-A",
                subjectKey,
                subject.title,
                correctCount,
                total,
                percentage,
                gradeLevel
            ]);

            // Save certificate in certificates table for official verification
            db.run(`
                INSERT INTO certificates (cert_code, cert_type, student_name, class_val, purpose_or_subject, details_json, issue_date, is_valid)
                VALUES (?, 'certificate', ?, ?, ?, ?, ?, 1)
            `, [
                certCode,
                studentName.trim(),
                classVal || "7-A",
                `${subject.title} (${correctCount}/${total})`,
                JSON.stringify({ score: correctCount, total, percentage, gradeLevel }),
                today
            ]);

            const resultData = {
                certCode,
                cert_code: certCode,
                studentName,
                student_name: studentName,
                classVal: classVal || "7-A",
                class_val: classVal || "7-A",
                subjectTitle: subject.title,
                subject_title: subject.title,
                score: correctCount,
                totalQuestions: total,
                total_questions: total,
                percentage,
                gradeLevel,
                grade_level: gradeLevel,
                date: today
            };

            res.json({
                success: true,
                message: `Test yakunlandi! Natijangiz: ${correctCount}/${total} (${percentage}%)`,
                result: resultData,
                data: resultData,
                review
            });
        } catch (err) {
            next(err);
        }
    },

    getResults: (req, res, next) => {
        try {
            const { limit, offset, subjectKey, search } = req.query;
            let sql = 'SELECT * FROM test_results WHERE 1=1';
            const params = [];

            if (subjectKey && subjectKey !== 'all') {
                sql += ' AND subject_key = ?';
                params.push(subjectKey);
            }

            if (search) {
                sql += ' AND (student_name LIKE ? OR cert_code LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q);
            }

            sql += ' ORDER BY created_at DESC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const results = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM test_results').count;

            res.json({ success: true, total, count: results.length, data: results });
        } catch (err) {
            next(err);
        }
    },

    getLeaderboard: (req, res, next) => {
        try {
            const topResults = db.all(`
                SELECT student_name, class_val, subject_title, score, total_questions, percentage, grade_level, cert_code, created_at
                FROM test_results
                ORDER BY percentage DESC, score DESC, created_at DESC
                LIMIT 10
            `);

            res.json({ success: true, leaderboard: topResults });
        } catch (err) {
            next(err);
        }
    },

    addQuestion: (req, res, next) => {
        try {
            const { subject_key, question, options, correct_idx, explanation } = req.body;
            if (!subject_key || !question || !Array.isArray(options) || correct_idx === undefined) {
                return res.status(400).json({ success: false, message: "Fan kaliti, savol matni, variantlar va to'g'ri javob indeksi talab qilinadi!" });
            }

            const info = db.run(`
                INSERT INTO test_questions (subject_key, question, options_json, correct_idx, explanation)
                VALUES (?, ?, ?, ?, ?)
            `, [
                subject_key.trim(),
                question.trim(),
                JSON.stringify(options),
                parseInt(correct_idx, 10),
                explanation ? explanation.trim() : "To'g'ri javob davlat darsligi asosida tasdiqlangan."
            ]);

            const created = db.get('SELECT * FROM test_questions WHERE id = ?', [info.lastInsertRowid]);
            res.status(201).json({ success: true, message: "Savol muvaffaqiyatli qo'shildi!", data: created });
        } catch (err) {
            next(err);
        }
    },

    deleteQuestion: (req, res, next) => {
        try {
            const { id } = req.params;
            db.run('DELETE FROM test_questions WHERE id = ?', [id]);
            res.json({ success: true, message: "Savol o'chirildi." });
        } catch (err) {
            next(err);
        }
    },

    getAllQuestionsAdmin: (req, res, next) => {
        try {
            const { subject_key } = req.query;
            let sql = `
                SELECT tq.*, ts.title as subject_title 
                FROM test_questions tq 
                LEFT JOIN test_subjects ts ON tq.subject_key = ts.key_name
                WHERE 1=1
            `;
            const params = [];
            if (subject_key && subject_key !== 'all') {
                sql += ' AND tq.subject_key = ?';
                params.push(subject_key);
            }
            sql += ' ORDER BY tq.id DESC';
            const questions = db.all(sql, params);
            res.json({ success: true, total: questions.length, data: questions });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = testsController;
