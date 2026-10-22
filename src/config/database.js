const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const uploadsDir = path.resolve(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'school.db');
const rawDb = new DatabaseSync(dbPath);

// Enable WAL mode, normal synchronous and foreign keys for high performance and integrity
rawDb.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
`);

// Database helper wrapper
const db = {
    raw: rawDb,
    exec(sql) {
        return rawDb.exec(sql);
    },
    prepare(sql) {
        return rawDb.prepare(sql);
    },
    all(sql, params = []) {
        const stmt = rawDb.prepare(sql);
        return params.length > 0 ? stmt.all(...params) : stmt.all();
    },
    get(sql, params = []) {
        const stmt = rawDb.prepare(sql);
        return params.length > 0 ? stmt.get(...params) : stmt.get();
    },
    run(sql, params = []) {
        const stmt = rawDb.prepare(sql);
        return params.length > 0 ? stmt.run(...params) : stmt.run();
    }
};

// Initialize schema
function initSchema() {
    db.exec(`
        -- Admins table
        CREATE TABLE IF NOT EXISTS admins (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            full_name TEXT NOT NULL,
            role TEXT DEFAULT 'admin',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Qabul (Admission) applications
        CREATE TABLE IF NOT EXISTS applications (
            id TEXT PRIMARY KEY,
            student_name TEXT NOT NULL,
            birth_date TEXT,
            gender TEXT,
            class_val TEXT NOT NULL,
            address TEXT NOT NULL,
            parent_name TEXT NOT NULL,
            parent_phone TEXT NOT NULL,
            parent_email TEXT,
            status TEXT DEFAULT 'Yangi (Ko''rib chiqilmoqda)',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Contact messages & appeals
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            topic TEXT NOT NULL,
            message TEXT NOT NULL,
            is_read INTEGER DEFAULT 0,
            reply TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- School news and announcements
        CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT NOT NULL,
            category_name TEXT NOT NULL,
            badge_class TEXT DEFAULT 'badge-cyan',
            date TEXT NOT NULL,
            views INTEGER DEFAULT 0,
            img TEXT NOT NULL,
            summary TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- School clubs
        CREATE TABLE IF NOT EXISTS clubs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            schedule TEXT NOT NULL,
            room TEXT NOT NULL,
            teacher TEXT NOT NULL,
            description TEXT,
            icon TEXT DEFAULT 'fa-shapes',
            badge TEXT DEFAULT 'Bepul'
        );

        -- Club registrations
        CREATE TABLE IF NOT EXISTS club_registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ticket_id TEXT UNIQUE NOT NULL,
            club_name TEXT NOT NULL,
            student_name TEXT NOT NULL,
            class_val TEXT NOT NULL,
            phone TEXT NOT NULL,
            status TEXT DEFAULT 'Tasdiqlandi',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Online test subjects
        CREATE TABLE IF NOT EXISTS test_subjects (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            key_name TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            class_badge TEXT NOT NULL,
            subtitle TEXT NOT NULL,
            duration_minutes INTEGER DEFAULT 15
        );

        -- Online test questions
        CREATE TABLE IF NOT EXISTS test_questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_key TEXT NOT NULL,
            question TEXT NOT NULL,
            options_json TEXT NOT NULL,
            correct_idx INTEGER NOT NULL,
            explanation TEXT NOT NULL,
            FOREIGN KEY (subject_key) REFERENCES test_subjects(key_name) ON DELETE CASCADE
        );

        -- Online test result records
        CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cert_code TEXT UNIQUE NOT NULL,
            student_name TEXT NOT NULL,
            class_val TEXT NOT NULL,
            subject_key TEXT NOT NULL,
            subject_title TEXT NOT NULL,
            score INTEGER NOT NULL,
            total_questions INTEGER NOT NULL,
            percentage INTEGER NOT NULL,
            grade_level TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Official certificates & spravkas for verification
        CREATE TABLE IF NOT EXISTS certificates (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cert_code TEXT UNIQUE NOT NULL,
            cert_type TEXT NOT NULL,
            student_name TEXT NOT NULL,
            class_val TEXT NOT NULL,
            purpose_or_subject TEXT NOT NULL,
            details_json TEXT,
            issue_date TEXT NOT NULL,
            is_valid INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Students report card / tabel
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id_code TEXT UNIQUE NOT NULL,
            full_name TEXT NOT NULL,
            class_val TEXT NOT NULL,
            attendance TEXT NOT NULL,
            gpa TEXT NOT NULL,
            level_badge TEXT NOT NULL,
            class_teacher TEXT DEFAULT 'S.Ergasheva',
            director_name TEXT DEFAULT 'D.Yusupova'
        );

        -- Student quarter grades
        CREATE TABLE IF NOT EXISTS student_grades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id_code TEXT NOT NULL,
            num INTEGER NOT NULL,
            subject_name TEXT NOT NULL,
            q1 INTEGER NOT NULL,
            q2 INTEGER NOT NULL,
            q3 INTEGER NOT NULL,
            q4 INTEGER NOT NULL,
            yearly INTEGER NOT NULL,
            FOREIGN KEY (student_id_code) REFERENCES students(student_id_code) ON DELETE CASCADE
        );

        -- Timetable / dars jadvali
        CREATE TABLE IF NOT EXISTS timetable (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_name TEXT NOT NULL,
            day_num INTEGER NOT NULL,
            lesson_num INTEGER NOT NULL,
            time_range TEXT NOT NULL,
            subject_name TEXT NOT NULL,
            teacher_name TEXT NOT NULL,
            room_name TEXT NOT NULL,
            icon TEXT DEFAULT 'fa-book-open'
        );

        -- Teachers / Ustozlar
        CREATE TABLE IF NOT EXISTS teachers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            role TEXT NOT NULL,
            category TEXT NOT NULL,
            bio TEXT NOT NULL,
            email TEXT NOT NULL,
            hours TEXT NOT NULL,
            photo_url TEXT
        );

        -- Photo gallery
        CREATE TABLE IF NOT EXISTS gallery (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            tag TEXT NOT NULL,
            category TEXT NOT NULL,
            img_url TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Electronic Library Books / Darsliklar
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT NOT NULL,
            class_level TEXT NOT NULL,
            pages INTEGER DEFAULT 180,
            cover_img TEXT,
            pdf_url TEXT,
            file_size TEXT DEFAULT '14.2 MB',
            downloads_count INTEGER DEFAULT 0,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Honors and Olympiad Winners / Faxriy O'quvchilar
        CREATE TABLE IF NOT EXISTS honors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            class_val TEXT NOT NULL,
            achievement_title TEXT NOT NULL,
            category TEXT NOT NULL,
            badge_text TEXT DEFAULT '1-O''rin',
            award_year TEXT DEFAULT '2026',
            photo_url TEXT,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- System configuration & site settings
        CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        );

        -- Indexes for high-performance query execution
        CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
        CREATE INDEX IF NOT EXISTS idx_news_date ON news(created_at);
        CREATE INDEX IF NOT EXISTS idx_apps_status ON applications(status);
        CREATE INDEX IF NOT EXISTS idx_apps_created ON applications(created_at);
        CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(is_read);
        CREATE INDEX IF NOT EXISTS idx_test_questions_sub ON test_questions(subject_key);
        CREATE INDEX IF NOT EXISTS idx_test_results_cert ON test_results(cert_code);
        CREATE INDEX IF NOT EXISTS idx_certificates_code ON certificates(cert_code);
        CREATE INDEX IF NOT EXISTS idx_timetable_class_day ON timetable(class_name, day_num);
        CREATE INDEX IF NOT EXISTS idx_books_cat_class ON books(category, class_level);
        CREATE INDEX IF NOT EXISTS idx_honors_cat ON honors(category);
    `);
}

initSchema();

module.exports = db;
