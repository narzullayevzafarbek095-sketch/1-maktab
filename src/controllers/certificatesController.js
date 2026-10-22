const db = require('../config/database');

const certificatesController = {
    verifyCertificate: (req, res, next) => {
        try {
            const { code } = req.params;
            if (!code) {
                return res.status(400).json({ success: false, message: "Hujjat ID kodini kiriting!" });
            }

            const cleanCode = code.trim().toUpperCase();
            let cert = db.get('SELECT * FROM certificates WHERE UPPER(cert_code) = ?', [cleanCode]);

            if (!cert) {
                // Also check test_results by cert_code
                const testRes = db.get('SELECT * FROM test_results WHERE UPPER(cert_code) = ?', [cleanCode]);
                if (testRes) {
                    cert = {
                        cert_code: testRes.cert_code,
                        cert_type: 'certificate',
                        student_name: testRes.student_name,
                        class_val: testRes.class_val,
                        purpose_or_subject: `${testRes.subject_title} (${testRes.score}/${testRes.total_questions})`,
                        issue_date: new Date(testRes.created_at).toLocaleDateString('uz-UZ'),
                        is_valid: 1
                    };
                }
            }

            if (!cert || cert.is_valid !== 1) {
                return res.status(404).json({
                    success: false,
                    valid: false,
                    message: `"${code}" raqamli hujjat maktab rasmiy bazasida topilmadi yoki bekor qilingan.`
                });
            }

            const typeName = cert.cert_type === 'spravka' 
                ? "Elektron Ma'lumotnoma (Spravka)" 
                : "Onlayn Bilimdon Sertifikati";

            res.json({
                success: true,
                valid: true,
                message: "Hujjat haqiqiy va davlat bazasida mavjud!",
                data: {
                    code: cert.cert_code,
                    type: typeName,
                    rawType: cert.cert_type,
                    studentName: cert.student_name,
                    classVal: cert.class_val,
                    subjectOrPurpose: cert.purpose_or_subject,
                    issueDate: cert.issue_date,
                    institution: "DILBAR EDICATION Innovatsion Akademiyasi",
                    signedBy: "Maktab Direktori D.Yusupova (QR Imzo)",
                    isValid: cert.is_valid === 1
                }
            });
        } catch (err) {
            next(err);
        }
    },

    generateSpravka: (req, res, next) => {
        try {
            const { studentName, classVal, purpose } = req.body;
            if (!studentName) {
                return res.status(400).json({ success: false, message: "O'quvchi F.I.SH kiritilishi shart!" });
            }

            const spCode = `SP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
            const today = new Date().toLocaleDateString('uz-UZ');
            const targetClass = classVal || "7-A";
            const targetPurpose = purpose && purpose.trim() ? purpose.trim() : "Talab qilingan joyga taqdim etish uchun";

            db.run(`
                INSERT INTO certificates (cert_code, cert_type, student_name, class_val, purpose_or_subject, details_json, issue_date, is_valid)
                VALUES (?, 'spravka', ?, ?, ?, ?, ?, 1)
            `, [
                spCode,
                studentName.trim(),
                targetClass,
                targetPurpose,
                JSON.stringify({ institution: "DILBAR EDICATION", signedBy: "D.Yusupova", status: "Tasdiqlangan" }),
                today
            ]);

            const record = db.get('SELECT * FROM certificates WHERE cert_code = ?', [spCode]);

            res.status(201).json({
                success: true,
                message: "Rasmiy elektron ma'lumotnoma (Spravka) muvaffaqiyatli shakllantirildi!",
                data: {
                    idNum: spCode.replace('SP-2026-', ''),
                    certCode: spCode,
                    studentName: studentName.trim(),
                    classVal: targetClass,
                    purpose: targetPurpose,
                    date: today,
                    institution: "Sirdaryo viloyati DILBAR EDICATION Innovatsion Akademiyasi",
                    director: "D.Yusupova"
                }
            });
        } catch (err) {
            next(err);
        }
    },

    getAll: (req, res, next) => {
        try {
            const { type, search, limit, offset } = req.query;
            let sql = 'SELECT * FROM certificates WHERE 1=1';
            const params = [];

            if (type && type !== 'all') {
                sql += ' AND cert_type = ?';
                params.push(type);
            }

            if (search) {
                sql += ' AND (student_name LIKE ? OR cert_code LIKE ? OR purpose_or_subject LIKE ?)';
                const q = `%${search}%`;
                params.push(q, q, q);
            }

            sql += ' ORDER BY created_at DESC';

            if (limit) {
                sql += ' LIMIT ? OFFSET ?';
                params.push(parseInt(limit, 10), parseInt(offset || 0, 10));
            }

            const certs = db.all(sql, params);
            const total = db.get('SELECT COUNT(*) as count FROM certificates').count;

            res.json({ success: true, total, count: certs.length, data: certs });
        } catch (err) {
            next(err);
        }
    },

    toggleValidity: (req, res, next) => {
        try {
            const { id } = req.params;
            const existing = db.get('SELECT * FROM certificates WHERE id = ? OR cert_code = ?', [id, id]);
            if (!existing) {
                return res.status(404).json({ success: false, message: "Hujjat topilmadi." });
            }

            const newValid = existing.is_valid === 1 ? 0 : 1;
            db.run('UPDATE certificates SET is_valid = ? WHERE id = ?', [newValid, existing.id]);

            res.json({
                success: true,
                message: `Hujjat holati ${newValid === 1 ? 'haqiqiy' : 'bekor qilingan'} deb yangilandi!`,
                isValid: newValid === 1
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = certificatesController;
