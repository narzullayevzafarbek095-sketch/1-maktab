const db = require('../config/database');

const statsController = {
    getDashboard: (req, res, next) => {
        try {
            const totalApps = db.get('SELECT COUNT(*) as count FROM applications').count;
            const pendingApps = db.get("SELECT COUNT(*) as count FROM applications WHERE status NOT LIKE '%Tasdiqlandi%'").count;
            const approvedApps = db.get("SELECT COUNT(*) as count FROM applications WHERE status LIKE '%Tasdiqlandi%'").count;

            const totalClubs = db.get('SELECT COUNT(*) as count FROM club_registrations').count;
            const totalMsgs = db.get('SELECT COUNT(*) as count FROM messages').count;
            const unreadMsgs = db.get('SELECT COUNT(*) as count FROM messages WHERE is_read = 0').count;

            const totalNews = db.get('SELECT COUNT(*) as count FROM news').count;
            const totalTests = db.get('SELECT COUNT(*) as count FROM test_results').count;
            const totalStudents = 1420 + db.get('SELECT COUNT(*) as count FROM students').count;
            const totalBooks = db.get('SELECT COUNT(*) as count FROM books').count;
            const totalHonors = db.get('SELECT COUNT(*) as count FROM honors').count;
            const totalTeachers = db.get('SELECT COUNT(*) as count FROM teachers').count;

            const recentApps = db.all('SELECT * FROM applications ORDER BY created_at DESC LIMIT 5');
            const recentMsgs = db.all('SELECT * FROM messages ORDER BY created_at DESC LIMIT 5');
            const recentTests = db.all('SELECT * FROM test_results ORDER BY created_at DESC LIMIT 5');

            res.json({
                success: true,
                stats: {
                    totalStudents: totalStudents.toLocaleString(),
                    totalApplications: totalApps,
                    pendingApplications: pendingApps,
                    approvedApplications: approvedApps,
                    totalClubRegistrations: totalClubs,
                    totalMessages: totalMsgs,
                    unreadMessages: unreadMsgs,
                    totalNewsPublished: totalNews,
                    totalTestsCompleted: totalTests,
                    totalBooksInLibrary: totalBooks,
                    totalHonors: totalHonors,
                    totalTeachers: totalTeachers
                },
                recentApplications: recentApps,
                recentMessages: recentMsgs,
                recentTests: recentTests
            });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = statsController;
