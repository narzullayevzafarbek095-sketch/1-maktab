const bcrypt = require('bcryptjs');
const db = require('../config/database');

function seedDatabase() {
    console.log('🔄 Checking database seed state...');

    // 1. Seed Admin
    const adminCount = db.get('SELECT COUNT(*) as count FROM admins').count;
    if (adminCount === 0) {
        const hash = bcrypt.hashSync('admin123', 10);
        db.run(`
            INSERT INTO admins (username, password_hash, full_name, role)
            VALUES (?, ?, ?, ?)
        `, ['admin', hash, 'Maktab Direktori & Bosh Administrator', 'superadmin']);
        console.log('✅ Default admin seeded (username: admin, pass: admin123)');
    }

    // 2. Seed Applications
    const appCount = db.get('SELECT COUNT(*) as count FROM applications').count;
    if (appCount === 0) {
        const defaultApps = [
            { id: "DE-2026-7814", student: "Karimova Dilrabo Rustam qizi", birth: "2019-04-12", gender: "female", classVal: "1-sinf", parent: "Karimov Rustam", phone: "+998 (90) 123-45-67", email: "rustam@mail.uz", address: "Toshkent sh., Yunusobod 4-mavze 15-uy", status: "Yangi (Ko'rib chiqilmoqda)" },
            { id: "DE-2026-6521", student: "Toshmatov Jasur Jasurbek o'g'li", birth: "2019-07-25", gender: "male", classVal: "1-sinf", parent: "Toshmatova Zulfiya", phone: "+998 (91) 456-78-90", email: "", address: "Toshkent sh., Markaz-3, 12-uy", status: "Tasdiqlandi" },
            { id: "DE-2026-4190", student: "Xolmatova Malika Farhod qizi", birth: "2015-09-18", gender: "female", classVal: "5-sinf", parent: "Xolmatov Farhod", phone: "+998 (93) 890-12-34", email: "farhod@gmail.com", address: "Toshkent sh., Yangi hayot MFY, 8-uy", status: "Yangi (Ko'rib chiqilmoqda)" }
        ];

        const insertApp = db.prepare(`
            INSERT INTO applications (id, student_name, birth_date, gender, class_val, address, parent_name, parent_phone, parent_email, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const app of defaultApps) {
            insertApp.run(app.id, app.student, app.birth, app.gender, app.classVal, app.address, app.parent, app.phone, app.email, app.status);
        }
        console.log(`✅ ${defaultApps.length} applications seeded.`);
    }

    // 3. Seed Messages
    const msgCount = db.get('SELECT COUNT(*) as count FROM messages').count;
    if (msgCount === 0) {
        const defaultMsgs = [
            { name: "Aliyeva Shahnoza", phone: "+998 (90) 555-11-22", topic: "1-Sinfga Qabul", message: "Assalomu alaykum! 1-sinfga qabul bo'yicha tibbiy daftarcha qachongacha topshirilishi kerak?", is_read: 0 },
            { name: "Sobirov Otabek", phone: "+998 (97) 333-44-55", topic: "To'garaklar", message: "Maktabda shaxmat va robototexnika to'garaklari qaysi kunlarda bo'lib o'tadi?", is_read: 0 }
        ];

        const insertMsg = db.prepare(`
            INSERT INTO messages (name, phone, topic, message, is_read)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const m of defaultMsgs) {
            insertMsg.run(m.name, m.phone, m.topic, m.message, m.is_read);
        }
        console.log(`✅ ${defaultMsgs.length} messages seeded.`);
    }

    // 4. Seed News
    const newsCount = db.get('SELECT COUNT(*) as count FROM news').count;
    if (newsCount === 0) {
        const defaultNews = [
            {
                title: "Maktabimiz o'quvchilari Viloyat Fan Olimpiadasida 1-o'rinni qo'lga kiritishdi!",
                category: "yutuq",
                category_name: "🏆 Yutuqlar",
                badge_class: "badge-gold",
                date: "20.08.2026",
                views: 485,
                img: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=800&auto=format&fit=crop",
                summary: "DILBAR EDICATION Innovatsion Akademiyasi o'quvchilari viloyat matematika va ingliz tili fan olimpiadasida mutlaq g'oliblikni qo'lga kiritdilar.",
                content: "Sirdaryo viloyati bo'yicha o'tkazilgan umumta'lim maktablari o'rtasidagi fan olimpiadasida DILBAR EDICATION Innovatsion Ta'lim Maskani o'quvchilari yuqori natijalarni qayd etishdi. Matematika fanidan 10-A sinf o'quvchisi Sardor Rahimov 1-o'rinni, ingliz tili fanidan esa 11-A sinf o'quvchisi Zarina Boboyeva 1-o'rinni egallab, Respublika bosqichiga yo'llanmani qo'lga kiritishdi. Maktabimiz rahbariyati va jamoasi barcha o'quvchilar va ularning ustozlarini ushbu yuksak g'alaba bilan samimiy muborakbod etadi!"
            },
            {
                title: "2026-2027 o'quv yili uchun 1-sinfga qabul va hujjatlar topshirish davom etmoqda",
                category: "elon",
                category_name: "📢 Muhim E'lon",
                badge_class: "badge-cyan",
                date: "19.08.2026",
                views: 620,
                img: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=800&auto=format&fit=crop",
                summary: "Hurmatli ota-onalar! 1-sonli maktabimizda yangi o'quv yili uchun 1-sinfga qabul jarayonlari elektron portal hamda qabulxona orqali amalga oshirilmoqda.",
                content: "DILBAR EDICATION Innovatsion Ta'lim Maskanida 2026-2027 o'quv yili uchun 1-sinfga qabul jarayoni faol davom etmoqda. 1-sinfga qabul qilinuvchi bolalar uchun zarur hujjatlar: bolaning tug'ilganlik haqidagi guvohnomasi nusxasi, 086-shakldagi tibbiy ma'lumotnoma, 3x4 o'lchamdagi 4 dona fotosurat va ota-onaning pasport nusxalari. Arizalarni to'g'ridan-to'g'ri veb-saytimizning 'Ariza Qoldirish' bo'limi orqali ham onlayn yuborishingiz mumkin."
            },
            {
                title: "Maktabimizda zamonaviy IT va Robototexnika laboratoriyasi foydalanishga topshirildi",
                category: "tadbir",
                category_name: "🎉 Tadbirlar",
                badge_class: "badge-purple",
                date: "17.08.2026",
                views: 390,
                img: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=800&auto=format&fit=crop",
                summary: "O'quvchilarimizning IT va dasturlash ko'nikmalarini oshirish maqsadida maktabimizda yangi kompyuterlar va robot konstruktorlari bilan jihozlangan sinfxona ochildi.",
                content: "Maktabimiz moddiy-texnik bazasini rivojlantirish dasturi doirasida 202-xonada zamonaviy axborot texnologiyalari va Robototexnika sinfi to'liq yangilandi. Yangi sinfda yuqori tezlikdagi kompyuterlar, 3D printer va dasturlanuvchi robot konstruktorlari o'rnatildi. Endilikda o'quvchilarimiz darsdan tashqari vaqtlarda bepul IT to'garaklarida Python, web dasturlash va robot sxemalarini amalda o'rganishlari mumkin."
            }
        ];

        const insertNews = db.prepare(`
            INSERT INTO news (title, category, category_name, badge_class, date, views, img, summary, content)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const n of defaultNews) {
            insertNews.run(n.title, n.category, n.category_name, n.badge_class, n.date, n.views, n.img, n.summary, n.content);
        }
        console.log(`✅ ${defaultNews.length} news articles seeded.`);
    }

    // 5. Seed Clubs
    const clubsCount = db.get('SELECT COUNT(*) as count FROM clubs').count;
    if (clubsCount === 0) {
        const defaultClubs = [
            { name: "Robototexnika & STEM", category: "it", schedule: "Dushanba, Chorshanba 14:30", room: "202-STEM lab", teacher: "Informatika ustozi", description: "Robot yasash, sensorlar bilan ishlash va Arduino dasturlash", icon: "fa-robot", badge: "Bepul" },
            { name: "Shaxmat va Shashka", category: "sport", schedule: "Seshanba, Payshanba 15:00", room: "Kutubxona zali", teacher: "Shaxmat murabbiyi", description: "Strategik fikrlash, kombinatsiyalar va turnirlarga tayyorgarlik", icon: "fa-chess-knight", badge: "Bepul" },
            { name: "IT & Dasturlash (Python / Web)", category: "it", schedule: "Chorshanba, Juma 14:00", room: "Kompyuter sinfi", teacher: "Web dasturlash ustozi", description: "Python asoslari, HTML/CSS veb saytlar va algoritmlar", icon: "fa-laptop-code", badge: "Bepul" },
            { name: "English Speaking Club", category: "lang", schedule: "Dushanba, Payshanba 15:30", room: "C-102 xona", teacher: "Nodira Abdullayeva", description: "Nutqni o'stirish, debatlar, IELTS tayyorgarlik va erkin suhbat", icon: "fa-globe", badge: "Bepul" },
            { name: "Basketbol & Voleybol", category: "sport", schedule: "Seshanba, Juma 16:00", room: "Sport majmuasi", teacher: "Jismoniy tarbiya ustozi", description: "Jamoaviy sport o'yinlari va viloyat musobaqalariga tayyorgarlik", icon: "fa-basketball", badge: "Bepul" }
        ];

        const insertClub = db.prepare(`
            INSERT INTO clubs (name, category, schedule, room, teacher, description, icon, badge)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const c of defaultClubs) {
            insertClub.run(c.name, c.category, c.schedule, c.room, c.teacher, c.description, c.icon, c.badge);
        }

        // Seed initial registrations
        db.run(`
            INSERT OR IGNORE INTO club_registrations (ticket_id, club_name, student_name, class_val, phone, status)
            VALUES 
            ('CLUB-2026-4412', 'Robototexnika & STEM', 'Qodirov Samandar Rustam o''g''li', '8-A Sinf', '+998 (90) 123-45-67', 'Tasdiqlandi'),
            ('CLUB-2026-8911', 'English Speaking Club', 'Zokirova Madina Anvar qizi', '10-A Sinf', '+998 (99) 888-77-66', 'Tasdiqlandi')
        `);
        console.log(`✅ ${defaultClubs.length} clubs and default registrations seeded.`);
    }

    // 6. Seed Tests & Question Bank
    const subjectsCount = db.get('SELECT COUNT(*) as count FROM test_subjects').count;
    if (subjectsCount === 0) {
        const subjects = [
            { key: "math", title: "Matematika & Algebra Testi", class_badge: "7-9 Sinf", subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov", duration: 15 },
            { key: "english", title: "Ingliz Tili (English Grammar B1)", class_badge: "5-11 Sinf", subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov", duration: 15 },
            { key: "onatili", title: "Ona Tili va Imlo Savodxonligi", class_badge: "5-9 Sinf", subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov", duration: 15 },
            { key: "it", title: "Informatika va IT Savodxonlik", class_badge: "7-11 Sinf", subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov", duration: 15 },
            { key: "history", title: "O'zbekiston Tarixi & Madaniyati", class_badge: "6-11 Sinf", subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov", duration: 15 },
            { key: "primary", title: "Boshlang'ich Bilimdon Testi (1-4 Sinf)", class_badge: "1-4 Sinf", subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov", duration: 15 }
        ];

        const insertSub = db.prepare(`
            INSERT INTO test_subjects (key_name, title, class_badge, subtitle, duration_minutes)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const s of subjects) {
            insertSub.run(s.key, s.title, s.class_badge, s.subtitle, s.duration);
        }

        const questions = [
            // Math
            { sub: "math", q: "2x + 14 = 30 tenglamaning ildizini (x) toping.", opts: ["x = 8", "x = 7", "x = 9", "x = 6"], c: 0, exp: "2x = 30 - 14 => 2x = 16 => x = 8." },
            { sub: "math", q: "Kvadratning tomoni 9 sm bo'lsa, uning yuzasi (S) qancha?", opts: ["81 sm²", "36 sm²", "72 sm²", "18 sm²"], c: 0, exp: "Kvadrat yuzi: S = a² = 9² = 81 sm²." },
            { sub: "math", q: "Uchburchakning ichki burchaklari yig'indisi necha gradusga teng?", opts: ["180°", "360°", "90°", "270°"], c: 0, exp: "Har qanday uchburchakning ichki burchaklari yig'indisi 180° ga teng." },
            { sub: "math", q: "Sonning 25 foizi 50 ga teng bo'lsa, bu sonning o'zi nechaga teng?", opts: ["200", "150", "250", "100"], c: 0, exp: "50 / 0.25 = 200." },
            { sub: "math", q: "(-4) * (-7) ko'paytmaning qiymatini hisoblang.", opts: ["28", "-28", "24", "-11"], c: 0, exp: "Ikkita manfiy son ko'paytmasi musbat bo'ladi: (-4)*(-7) = 28." },
            { sub: "math", q: "To'g'ri burchakli uchburchakda gipotenuza c² = a² + b² qaysi teorema?", opts: ["Pifagor teoremasi", "Fales teoremasi", "Viyet teoremasi", "Nyuton qonuni"], c: 0, exp: "Pifagor teoremasi to'g'ri burchakli uchburchak tomonlarini ifodalaydi." },
            { sub: "math", q: "3/4 + 1/2 kasrlarni qo'shing.", opts: ["5/4 (1.25)", "4/6", "1", "3/8"], c: 0, exp: "3/4 + 2/4 = 5/4 = 1.25." },
            { sub: "math", q: "5 ning 3-darajasi (5³) nechaga teng?", opts: ["125", "15", "75", "25"], c: 0, exp: "5 * 5 * 5 = 125." },
            { sub: "math", q: "Doiraning yuzini topish formulasi qaysi?", opts: ["S = π * r²", "S = 2 * π * r", "S = a * b", "S = 4 * π * r"], c: 0, exp: "Doira yuzi radiusi orqali S = π*r² deb hisoblanadi." },
            { sub: "math", q: "Ketma-ket kelgan 3 ta natural sonning yig'indisi 36 bo'lsa, o'rtadagi sonni toping.", opts: ["12", "11", "13", "10"], c: 0, exp: "(x-1) + x + (x+1) = 3x = 36 => x = 12." },

            // English
            { sub: "english", q: "She ___ to school every day by bus.", opts: ["goes", "go", "going", "gone"], c: 0, exp: "Present Simple third person singular: She goes." },
            { sub: "english", q: "Yesterday, we ___ a very interesting museum in Tashkent.", opts: ["visited", "visit", "visiting", "have visited"], c: 0, exp: "Past Simple indicator 'yesterday' requires past verb: visited." },
            { sub: "english", q: "What is the opposite of the word 'Generous'?", opts: ["Mean / Stingy", "Polite", "Brave", "Honest"], c: 0, exp: "'Generous' (saxiy) ning teskarisi 'Mean' (xasis)." },
            { sub: "english", q: "I have lived in Tashkent ___ 2018.", opts: ["since", "for", "in", "during"], c: 0, exp: "Aniq boshlanish yili uchun 'since 2018' ishlatiladi." },
            { sub: "english", q: "If it rains tomorrow, we ___ at home.", opts: ["will stay", "stayed", "staying", "had stayed"], c: 0, exp: "First Conditional: If + Present Simple, will + base verb." },
            { sub: "english", q: "This is the boy ___ won the school mathematics olympiad.", opts: ["who", "which", "whose", "where"], c: 0, exp: "Insonlar uchun bog'lovchi olmosh: 'who'." },
            { sub: "english", q: "Mount Everest is ___ mountain in the world.", opts: ["the highest", "higher", "highest", "more high"], c: 0, exp: "Superlative degree: 'the highest'." },
            { sub: "english", q: "They ___ English for 3 years now.", opts: ["have been learning", "learn", "learned", "are learn"], c: 0, exp: "Davom etayotgan harakat: Present Perfect Continuous." },
            { sub: "english", q: "Choose the correct preposition: 'He is interested ___ science and IT.'", opts: ["in", "at", "on", "for"], c: 0, exp: "'Interested in' doim 'in' predlogi bilan ishlatiladi." },
            { sub: "english", q: "Which word is a synonym for 'Huge'?", opts: ["Enormous", "Tiny", "Weak", "Narrow"], c: 0, exp: "'Huge' va 'Enormous' ikkalasi ham 'ulkan, ulug'vor' degani." },

            // Ona tili
            { sub: "onatili", q: "O'zbek tilida nechta unli tovush va nechta unli harf bor?", opts: ["6 ta tovush, 6 ta harf", "10 ta tovush, 8 ta harf", "7 ta tovush, 6 ta harf", "5 ta tovush, 5 ta harf"], c: 0, exp: "O'zbek tilida 6 ta unli tovush (a, o, i, u, o', e) mavjud." },
            { sub: "onatili", q: "Qaysi so'z imlo qoidasiga ko'ra to'g'ri yozilgan?", opts: ["Mutaxassis", "Mutaxasis", "Muttaxassis", "Mutahasiss"], c: 0, exp: "To'g'ri yozilishi: 'Mutaxassis'." },
            { sub: "onatili", q: "O'zbek tiliga davlat tili maqomi qachon berilgan?", opts: ["1989-yil 21-oktabr", "1991-yil 1-sentabr", "1992-yil 8-dekabr", "1993-yil 2-iyul"], c: 0, exp: "1989-yil 21-oktabrda 'Davlat tili haqida'gi Qonun qabul qilingan." },
            { sub: "onatili", q: "'Baland' so'zining antonimi (zid ma'nolisi) qaysi?", opts: ["Past", "Keng", "Uzun", "Qisqa"], c: 0, exp: "Baland so'ziga zid so'z: 'Past'." },
            { sub: "onatili", q: "Harakatning bajaruvchisini bildiruvchi bosh bo'lak nima deyiladi?", opts: ["Ega", "Kesim", "To'ldiruvchi", "Hol"], c: 0, exp: "Gapda kim? nima? so'rog'iga javob bo'lib harakat egasini bildiruvchi bo'lak - Ega." },
            { sub: "onatili", q: "'Xushfe'l' so'zidagi tutuq belgisi (') qanday vazifani bajaradi?", opts: ["Tovushni ajratib, pauza bilan talaffuz qilish", "Unlini cho'zish", "Urg'uni ko'rsatish", "Bo'g'in ajratish"], c: 0, exp: "Undoshdan keyingi tutuq belgisi tovushlar orasida kichik to'xtam (pauza) hosil qiladi." },
            { sub: "onatili", q: "Alisher Navoiy qalamiga mansub besh doston to'plami nima deb ataladi?", opts: ["Xamsa", "Devoni Foniy", "Lison ut-tayr", "Mahbub ul-qulub"], c: 0, exp: "Alisher Navoiyning shoh asari 'Xamsa' (Beshlik) dostonlar to'plamidir." },
            { sub: "onatili", q: "Fe'lning qaysi zamoni harakatning hozir sodir bo'layotganini bildiradi?", opts: ["Hozirgi zamon", "O'tgan zamon", "Kelasi zamon", "Shart mayli"], c: 0, exp: "Hozirgi zamon fe'li ayni vaqtda bajarilayotgan ish-harakatni bildiradi." },
            { sub: "onatili", q: "'Oq ko'ngil' qanday ma'noni ifodalaydi?", opts: ["Samimiy, beg'ubor inson", "Jahldor", "Bevafo", "Qo'rqoq"], c: 0, exp: "Oq ko'ngil iborasi sof, mehribon va samimiy kishilarga nisbatan aytiladi." },
            { sub: "onatili", q: "Ravish so'z turkumi qanday so'roqlarga javob bo'ladi?", opts: ["Qanday? Qay darajada? Qachon? Qayerda?", "Kim? Nima?", "Nechta? Nechanchi?", "Nima qildi? Nima qilyapti?"], c: 0, exp: "Ravish harakatning belgisini, paytini, o'rnini bildiradi." },

            // IT
            { sub: "it", q: "Kompyuterning asosiy 'miyasi' va hisoblash markazi nima?", opts: ["Protsessor (CPU)", "Operativ xotira (RAM)", "Qattiq disk (SSD/HDD)", "Videokarta (GPU)"], c: 0, exp: "CPU (Central Processing Unit) barcha hisoblash amallarini bajaradi." },
            { sub: "it", q: "1 Megabayt (MB) necha Kilobaytga (KB) teng?", opts: ["1024 KB", "1000 KB", "512 KB", "2048 KB"], c: 0, exp: "Informatikada axborot o'lchov birligi 2 ning darajasi: 1 MB = 1024 KB." },
            { sub: "it", q: "Python dasturlash tilida ekranga ma'lumot chiqarish buyrug'i qaysi?", opts: ["print()", "echo()", "console.log()", "display()"], c: 0, exp: "Python dasturlash tilida standart chiqarish funksiyasi print() hisoblanadi." },
            { sub: "it", q: "Axborot xavfsizligida murakkab parolda nimalar bo'lishi shart?", opts: ["Katta-kichik harflar, raqamlar va maxsus belgilar", "Faqat tug'ilgan yil", "Faqat 123456", "Faqat ism"], c: 0, exp: "Xavfsiz parol kamida 8 ta belgidan iborat bo'lib, harf, raqam va maxsus belgilarni o'z ichiga oladi." },
            { sub: "it", q: "Veb-saytlarning ko'rinishi va dizaynini bezash uchun qaysi texnologiya ishlatiladi?", opts: ["CSS", "HTML", "SQL", "C++"], c: 0, exp: "CSS (Cascading Style Sheets) veb-sahifalar dizayni va stillari uchun ishlatiladi." },
            { sub: "it", q: "Fayl kengaytmasi '.docx' bo'lgan fayl qaysi dasturda ochiladi?", opts: ["Microsoft Word", "Microsoft Excel", "Adobe Photoshop", "VLC Player"], c: 0, exp: ".docx formati matnli hujjatlar (Word) dasturiga tegishli." },
            { sub: "it", q: "Algoritm nima?", opts: ["Maqsadga erishish uchun bajariladigan aniq ko'rsatmalar ketma-ketligi", "Kompyuter monitori", "Internet tezligi", "O'yin dasturi"], c: 0, exp: "Algoritm — berilgan vazifani bajarish uchun buyruqlarning qat'iy tartibli ketma-ketligi." },
            { sub: "it", q: "Elektron jadvallar bilan ishlash uchun eng mashhur dastur qaysi?", opts: ["Microsoft Excel", "Paint", "Notepad", "PowerPoint"], c: 0, exp: "Microsoft Excel jadvallar, formulalar va diagrammalar bilan ishlash dasturidir." },
            { sub: "it", q: "HTML qisqartmasining to'liq ma'nosi nima?", opts: ["HyperText Markup Language", "High Transfer Machine Link", "Hyper Tool Multi Language", "Home Text Make Link"], c: 0, exp: "HTML — HyperText Markup Language (gipermatnli belgilash tili)." },
            { sub: "it", q: "Internet brauzerlariga misol keltiring:", opts: ["Google Chrome, Mozilla Firefox, Microsoft Edge", "Windows, Linux, macOS", "Word, Excel, Access", "Photoshop, CorelDraw"], c: 0, exp: "Chrome, Firefox va Edge internet sahifalarini ochuvchi veb-brauzerlardir." },

            // History
            { sub: "history", q: "Sohibqiron Amir Temur qaysi yili tavallud topgan?", opts: ["1336-yil 9-aprel", "1340-yil 1-may", "1370-yil 10-aprel", "1405-yil 18-fevral"], c: 0, exp: "Amir Temur 1336-yil 9-aprelda Kesh (Shahrisabz) yaqinidagi Xo'ja Ilg'or qishlog'ida tug'ilgan." },
            { sub: "history", q: "Amir Temurning mashhur shiori qanday bo'lgan?", opts: ["Kuch — adolatdadir!", "Ilm — najotdir!", "G'alaba — birdamlikda!", "Tinchlik — boylikdir!"], c: 0, exp: "Sohibqiron Amir Temur saltanatining bosh tamoyili 'Kuch — adolatdadir' bo'lgan." },
            { sub: "history", q: "Tibbiyot ilmining sultoni, 'Tib qonunlari' asari muallifi kim?", opts: ["Abu Ali ibn Sino (Avitsenna)", "Abu Rayhon Beruniy", "Al-Xorazmiy", "Mirzo Ulug'bek"], c: 0, exp: "Abu Ali ibn Sino butun jahonga mashhur 'Al-Qonun fit-tibb' asari muallifidir." },
            { sub: "history", q: "Algebra faniga asos solgan buyuk alloma kim?", opts: ["Muhammad al-Xorazmiy", "Ahmad Farg'oniy", "Ibn Sino", "Zahiriddin Muhammad Bobur"], c: 0, exp: "Al-Xorazmiy 'Al-Jabr' asari bilan matematika va algebra faniga asos solgan." },
            { sub: "history", q: "Samarqandda yirik rasadxona (observatoriya) qurdirgan astronom-hukmdor kim?", opts: ["Mirzo Ulug'bek", "Shohruh Mirzo", "Amir Temur", "Husayn Boyqaro"], c: 0, exp: "Mirzo Ulug'bek Samarqandda rasadxona qurib, 1018 ta yulduz jadvalini tuzgan." },
            { sub: "history", q: "'Boburnoma' asarining muallifi va Boburiylar saltanati asoschisi kim?", opts: ["Zahiriddin Muhammad Bobur", "Kamolidin Behzod", "Abdulla Qodiriy", "Munis Xorazmiy"], c: 0, exp: "Zahiriddin Muhammad Bobur 'Boburnoma' memuar asarining muallifidir." },
            { sub: "history", q: "O'zbekiston Respublikasi Davlat Mustaqilligi qachon e'lon qilingan?", opts: ["1991-yil 31-avgust (1-sentabr)", "1992-yil 8-dekabr", "1990-yil 20-iyun", "1989-yil 21-oktabr"], c: 0, exp: "1991-yil 31-avgustda O'zbekiston Respublikasining davlat mustaqilligi e'lon qilingan." },
            { sub: "history", q: "Qadimgi Buyuk Ipak Yo'li qaysi qit'alarni bog'lab turgan?", opts: ["Osiyo va Yevropa", "Afrika va Amerika", "Avstraliya va Osiyo", "Yevropa va Amerika"], c: 0, exp: "Buyuk Ipak Yo'li Sharq (Xitoy, Markaziy Osiyo) va G'arb (Yevropa) savdo yo'li bo'lgan." },
            { sub: "history", q: "O'zbekiston Respublikasi Konstitutsiyasi qachon qabul qilingan?", opts: ["1992-yil 8-dekabr", "1991-yil 1-sentabr", "1993-yil 2-iyul", "1994-yil 1-iyul"], c: 0, exp: "O'zbekiston Respublikasining birinchi Konstitutsiyasi 1992-yil 8-dekabrda qabul qilingan." },
            { sub: "history", q: "Sirdaryo viloyati markazi qaysi shahar?", opts: ["Toshkent", "Yangiyer", "Shirin", "Boyovut"], c: 0, exp: "Sirdaryo viloyatining ma'muriy markazi Toshkent shahridir." },

            // Primary
            { sub: "primary", q: "Bir yilda nechta fasl va nechta oy bor?", opts: ["4 fasl, 12 oy", "3 fasl, 10 oy", "4 fasl, 10 oy", "2 fasl, 12 oy"], c: 0, exp: "Bir yilda 4 fasl (Bahor, Yoz, Kuz, Qish) va 12 oy bor." },
            { sub: "primary", q: "7 ga 8 ni qo'shsak necha bo'ladi?", opts: ["15", "14", "16", "13"], c: 0, exp: "7 + 8 = 15." },
            { sub: "primary", q: "O'zbekiston Respublikasi Davlat bayrog'ida nechta yulduz tasvirlangan?", opts: ["12 ta", "10 ta", "14 ta", "8 ta"], c: 0, exp: "Bayrog'imizda 12 ta yulduz va yarim oy tasvirlangan." },
            { sub: "primary", q: "Quyosh qaysi tomondan chiqadi?", opts: ["Sharqdan", "G'arbdan", "Shimoldan", "Janubdan"], c: 0, exp: "Quyosh har kuni Sharqdan chiqadi va G'arbga botadi." },
            { sub: "primary", q: "Daraxt barglari kuzda qanday rangga kiradi?", opts: ["Sariq va qizil", "Moviy va ko'k", "Qora va kulrang", "Oq"], c: 0, exp: "Kuz faslida barglar xazon bo'lib sarg'ayadi." },
            { sub: "primary", q: "5 * 6 ko'paytirish jadvali natijasi nechaga teng?", opts: ["30", "25", "35", "36"], c: 0, exp: "5 * 6 = 30." },
            { sub: "primary", q: "Eng kichik ikki xonali son qaysi?", opts: ["10", "1", "11", "99"], c: 0, exp: "Eng kichik 2 xonali son — 10." },
            { sub: "primary", q: "Qaysi faslda Qorboqir (qor) yog'adi?", opts: ["Qish", "Bahor", "Yoz", "Kuz"], c: 0, exp: "Qor va qattiq sovuq qish faslida bo'ladi." },
            { sub: "primary", q: "Kitob o'qish inson uchun nima beradi?", opts: ["Katta bilim va aql-zakovat", "Uyqu", "Charchoq", "Hech narsa"], c: 0, exp: "Kitob — bilim manbayi bo'lib, tafakkurni o'stiradi." },
            { sub: "primary", q: "1 metrda necha santimetr bor?", opts: ["100 sm", "10 sm", "1000 sm", "50 sm"], c: 0, exp: "1 metr = 100 santimetrga teng." }
        ];

        const insertQ = db.prepare(`
            INSERT INTO test_questions (subject_key, question, options_json, correct_idx, explanation)
            VALUES (?, ?, ?, ?, ?)
        `);

        for (const q of questions) {
            insertQ.run(q.sub, q.q, JSON.stringify(q.opts), q.c, q.exp);
        }
        console.log(`✅ ${subjects.length} subjects and ${questions.length} questions seeded.`);
    }

    // 7. Seed Sample Certificates
    const certCount = db.get('SELECT COUNT(*) as count FROM certificates').count;
    if (certCount === 0) {
        db.run(`
            INSERT INTO certificates (cert_code, cert_type, student_name, class_val, purpose_or_subject, details_json, issue_date, is_valid)
            VALUES 
            ('CERT-2026-8841', 'certificate', 'Karimov Jasurbek Anvar o''g''li', '7-A', 'Matematika & Algebra Testi (10/10)', '{"score":10,"total":10,"grade":"A''lochi (5 baho)"}', '21.08.2026', 1),
            ('SP-2026-7482', 'spravka', 'Karimova Dilrabo Rustam qizi', '1-A', 'Toshkent shahar Musiqa va San''at maktabiga taqdim etish uchun', '{"signedBy":"D.Yusupova","status":"Tasdiqlangan"}', '20.08.2026', 1)
        `);
        console.log('✅ Default certificates seeded.');
    }

    // 8. Seed Students & Grades
    const studCount = db.get('SELECT COUNT(*) as count FROM students').count;
    if (studCount === 0) {
        const students = [
            {
                id_code: "2026-01",
                name: "Karimov Jasurbek Anvar o'g'li",
                class_val: "7-A Sinf",
                att: "98.5% (A'lo)",
                gpa: "4.88",
                level: "A'lochi (Oltin medalga nomzod)",
                grades: [
                    { num: 1, name: "Matematika (Algebra & Geometriya)", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 2, name: "Ona tili va Adabiyot", q1: 5, q2: 5, q3: 4, q4: 5, yr: 5 },
                    { num: 3, name: "Ingliz tili (Foreign Language)", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 4, name: "Informatika va IT Texnologiyalar", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 5, name: "Fizika", q1: 4, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 6, name: "O'zbekiston Tarixi", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 7, name: "Biologiya", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 8, name: "Kimyo", q1: 4, q2: 5, q3: 5, q4: 5, yr: 5 }
                ]
            },
            {
                id_code: "2026-02",
                name: "Karimova Dilrabo Rustam qizi",
                class_val: "1-A Sinf",
                att: "99.2% (A'lo)",
                gpa: "5.00",
                level: "A'lochi",
                grades: [
                    { num: 1, name: "Alifbe & Savodxonlik", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 2, name: "Matematika", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 3, name: "O'qish Savodxonligi", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 4, name: "Tasviriy San'at & Texnologiya", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 }
                ]
            },
            {
                id_code: "2026-03",
                name: "Rahimov Sardor Ilhom o'g'li",
                class_val: "10-A Sinf",
                att: "97.8% (A'lo)",
                gpa: "4.92",
                level: "Viloyat Olimpiada G'olibi",
                grades: [
                    { num: 1, name: "Algebra & Matematik Analiz", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 2, name: "Geometriya", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 3, name: "Fizika & Astronomiya", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 4, name: "Informatika (Python)", q1: 5, q2: 5, q3: 5, q4: 5, yr: 5 },
                    { num: 5, name: "Ingliz tili (IELTS prep)", q1: 5, q2: 5, q3: 4, q4: 5, yr: 5 }
                ]
            }
        ];

        const insertStud = db.prepare(`
            INSERT INTO students (student_id_code, full_name, class_val, attendance, gpa, level_badge)
            VALUES (?, ?, ?, ?, ?, ?)
        `);

        const insertGrade = db.prepare(`
            INSERT INTO student_grades (student_id_code, num, subject_name, q1, q2, q3, q4, yearly)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const st of students) {
            insertStud.run(st.id_code, st.name, st.class_val, st.att, st.gpa, st.level);
            for (const g of st.grades) {
                insertGrade.run(st.id_code, g.num, g.name, g.q1, g.q2, g.q3, g.q4, g.yr);
            }
        }
        console.log(`✅ ${students.length} student report cards and grades seeded.`);
    }

    // 9. Seed Timetable
    const ttCount = db.get('SELECT COUNT(*) as count FROM timetable').count;
    if (ttCount === 0) {
        const tt = [
            // 1-A Day 1
            { c: "1-A", d: 1, n: 1, t: "08:00 - 08:45", s: "Alifbe & Savodxonlik", tr: "Muqaddas Jo'rayeva", r: "101-xona", i: "fa-book-open" },
            { c: "1-A", d: 1, n: 2, t: "08:50 - 09:35", s: "Matematika", tr: "Muqaddas Jo'rayeva", r: "101-xona", i: "fa-calculator" },
            { c: "1-A", d: 1, n: 3, t: "09:50 - 10:35", s: "Tasviriy San'at", tr: "Muqaddas Jo'rayeva", r: "101-xona", i: "fa-palette" },
            { c: "1-A", d: 1, n: 4, t: "10:40 - 11:25", s: "Jismoniy Tarbiya", tr: "Jismoniy tarbiya ustozi", r: "Sport zal", i: "fa-futbol" },

            // 7-A Day 1
            { c: "7-A", d: 1, n: 1, t: "08:00 - 08:45", s: "Matematika (Algebra)", tr: "Sanobar Ergasheva", r: "204-xona", i: "fa-calculator" },
            { c: "7-A", d: 1, n: 2, t: "08:50 - 09:35", s: "Ona Tili", tr: "Botir Normurodov", r: "105-xona", i: "fa-book-open" },
            { c: "7-A", d: 1, n: 3, t: "09:50 - 10:35", s: "Ingliz Tili", tr: "Nodira Abdullayeva", r: "201-xona", i: "fa-globe" },
            { c: "7-A", d: 1, n: 4, t: "10:40 - 11:25", s: "Fizika", tr: "Fizika ustozi", r: "Fizika Lab", i: "fa-bolt" },
            { c: "7-A", d: 1, n: 5, t: "11:35 - 12:20", s: "O'zbekiston Tarixi", tr: "Tarix ustozi", r: "112-xona", i: "fa-landmark" },

            // 7-A Day 2
            { c: "7-A", d: 2, n: 1, t: "08:00 - 08:45", s: "Geometriya", tr: "Sanobar Ergasheva", r: "204-xona", i: "fa-shapes" },
            { c: "7-A", d: 2, n: 2, t: "08:50 - 09:35", s: "Adabiyot", tr: "Botir Normurodov", r: "105-xona", i: "fa-book" },
            { c: "7-A", d: 2, n: 3, t: "09:50 - 10:35", s: "Informatika (e-Maktab)", tr: "Informatika ustozi", r: "Kompyuter xonasi", i: "fa-laptop-code" },
            { c: "7-A", d: 2, n: 4, t: "10:40 - 11:25", s: "Biologiya", tr: "Biologiya ustozi", r: "215-xona", i: "fa-leaf" }
        ];

        const insertTt = db.prepare(`
            INSERT INTO timetable (class_name, day_num, lesson_num, time_range, subject_name, teacher_name, room_name, icon)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of tt) {
            insertTt.run(item.c, item.d, item.n, item.t, item.s, item.tr, item.r, item.i);
        }
        console.log(`✅ ${tt.length} timetable entries seeded.`);
    }

    // 10. Seed Teachers
    const teachCount = db.get('SELECT COUNT(*) as count FROM teachers').count;
    if (teachCount === 0) {
        const teachers = [
            { name: "Dilfuza Yusupova", role: "Maktab Direktori", category: "leadership", bio: "Oliy toifali pedagog, Xalq ta'limi a'lochisi. 22 yillik rahbarlik va pedagogik tajribaga ega.", email: "director@dilbareducation.uz", hours: "Dushanba va Payshanba 14:00 – 17:00", photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" },
            { name: "Rustam Xolmatov", role: "O'quv ishlari bo'yicha direktor o'rinbosari (Zavuch)", category: "leadership", bio: "Oliy toifali matematika fani o'qituvchisi. 18 yillik tajriba.", email: "zavuch@dilbareducation.uz", hours: "Seshanba va Juma 13:00 – 16:00", photo_url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop" },
            { name: "Sanobar Ergasheva", role: "Matematika va Algebra fani ustozi", category: "exact", bio: "Viloyat 'Yilning eng yaxshi matematika fani o'qituvchisi' tanlovi g'olibi.", email: "s.ergasheva@dilbareducation.uz", hours: "Har kuni 08:30 – 13:30", photo_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop" },
            { name: "Nodira Abdullayeva", role: "Ingliz tili (Foreign Language) ustozi", category: "foreign", bio: "IELTS 8.0, TESOL sertifikati sohibasi. O'quvchilari respublika olimpiadasi sovrindorlari.", email: "n.abdullayeva@dilbareducation.uz", hours: "Dushanba, Chorshanba, Juma", photo_url: "https://images.unsplash.com/photo-1580894732488-82550cb52824?q=80&w=400&auto=format&fit=crop" },
            { name: "Botir Normurodov", role: "Ona tili va Adabiyot fani ustozi", category: "humanities", bio: "Filologiya fanlari nomzodi, yosh adabiyotchilar to'garagi rahbari.", email: "b.normurodov@dilbareducation.uz", hours: "Seshanba va Payshanba", photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop" },
            { name: "Muqaddas Jo'rayeva", role: "Boshlang'ich sinf ustozi (1-A sinf rahbari)", category: "primary", bio: "Oliy toifali boshlang'ich ta'lim mutaxassisi, bolalar psixologiyasi bo'yicha ekspert.", email: "m.jurayeva@dilbareducation.uz", hours: "Dushanba – Juma 08:00 – 13:00", photo_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop" }
        ];

        const insertTeach = db.prepare(`
            INSERT INTO teachers (name, role, category, bio, email, hours, photo_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const t of teachers) {
            insertTeach.run(t.name, t.role, t.category, t.bio, t.email, t.hours, t.photo_url);
        }
        console.log(`✅ ${teachers.length} teachers seeded.`);
    }

    // 12. Seed Gallery
    const galCount = db.get('SELECT COUNT(*) as count FROM gallery').count;
    if (galCount === 0) {
        const gallery = [
            { img_url: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1200&auto=format&fit=crop", title: "DILBAR EDICATION Asosiy Ta'lim Binosi", tag: "Maktab Binosi", category: "campus" },
            { img_url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop", title: "Boshlang'ich Sinf O'quvchilari Dars Jarayonida", tag: "Dars Jarayonlari", category: "lessons" },
            { img_url: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=1200&auto=format&fit=crop", title: "Faollar Zalidagi Bayram Tadbiri va Konsert", tag: "Bayram & Tadbirlar", category: "events" },
            { img_url: "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=1200&auto=format&fit=crop", title: "Sport Majmuasida Voleybol Musobaqasi", tag: "Sport & Faollik", category: "sport" },
            { img_url: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop", title: "Zamonaviy IT & Kompyuter Sinfxonasi", tag: "IT & Robototexnika", category: "campus" },
            { img_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop", title: "Matematika va Fan Laboratoriyasi Amaliy Mashg'uloti", tag: "Dars Jarayonlari", category: "lessons" }
        ];

        const insertGal = db.prepare(`
            INSERT INTO gallery (title, tag, category, img_url)
            VALUES (?, ?, ?, ?)
        `);

        for (const g of gallery) {
            insertGal.run(g.title, g.tag, g.category, g.img_url);
        }
        console.log(`✅ ${gallery.length} gallery items seeded.`);
    }

    // 13. Seed Books (Elektron Kutubxona)
    const booksCount = db.get('SELECT COUNT(*) as count FROM books').count;
    if (booksCount === 0) {
        const books = [
            { title: "Algebra (7-sinf)", author: "Sh.Alimov va boshqalar", category: "exact", class_level: "7-sinf", pages: 192, cover_img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=600&auto=format&fit=crop", file_size: "16.8 MB", downloads_count: 245, description: "7-sinf umumiy o'rta ta'lim maktablari uchun Algebra darsligi" },
            { title: "Ona Tili va Adabiyot (10-sinf)", author: "N.Mahmudov, B.To'xliyev", category: "humanities", class_level: "10-sinf", pages: 208, cover_img: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=600&auto=format&fit=crop", file_size: "14.2 MB", downloads_count: 180, description: "O'zbek tili va mumtoz adabiyot bo'yicha to'liq qo'llanma" },
            { title: "English Student's Book B1 (9-sinf)", author: "L.Jo'rayev va xalqaro metodistlar", category: "lang", class_level: "9-sinf", pages: 160, cover_img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600&auto=format&fit=crop", file_size: "22.5 MB", downloads_count: 310, description: "Ingliz tili B1 darajadagi zamonaviy darslik va audio mashqlar" },
            { title: "Informatika va Axborot Texnologiyalari (8-sinf)", author: "B.Boltiyev, A.G'aniyev", category: "it", class_level: "8-sinf", pages: 144, cover_img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=600&auto=format&fit=crop", file_size: "18.1 MB", downloads_count: 420, description: "Python dasturlash, algoritm va ma'lumotlar xavfsizligi" },
            { title: "Fizika (9-sinf)", author: "P.Habibullayev, A.Boydedayev", category: "exact", class_level: "9-sinf", pages: 224, cover_img: "https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?q=80&w=600&auto=format&fit=crop", file_size: "19.4 MB", downloads_count: 165, description: "Kinematika, dinamika, elektr va magnit hodisalari" },
            { title: "Alifbe va Savodxonlik (1-sinf)", author: "K.Qosimova, S.Fuzailov", category: "primary", class_level: "1-sinf", pages: 128, cover_img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=600&auto=format&fit=crop", file_size: "12.0 MB", downloads_count: 530, description: "1-sinf o'quvchilari uchun Alifbe va chiroyli yozuv kitobi" }
        ];

        const insertBook = db.prepare(`
            INSERT INTO books (title, author, category, class_level, pages, cover_img, pdf_url, file_size, downloads_count, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const b of books) {
            insertBook.run(b.title, b.author, b.category, b.class_level, b.pages, b.cover_img, '#', b.file_size, b.downloads_count, b.description);
        }
        console.log(`✅ ${books.length} library textbooks seeded.`);
    }

    // 14. Seed Honors (Faxriy O'quvchilar & Olimpiada G'oliblari)
    const honorsCount = db.get('SELECT COUNT(*) as count FROM honors').count;
    if (honorsCount === 0) {
        const honors = [
            {
                student_name: "Rahimov Sardor Ilhom o'g'li",
                class_val: "10-A Sinf",
                achievement_title: "Matematika fanidan Viloyat Fan Olimpiadasi Mutlaq G'olibi (1-o'rin)",
                category: "olympiad",
                badge_text: "1-O'rin (Oltin)",
                award_year: "2026",
                photo_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop",
                description: "Sirdaryo viloyati matematika olimpiadasida eng yuqori 100 ball to'plagan."
            },
            {
                student_name: "Boboyeva Zarina Shavkat qizi",
                class_val: "11-A Sinf",
                achievement_title: "Ingliz tili Respublika Olimpiadasi Sovrindori (IELTS 8.0)",
                category: "lang",
                badge_text: "Olimpiada G'olibi",
                award_year: "2026",
                photo_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
                description: "Ingliz tilida erkin so'zlashuvchi, maktabimizning iqtidorli bitiruvchisi."
            },
            {
                student_name: "Karimov Jasurbek Anvar o'g'li",
                class_val: "7-A Sinf",
                achievement_title: "Xalqaro 'Al-Xorazmiy' Yosh Matematiklar Tanlovi 1-darajali diplomi",
                category: "exact",
                badge_text: "1-Darajali Diplom",
                award_year: "2026",
                photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
                description: "Maktabimizning a'lochi o'quvchisi va intellektual to'garak yetakchisi."
            },
            {
                student_name: "Toshmatov Bobur Farhod o'g'li",
                class_val: "9-B Sinf",
                achievement_title: "Respublika IT & Robototexnika Tanlovi G'olibi (Smart School loyihasi)",
                category: "it",
                badge_text: "IT Chempion",
                award_year: "2026",
                photo_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
                description: "Maktabimiz STEM laboratoriyasida aqlli sug'orish robotini yaratgan."
            }
        ];

        const insertHonor = db.prepare(`
            INSERT INTO honors (student_name, class_val, achievement_title, category, badge_text, award_year, photo_url, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const h of honors) {
            insertHonor.run(h.student_name, h.class_val, h.achievement_title, h.category, h.badge_text, h.award_year, h.photo_url, h.description);
        }
        console.log(`✅ ${honors.length} honors seeded.`);
    }

    // 15. Seed Settings
    db.run(`
        INSERT OR REPLACE INTO settings (key, value) VALUES
        ('school_name', 'DILBAR EDICATION — Innovatsion Ta''lim Markazi & Smart Akademiya'),
        ('school_phone', '+998 (71) 200-00-11'),
        ('school_hotline', '+998 (90) 123-45-67'),
        ('school_email', 'info@dilbareducation.uz'),
        ('school_address', 'Toshkent sh., Yunusobod tumani, Innovatsiyalar ko''chasi 1-bino'),
        ('academic_year', '2026-2027'),
        ('director_name', 'Boshqaruv Kengashi & Ilmiy Rahbariyat'),
        ('telegram_channel', 'https://t.me/dilbar_education'),
        ('announcement_text', '📢 Diqqat! DILBAR EDICATION innovatsion ta''lim maskanida yangi o''quv yili uchun qabul davom etmoqda.'),
        ('system_version', '2.1.0 (Express + SQLite)')
    `);

    console.log('🎉 DILBAR EDICATION database seeding completed successfully!');
}

// Run immediately if executed directly
if (require.main === module) {
    seedDatabase();
}

module.exports = seedDatabase;
