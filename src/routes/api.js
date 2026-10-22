const express = require('express');
const router = express.Router();

const { requireAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Import controllers
const authController = require('../controllers/authController');
const applicationsController = require('../controllers/applicationsController');
const messagesController = require('../controllers/messagesController');
const testsController = require('../controllers/testsController');
const certificatesController = require('../controllers/certificatesController');
const studentsController = require('../controllers/studentsController');
const timetableController = require('../controllers/timetableController');
const teachersController = require('../controllers/teachersController');
const galleryController = require('../controllers/galleryController');
const honorsController = require('../controllers/honorsController');
const settingsController = require('../controllers/settingsController');
const statsController = require('../controllers/statsController');
const aiController = require('../controllers/aiController');
const uploadController = require('../controllers/uploadController');

// 1. API Health & Documentation Root
router.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        platform: 'DILBAR EDICATION Innovatsion Akademiya',
        timestamp: new Date().toISOString(),
        service: 'DILBAR EDICATION REST API Server',
        database: 'SQLite (Active WAL Mode)',
        version: '2.1.0'
    });
});

router.get('/', (req, res) => {
    res.json({
        message: "DILBAR EDICATION Innovatsion Ta'lim Portali REST API tizimiga xush kelibsiz!",
        version: "2.1.0",
        institution: "DILBAR EDICATION — Zamonaviy Innovatsion Akademiya",
        endpoints: {
            auth: {
                login: "POST /api/auth/login",
                me: "GET /api/auth/me",
                changePassword: "POST /api/auth/change-password",
                admins: "GET /api/auth/admins (Auth), POST /api/auth/admins (Auth)"
            },
            applications: {
                list: "GET /api/applications (Auth, filter by search/status/classVal)",
                stats: "GET /api/applications/stats (Auth)",
                getById: "GET /api/applications/:id (Auth)",
                create: "POST /api/applications",
                updateStatus: "PATCH /api/applications/:id/status (Auth)",
                update: "PUT /api/applications/:id (Auth)",
                delete: "DELETE /api/applications/:id (Auth)",
                exportCsv: "GET /api/applications/export/csv (Auth)"
            },
            messages: {
                list: "GET /api/messages (Auth, filter by is_read/search)",
                getById: "GET /api/messages/:id (Auth)",
                create: "POST /api/messages",
                markRead: "PATCH /api/messages/:id/read (Auth)",
                markAllRead: "POST /api/messages/mark-all-read (Auth)",
                reply: "POST /api/messages/:id/reply (Auth)",
                delete: "DELETE /api/messages/:id (Auth)"
            },
            tests: {
                subjects: "GET /api/tests/subjects",
                questions: "GET /api/tests/:subjectKey",
                submit: "POST /api/tests/submit",
                results: "GET /api/tests/results (Auth)",
                leaderboard: "GET /api/tests/leaderboard",
                addQuestion: "POST /api/tests/questions (Auth)",
                deleteQuestion: "DELETE /api/tests/questions/:id (Auth)"
            },
            certificates: {
                verify: "GET /api/certificates/verify/:code",
                spravka: "POST /api/certificates/spravka",
                list: "GET /api/certificates (Auth)",
                toggleValidity: "PATCH /api/certificates/:id/toggle (Auth)"
            },
            students: {
                report: "GET /api/students/report/:idOrName",
                list: "GET /api/students (Auth)",
                getById: "GET /api/students/:id (Auth)",
                create: "POST /api/students (Auth)",
                update: "PUT /api/students/:id (Auth)",
                delete: "DELETE /api/students/:id (Auth)"
            },
            timetable: {
                classes: "GET /api/timetable/classes",
                schedule: "GET /api/timetable/:className",
                bells: "GET /api/timetable/bells/schedule",
                createLesson: "POST /api/timetable (Auth)",
                deleteLesson: "DELETE /api/timetable/:id (Auth)"
            },
            teachers: {
                list: "GET /api/teachers",
                getById: "GET /api/teachers/:id",
                create: "POST /api/teachers (Auth)",
                update: "PUT /api/teachers/:id (Auth)",
                delete: "DELETE /api/teachers/:id (Auth)"
            },
            gallery: {
                list: "GET /api/gallery",
                getById: "GET /api/gallery/:id",
                create: "POST /api/gallery (Auth)",
                update: "PUT /api/gallery/:id (Auth)",
                delete: "DELETE /api/gallery/:id (Auth)"
            },
            honors: {
                list: "GET /api/honors (filter by category/search)",
                getById: "GET /api/honors/:id",
                create: "POST /api/honors (Auth)",
                update: "PUT /api/honors/:id (Auth)",
                delete: "DELETE /api/honors/:id (Auth)"
            },
            settings: {
                get: "GET /api/settings",
                update: "PUT /api/settings (Auth)"
            },
            stats: {
                dashboard: "GET /api/stats/dashboard (Auth)"
            },
            ai: {
                ask: "POST /api/ai/ask"
            },
            upload: {
                single: "POST /api/upload (Auth, multipart/form-data)"
            }
        }
    });
});

// 2. Auth Routes
router.post('/auth/login', authController.login);
router.get('/auth/me', requireAuth, authController.getMe);
router.put('/auth/profile', requireAuth, authController.updateProfile);
router.post('/auth/profile', requireAuth, authController.updateProfile);
router.post('/auth/change-password', requireAuth, authController.changePassword);
router.get('/auth/admins', requireAuth, authController.getAdmins);
router.post('/auth/admins', requireAuth, authController.createAdmin);
router.delete('/auth/admins/:id', requireAuth, authController.deleteAdmin);

// 3. Applications (Qabul arizalari) Routes
router.get('/applications/export/csv', requireAuth, applicationsController.exportCsv);
router.get('/applications/stats', requireAuth, applicationsController.getStats);
router.get('/applications', requireAuth, applicationsController.getAll);
router.get('/applications/:id', requireAuth, applicationsController.getById);
router.post('/applications', applicationsController.create);
router.patch('/applications/:id/status', requireAuth, applicationsController.updateStatus);
router.put('/applications/:id', requireAuth, applicationsController.update);
router.delete('/applications/:id', requireAuth, applicationsController.delete);

// 4. Messages (Murojaatlar) Routes
router.get('/messages', requireAuth, messagesController.getAll);
router.get('/messages/:id', requireAuth, messagesController.getById);
router.post('/messages', messagesController.create);
router.patch('/messages/:id/read', requireAuth, messagesController.markRead);
router.post('/messages/mark-all-read', requireAuth, messagesController.markAllRead);
router.post('/messages/:id/reply', requireAuth, messagesController.reply);
router.delete('/messages/:id', requireAuth, messagesController.delete);

// 5. Online Tests & Exam Engine Routes
router.get('/tests/subjects', testsController.getSubjects);
router.get('/tests/leaderboard', testsController.getLeaderboard);
router.get('/tests/results', requireAuth, testsController.getResults);
router.get('/tests/admin/all-questions', requireAuth, testsController.getAllQuestionsAdmin);
router.post('/tests/questions', requireAuth, testsController.addQuestion);
router.delete('/tests/questions/:id', requireAuth, testsController.deleteQuestion);
router.get('/tests/:subjectKey', testsController.getSubjectQuestions);
router.post('/tests/submit', testsController.submitExam);

// 6. Certificates & Spravka Verification Routes
router.get('/certificates/verify/:code', certificatesController.verifyCertificate);
router.post('/certificates/spravka', certificatesController.generateSpravka);
router.get('/certificates', requireAuth, certificatesController.getAll);
router.patch('/certificates/:id/toggle', requireAuth, certificatesController.toggleValidity);

// 7. Students & Report Cards (Tabel) Routes
router.get('/students/report/:idOrName', studentsController.getReport);
router.get('/students/report', studentsController.getReport);
router.get('/students', requireAuth, studentsController.getAll);
router.get('/students/:id', requireAuth, studentsController.getById);
router.post('/students', requireAuth, studentsController.createStudent);
router.put('/students/:id', requireAuth, studentsController.updateStudent);
router.delete('/students/:id', requireAuth, studentsController.deleteStudent);

// 8. Timetable (Dars jadvali) Routes
router.get('/timetable/classes', timetableController.getClasses);
router.get('/timetable/bells/schedule', timetableController.getBellSchedule);
router.get('/timetable/:className', timetableController.getTimetable);
router.get('/timetable', timetableController.getTimetable);
router.post('/timetable', requireAuth, timetableController.createLesson);
router.delete('/timetable/:id', requireAuth, timetableController.deleteLesson);

// 9. Teachers (O'qituvchilar) Routes
router.get('/teachers', teachersController.getAll);
router.get('/teachers/:id', teachersController.getById);
router.post('/teachers', requireAuth, teachersController.create);
router.put('/teachers/:id', requireAuth, teachersController.update);
router.delete('/teachers/:id', requireAuth, teachersController.delete);

// 10. Gallery (Fotogalereya) Routes
router.get('/gallery', galleryController.getAll);
router.get('/gallery/:id', galleryController.getById);
router.post('/gallery', requireAuth, galleryController.create);
router.put('/gallery/:id', requireAuth, galleryController.update);
router.delete('/gallery/:id', requireAuth, galleryController.delete);

// 11. Honors (Faxriy O'quvchilar & Olimpiada G'oliblari) Routes
router.get('/honors', honorsController.getAll);
router.get('/honors/:id', honorsController.getById);
router.post('/honors', requireAuth, honorsController.create);
router.put('/honors/:id', requireAuth, honorsController.update);
router.delete('/honors/:id', requireAuth, honorsController.delete);

// 12. Site Settings Routes
router.get('/settings', settingsController.getAllSettings);
router.put('/settings', requireAuth, settingsController.updateSettings);
router.post('/settings/telegram/test', settingsController.testTelegram);

// 13. Admin Dashboard Statistics Routes
router.get('/stats/dashboard', requireAuth, statsController.getDashboard);

// 14. AI Assistant NLP Solver Routes
router.post('/ai/ask', aiController.ask);

// 15. File Upload Routes
router.post('/upload', requireAuth, upload.single('file'), uploadController.uploadSingle);

// 16. Private School Amenities & Conveniences Routes
const amenitiesController = require('../controllers/amenitiesController');
router.get('/amenities/menu', amenitiesController.getMenu);
router.get('/amenities/transport', amenitiesController.getTransport);
router.get('/amenities/clubs', amenitiesController.getClubs);
router.post('/amenities/calculate', amenitiesController.calculateTuition);

module.exports = router;
