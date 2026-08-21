/**
 * ==========================================================================
 * SIRDARYO VILOYATI GULISTON SHAHAR 1-UMUMTA'LIM MAKTABI
 * RASMIY VEB-SAYT, ONLAYN TEST VA ADMIN BOSHQARUV SKRIPTI (java.js)
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initClockAndCountdown();
    initCounters();
    initTimetable();
    initTeachersFilter();
    initAccordion();
    initScrollEffects();
    initKeyboardShortcuts();
    calculateGPA();
    renderAdminApplications();
    renderAdminMessages();
});

/* ==========================================================================
   1. LIVE CLOCK & NEW ACADEMIC YEAR COUNTDOWN
   ========================================================================== */
function initClockAndCountdown() {
    const updateClock = () => {
        const now = new Date();
        const clockEl = document.getElementById('liveClockDisplay');
        if (clockEl) {
            clockEl.innerText = now.toLocaleTimeString('uz-UZ', { hour12: false });
        }
    };
    updateClock();
    setInterval(updateClock, 1000);

    const targetDate = new Date(new Date().getFullYear(), 8, 1, 8, 0, 0);
    if (new Date() > targetDate) {
        targetDate.setFullYear(targetDate.getFullYear() + 1);
    }

    const updateCountdown = () => {
        const now = new Date().getTime();
        const distance = targetDate.getTime() - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            const dEl = document.getElementById('cdDays');
            const hEl = document.getElementById('cdHours');
            const mEl = document.getElementById('cdMinutes');
            const sEl = document.getElementById('cdSeconds');

            if (dEl) dEl.innerText = days.toString().padStart(2, '0');
            if (hEl) hEl.innerText = hours.toString().padStart(2, '0');
            if (mEl) mEl.innerText = minutes.toString().padStart(2, '0');
            if (sEl) sEl.innerText = seconds.toString().padStart(2, '0');
        }
    };
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/* ==========================================================================
   2. DARK / LIGHT THEME TOGGLE & PERSISTENCE
   ========================================================================== */
const htmlElement = document.documentElement;

function initTheme() {
    const savedTheme = localStorage.getItem('1maktab_theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('1maktab_theme', newTheme);
    showToast(`Mavzu: ${newTheme === 'dark' ? '🌙 Tungi rejim' : '☀️ Kunduzgi rejim'}`, 'info');
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

/* ==========================================================================
   3. SCROLL & SIDEBAR NAVIGATION EFFECTS
   ========================================================================== */
const mainHeader = document.getElementById('mainHeader');
const backToTopBtn = document.getElementById('backToTopBtn');
const appSidebar = document.getElementById('appSidebar');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');

function toggleSidebar(open) {
    if (open === undefined) {
        open = !appSidebar?.classList.contains('active');
    }
    if (open) {
        appSidebar?.classList.add('active');
        sidebarBackdrop?.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        appSidebar?.classList.remove('active');
        sidebarBackdrop?.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function initScrollEffects() {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            mainHeader?.classList.add('scrolled');
        } else {
            mainHeader?.classList.remove('scrolled');
        }

        if (window.scrollY > 400) {
            backToTopBtn?.classList.add('visible');
        } else {
            backToTopBtn?.classList.remove('visible');
        }

        updateActiveNavLink();
    });

    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 992) {
                toggleSidebar(false);
            }
        });
    });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 130;
        const sectionId = section.getAttribute('id');
        const correspondingSidebarLink = document.querySelector(`.sidebar-link[href="#${sectionId}"]`);
        const correspondingTopLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            document.querySelectorAll('.sidebar-link, .nav-link').forEach(l => l.classList.remove('active'));
            correspondingSidebarLink?.classList.add('active');
            correspondingTopLink?.classList.add('active');
        }
    });
}

function dismissAnnouncement() {
    const bar = document.getElementById('announcementBar');
    if (bar) bar.style.display = 'none';
}

/* ==========================================================================
   4. ANIMATED NUMBER COUNTERS
   ========================================================================== */
function initCounters() {
    const counters = document.querySelectorAll('.stat-counter, .stat-number');
    let hasRun = false;

    const runCounters = () => {
        counters.forEach(counter => {
            const target = +counter.getAttribute('data-count') || +counter.getAttribute('data-target') || 0;
            const suffix = counter.innerText.includes('%') ? '%' : '+';
            let current = 0;
            const increment = Math.ceil(target / 45);

            const update = () => {
                current += increment;
                if (current >= target) {
                    counter.innerText = target.toLocaleString() + suffix;
                } else {
                    counter.innerText = current.toLocaleString() + suffix;
                    requestAnimationFrame(update);
                }
            };
            update();
        });
    };

    const observer = new IntersectionObserver((entries) => {
        if (entries[0] && entries[0].isIntersecting && !hasRun) {
            hasRun = true;
            runCounters();
        }
    }, { threshold: 0.3 });

    const statsSection = document.querySelector('.hero-stats-wrapper');
    if (statsSection) observer.observe(statsSection);
}

/* ==========================================================================
   5. OVOZLI O'QISH (TEXT-TO-SPEECH ACCESSIBILITY)
   ========================================================================== */
function speakAboutText() {
    if (!('speechSynthesis' in window)) {
        showToast("Brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi.", "info");
        return;
    }

    window.speechSynthesis.cancel();
    const text = "Sirdaryo viloyati Guliston shahar 1-sonli umumiy o'rta ta'lim maktabi. Maktabimiz shiori: Sifatli davlat ta'limi, yuksak tarbiya va zamonaviy raqamli ko'nikmalar. 1-maktab eshiklari bilimga intilgan barcha o'quvchilar uchun doimo ochiq!";
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'uz-UZ';
    utterance.rate = 0.95;

    window.speechSynthesis.speak(utterance);
    showToast("🔊 Maktab haqida ma'lumot ovozli o'qilmoqda...", "info");
}

/* ==========================================================================
   6. ELEKTRON KUTUBXONA (DIGITAL LIBRARY)
   ========================================================================== */
function filterBooks(category) {
    document.querySelectorAll('.gallery-tabs-wrap .gallery-tab-btn').forEach(btn => {
        if (btn.hasAttribute('data-lib')) {
            btn.classList.toggle('active', btn.getAttribute('data-lib') === category);
        }
    });

    const bookCards = document.querySelectorAll('.book-card');
    bookCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

function openBookPreview(title, desc) {
    document.getElementById('bookModalTitle').innerText = title;
    document.getElementById('bookModalDesc').innerText = desc;
    openModal('bookModal');
}

function simulateBookDownload() {
    const title = document.getElementById('bookModalTitle')?.innerText || 'Darslik';
    closeModal('bookModal');
    showToast(`📥 "${title}" darsligi muvaffaqiyatli yuklab olinmoqda (PDF)...`, "success");
}

/* ==========================================================================
   7. ONLAYN TEST MARKAZI (ONLINE TEST & EXAM ENGINE)
   ========================================================================== */

// Filter subject cards in the tests section
function filterTests(category) {
    document.querySelectorAll('.gallery-tabs-wrap .gallery-tab-btn').forEach(btn => {
        if (btn.hasAttribute('data-testcat')) {
            btn.classList.toggle('active', btn.getAttribute('data-testcat') === category);
        }
    });

    const testCards = document.querySelectorAll('.test-cards-grid .test-card');
    testCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Full Question Bank for 6 subjects
const examDatabase = {
    math: {
        title: "Matematika & Algebra Testi",
        classBadge: "7-9 Sinf",
        subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov",
        durationMinutes: 15,
        questions: [
            { q: "2x + 14 = 30 tenglamaning ildizini (x) toping.", opts: ["x = 8", "x = 7", "x = 9", "x = 6"], correct: 0, exp: "2x = 30 - 14 => 2x = 16 => x = 8." },
            { q: "Kvadratning tomoni 9 sm bo'lsa, uning yuzasi (S) qancha?", opts: ["81 sm²", "36 sm²", "72 sm²", "18 sm²"], correct: 0, exp: "Kvadrat yuzi: S = a² = 9² = 81 sm²." },
            { q: "Uchburchakning ichki burchaklari yig'indisi necha gradusga teng?", opts: ["180°", "360°", "90°", "270°"], correct: 0, exp: "Har qanday uchburchakning ichki burchaklari yig'indisi 180° ga teng." },
            { q: "Sonning 25 foizi 50 ga teng bo'lsa, bu sonning o'zi nechaga teng?", opts: ["200", "150", "250", "100"], correct: 0, exp: "50 / 0.25 = 200." },
            { q: "(-4) * (-7) ko'paytmaning qiymatini hisoblang.", opts: ["28", "-28", "24", "-11"], correct: 0, exp: "Ikkita manfiy son ko'paytmasi musbat bo'ladi: (-4)*(-7) = 28." },
            { q: "To'g'ri burchakli uchburchakda gipotenuza c² = a² + b² qaysi teorema?", opts: ["Pifagor teoremasi", "Fales teoremasi", "Viyet teoremasi", "Nyuton qonuni"], correct: 0, exp: "Pifagor teoremasi to'g'ri burchakli uchburchak tomonlarini ifodalaydi." },
            { q: "3/4 + 1/2 kasrlarni qo'shing.", opts: ["5/4 (1.25)", "4/6", "1", "3/8"], correct: 0, exp: "3/4 + 2/4 = 5/4 = 1.25." },
            { q: "5 ning 3-darajasi (5³) nechaga teng?", opts: ["125", "15", "75", "25"], correct: 0, exp: "5 * 5 * 5 = 125." },
            { q: "Doiraning yuzini topish formulasi qaysi?", opts: ["S = π * r²", "S = 2 * π * r", "S = a * b", "S = 4 * π * r"], correct: 0, exp: "Doira yuzi radiusi orqali S = π*r² deb hisoblanadi." },
            { q: "Ketma-ket kelgan 3 ta natural sonning yig'indisi 36 bo'lsa, o'rtadagi sonni toping.", opts: ["12", "11", "13", "10"], correct: 0, exp: "(x-1) + x + (x+1) = 3x = 36 => x = 12." }
        ]
    },
    english: {
        title: "Ingliz Tili (English Grammar B1)",
        classBadge: "5-11 Sinf",
        subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov",
        durationMinutes: 15,
        questions: [
            { q: "She ___ to school every day by bus.", opts: ["goes", "go", "going", "gone"], correct: 0, exp: "Present Simple third person singular: She goes." },
            { q: "Yesterday, we ___ a very interesting museum in Tashkent.", opts: ["visited", "visit", "visiting", "have visited"], correct: 0, exp: "Past Simple indicator 'yesterday' requires past verb: visited." },
            { q: "What is the opposite of the word 'Generous'?", opts: ["Mean / Stingy", "Polite", "Brave", "Honest"], correct: 0, exp: "'Generous' (saxiy) ning teskarisi 'Mean' (xasis)." },
            { q: "I have lived in Guliston ___ 2018.", opts: ["since", "for", "in", "during"], correct: 0, exp: "Aniq boshlanish yili uchun 'since 2018' ishlatiladi." },
            { q: "If it rains tomorrow, we ___ at home.", opts: ["will stay", "stayed", "staying", "had stayed"], correct: 0, exp: "First Conditional: If + Present Simple, will + base verb." },
            { q: "This is the boy ___ won the school mathematics olympiad.", opts: ["who", "which", "whose", "where"], correct: 0, exp: "Insonlar uchun bog'lovchi olmosh: 'who'." },
            { q: "Mount Everest is ___ mountain in the world.", opts: ["the highest", "higher", "highest", "more high"], correct: 0, exp: "Superlative degree: 'the highest'." },
            { q: "They ___ English for 3 years now.", opts: ["have been learning", "learn", "learned", "are learn"], correct: 0, exp: "Davom etayotgan harakat: Present Perfect Continuous." },
            { q: "Choose the correct preposition: 'He is interested ___ science and IT.'", opts: ["in", "at", "on", "for"], correct: 0, exp: "'Interested in' doim 'in' predlogi bilan ishlatiladi." },
            { q: "Which word is a synonym for 'Huge'?", opts: ["Enormous", "Tiny", "Weak", "Narrow"], correct: 0, exp: "'Huge' va 'Enormous' ikkalasi ham 'ulkan, ulug'vor' degani." }
        ]
    },
    onatili: {
        title: "Ona Tili va Imlo Savodxonligi",
        classBadge: "5-9 Sinf",
        subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov",
        durationMinutes: 15,
        questions: [
            { q: "O'zbek tilida nechta unli tovush va nechta unli harf bor?", opts: ["6 ta tovush, 6 ta harf", "10 ta tovush, 8 ta harf", "7 ta tovush, 6 ta harf", "5 ta tovush, 5 ta harf"], correct: 0, exp: "O'zbek tilida 6 ta unli tovush (a, o, i, u, o', e) mavjud." },
            { q: "Qaysi so'z imlo qoidasiga ko'ra to'g'ri yozilgan?", opts: ["Mutaxassis", "Mutaxasis", "Muttaxassis", "Mutahasiss"], correct: 0, exp: "To'g'ri yozilishi: 'Mutaxassis'." },
            { q: "O'zbek tiliga davlat tili maqomi qachon berilgan?", opts: ["1989-yil 21-oktabr", "1991-yil 1-sentabr", "1992-yil 8-dekabr", "1993-yil 2-iyul"], correct: 0, exp: "1989-yil 21-oktabrda 'Davlat tili haqida'gi Qonun qabul qilingan." },
            { q: "'Baland' so'zining antonimi (zid ma'nolisi) qaysi?", opts: ["Past", "Keng", "Uzun", "Qisqa"], correct: 0, exp: "Baland so'ziga zid so'z: 'Past'." },
            { q: "Harakatning bajaruvchisini bildiruvchi bosh bo'lak nima deyiladi?", opts: ["Ega", "Kesim", "To'ldiruvchi", "Hol"], correct: 0, exp: "Gapda kim? nima? so'rog'iga javob bo'lib harakat egasini bildiruvchi bo'lak - Ega." },
            { q: "'Xushfe'l' so'zidagi tutuq belgisi (') qanday vazifani bajaradi?", opts: ["Tovushni ajratib, pauza bilan talaffuz qilish", "Unlini cho'zish", "Urg'uni ko'rsatish", "Bo'g'in ajratish"], correct: 0, exp: "Undoshdan keyingi tutuq belgisi tovushlar orasida kichik to'xtam (pauza) hosil qiladi." },
            { q: "Alisher Navoiy qalamiga mansub besh doston to'plami nima deb ataladi?", opts: ["Xamsa", "Devoni Foniy", "Lison ut-tayr", "Mahbub ul-qulub"], correct: 0, exp: "Alisher Navoiyning shoh asari 'Xamsa' (Beshlik) dostonlar to'plamidir." },
            { q: "Fe'lning qaysi zamoni harakatning hozir sodir bo'layotganini bildiradi?", opts: ["Hozirgi zamon", "O'tgan zamon", "Kelasi zamon", "Shart mayli"], correct: 0, exp: "Hozirgi zamon fe'li ayni vaqtda bajarilayotgan ish-harakatni bildiradi." },
            { q: "'Oq ko'ngil' qanday ma'noni ifodalaydi?", opts: ["Samimiy, beg'ubor inson", "Jahldor", "Bevafo", "Qo'rqoq"], correct: 0, exp: "Oq ko'ngil iborasi sof, mehribon va samimiy kishilarga nisbatan aytiladi." },
            { q: "Ravish so'z turkumi qanday so'roqlarga javob bo'ladi?", opts: ["Qanday? Qay darajada? Qachon? Qayerda?", "Kim? Nima?", "Nechta? Nechanchi?", "Nima qildi? Nima qilyapti?"], correct: 0, exp: "Ravish harakatning belgisini, paytini, o'rnini bildiradi." }
        ]
    },
    it: {
        title: "Informatika va IT Savodxonlik",
        classBadge: "7-11 Sinf",
        subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov",
        durationMinutes: 15,
        questions: [
            { q: "Kompyuterning asosiy 'miyasi' va hisoblash markazi nima?", opts: ["Protsessor (CPU)", "Operativ xotira (RAM)", "Qattiq disk (SSD/HDD)", "Videokarta (GPU)"], correct: 0, exp: "CPU (Central Processing Unit) barcha hisoblash amallarini bajaradi." },
            { q: "1 Megabayt (MB) necha Kilobaytga (KB) teng?", opts: ["1024 KB", "1000 KB", "512 KB", "2048 KB"], correct: 0, exp: "Informatikada axborot o'lchov birligi 2 ning darajasi: 1 MB = 1024 KB." },
            { q: "Python dasturlash tilida ekranga ma'lumot chiqarish buyrug'i qaysi?", opts: ["print()", "echo()", "console.log()", "display()"], correct: 0, exp: "Python dasturlash tilida standart chiqarish funksiyasi print() hisoblanadi." },
            { q: "Axborot xavfsizligida murakkab parolda nimalar bo'lishi shart?", opts: ["Katta-kichik harflar, raqamlar va maxsus belgilar", "Faqat tug'ilgan yil", "Faqat 123456", "Faqat ism"], correct: 0, exp: "Xavfsiz parol kamida 8 ta belgidan iborat bo'lib, harf, raqam va maxsus belgilarni o'z ichiga oladi." },
            { q: "Veb-saytlarning ko'rinishi va dizaynini bezash uchun qaysi texnologiya ishlatiladi?", opts: ["CSS", "HTML", "SQL", "C++"], correct: 0, exp: "CSS (Cascading Style Sheets) veb-sahifalar dizayni va stillari uchun ishlatiladi." },
            { q: "Fayl kengaytmasi '.docx' bo'lgan fayl qaysi dasturda ochiladi?", opts: ["Microsoft Word", "Microsoft Excel", "Adobe Photoshop", "VLC Player"], correct: 0, exp: ".docx formati matnli hujjatlar (Word) dasturiga tegishli." },
            { q: "Algoritm nima?", opts: ["Maqsadga erishish uchun bajariladigan aniq ko'rsatmalar ketma-ketligi", "Kompyuter monitori", "Internet tezligi", "O'yin dasturi"], correct: 0, exp: "Algoritm — berilgan vazifani bajarish uchun buyruqlarning qat'iy tartibli ketma-ketligi." },
            { q: "Elektron jadvallar bilan ishlash uchun eng mashhur dastur qaysi?", opts: ["Microsoft Excel", "Paint", "Notepad", "PowerPoint"], correct: 0, exp: "Microsoft Excel jadvallar, formulalar va diagrammalar bilan ishlash dasturidir." },
            { q: "HTML qisqartmasining to'liq ma'nosi nima?", opts: ["HyperText Markup Language", "High Transfer Machine Link", "Hyper Tool Multi Language", "Home Text Make Link"], correct: 0, exp: "HTML — HyperText Markup Language (gipermatnli belgilash tili)." },
            { q: "Internet brauzerlariga misol keltiring:", opts: ["Google Chrome, Mozilla Firefox, Microsoft Edge", "Windows, Linux, macOS", "Word, Excel, Access", "Photoshop, CorelDraw"], correct: 0, exp: "Chrome, Firefox va Edge internet sahifalarini ochuvchi veb-brauzerlardir." }
        ]
    },
    history: {
        title: "O'zbekiston Tarixi & Madaniyati",
        classBadge: "6-11 Sinf",
        subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov",
        durationMinutes: 15,
        questions: [
            { q: "Sohibqiron Amir Temur qaysi yili tavallud topgan?", opts: ["1336-yil 9-aprel", "1340-yil 1-may", "1370-yil 10-aprel", "1405-yil 18-fevral"], correct: 0, exp: "Amir Temur 1336-yil 9-aprelda Kesh (Shahrisabz) yaqinidagi Xo'ja Ilg'or qishlog'ida tug'ilgan." },
            { q: "Amir Temurning mashhur shiori qanday bo'lgan?", opts: ["Kuch — adolatdadir!", "Ilm — najotdir!", "G'alaba — birdamlikda!", "Tinchlik — boylikdir!"], correct: 0, exp: "Sohibqiron Amir Temur saltanatining bosh tamoyili 'Kuch — adolatdadir' bo'lgan." },
            { q: "Tibbiyot ilmining sultoni, 'Tib qonunlari' asari muallifi kim?", opts: ["Abu Ali ibn Sino (Avitsenna)", "Abu Rayhon Beruniy", "Al-Xorazmiy", "Mirzo Ulug'bek"], correct: 0, exp: "Abu Ali ibn Sino butun jahonga mashhur 'Al-Qonun fit-tibb' asari muallifidir." },
            { q: "Algebra faniga asos solgan buyuk alloma kim?", opts: ["Muhammad al-Xorazmiy", "Ahmad Farg'oniy", "Ibn Sino", "Zahiriddin Muhammad Bobur"], correct: 0, exp: "Al-Xorazmiy 'Al-Jabr' asari bilan matematika va algebra faniga asos solgan." },
            { q: "Samarqandda yirik rasadxona (observatoriya) qurdirgan astronom-hukmdor kim?", opts: ["Mirzo Ulug'bek", "Shohruh Mirzo", "Amir Temur", "Husayn Boyqaro"], correct: 0, exp: "Mirzo Ulug'bek Samarqandda rasadxona qurib, 1018 ta yulduz jadvalini tuzgan." },
            { q: "'Boburnoma' asarining muallifi va Boburiylar saltanati asoschisi kim?", opts: ["Zahiriddin Muhammad Bobur", "Kamolidin Behzod", "Abdulla Qodiriy", "Munis Xorazmiy"], correct: 0, exp: "Zahiriddin Muhammad Bobur 'Boburnoma' memuar asarining muallifidir." },
            { q: "O'zbekiston Respublikasi Davlat Mustaqilligi qachon e'lon qilingan?", opts: ["1991-yil 31-avgust (1-sentabr)", "1992-yil 8-dekabr", "1990-yil 20-iyun", "1989-yil 21-oktabr"], correct: 0, exp: "1991-yil 31-avgustda O'zbekiston Respublikasining davlat mustaqilligi e'lon qilingan." },
            { q: "Qadimgi Buyuk Ipak Yo'li qaysi qit'alarni bog'lab turgan?", opts: ["Osiyo va Yevropa", "Afrika va Amerika", "Avstraliya va Osiyo", "Yevropa va Amerika"], correct: 0, exp: "Buyuk Ipak Yo'li Sharq (Xitoy, Markaziy Osiyo) va G'arb (Yevropa) savdo yo'li bo'lgan." },
            { q: "O'zbekiston Respublikasi Konstitutsiyasi qachon qabul qilingan?", opts: ["1992-yil 8-dekabr", "1991-yil 1-sentabr", "1993-yil 2-iyul", "1994-yil 1-iyul"], correct: 0, exp: "O'zbekiston Respublikasining birinchi Konstitutsiyasi 1992-yil 8-dekabrda qabul qilingan." },
            { q: "Sirdaryo viloyati markazi qaysi shahar?", opts: ["Guliston", "Yangiyer", "Shirin", "Boyovut"], correct: 0, exp: "Sirdaryo viloyatining ma'muriy markazi Guliston shahridir." }
        ]
    },
    primary: {
        title: "Boshlang'ich Bilimdon Testi (1-4 Sinf)",
        classBadge: "1-4 Sinf",
        subtitle: "10 ta savol • 15 daqiqa • Sertifikatli sinov",
        durationMinutes: 15,
        questions: [
            { q: "Bir yilda nechta fasl va nechta oy bor?", opts: ["4 fasl, 12 oy", "3 fasl, 10 oy", "4 fasl, 10 oy", "2 fasl, 12 oy"], correct: 0, exp: "Bir yilda 4 fasl (Bahor, Yoz, Kuz, Qish) va 12 oy bor." },
            { q: "7 ga 8 ni qo'shsak necha bo'ladi?", opts: ["15", "14", "16", "13"], correct: 0, exp: "7 + 8 = 15." },
            { q: "O'zbekiston Respublikasi Davlat bayrog'ida nechta yulduz tasvirlangan?", opts: ["12 ta", "10 ta", "14 ta", "8 ta"], correct: 0, exp: "Bayrog'imizda 12 ta yulduz va yarim oy tasvirlangan." },
            { q: "Quyosh qaysi tomondan chiqadi?", opts: ["Sharqdan", "G'arbdan", "Shimoldan", "Janubdan"], correct: 0, exp: "Quyosh har kuni Sharqdan chiqadi va G'arbga botadi." },
            { q: "Daraxt barglari kuzda qanday rangga kiradi?", opts: ["Sariq va qizil", "Moviy va ko'k", "Qora va kulrang", "Oq"], correct: 0, exp: "Kuz faslida barglar xazon bo'lib sarg'ayadi." },
            { q: "5 * 6 ko'paytirish jadvali natijasi nechaga teng?", opts: ["30", "25", "35", "36"], correct: 0, exp: "5 * 6 = 30." },
            { q: "Eng kichik ikki xonali son qaysi?", opts: ["10", "1", "11", "99"], correct: 0, exp: "Eng kichik 2 xonali son — 10." },
            { q: "Qaysi faslda Qorboqir (qor) yog'adi?", opts: ["Qish", "Bahor", "Yoz", "Kuz"], correct: 0, exp: "Qor va qattiq sovuq qish faslida bo'ladi." },
            { q: "Kitob o'qish inson uchun nima beradi?", opts: ["Katta bilim va aql-zakovat", "Uyqu", "Charchoq", "Hech narsa"], correct: 0, exp: "Kitob — bilim manbayi bo'lib, tafakkurni o'stiradi." },
            { q: "1 metrda necha santimetr bor?", opts: ["100 sm", "10 sm", "1000 sm", "50 sm"], correct: 0, exp: "1 metr = 100 santimetrga teng." }
        ]
    }
};

// Exam State
let currentExamSubjectKey = 'math';
let currentExamData = null;
let currentExamQIndex = 0;
let userExamAnswers = {};
let examTimerInterval = null;
let examSecondsRemaining = 900;
let examStudentInfo = { name: "O'quvchi", classVal: "7-A" };

function startTestExam(subjectKey) {
    currentExamSubjectKey = subjectKey;
    currentExamData = examDatabase[subjectKey] || examDatabase['math'];
    userExamAnswers = {};
    currentExamQIndex = 0;

    // Reset views
    document.getElementById('examSubjectTitle').innerText = currentExamData.title;
    document.getElementById('examSubjectSubtitle').innerText = currentExamData.subtitle;
    document.getElementById('examPreView')?.classList.remove('hidden');
    document.getElementById('examActiveView')?.classList.add('hidden');
    document.getElementById('examResultView')?.classList.add('hidden');
    document.getElementById('examReviewContainer')?.classList.add('hidden');

    openModal('testExamModal');
}

function confirmStartExam() {
    const nameInput = document.getElementById('examStudentName')?.value.trim();
    const classInput = document.getElementById('examStudentClass')?.value || '7-A';

    if (!nameInput) {
        showToast("Iltimos, ism-familiyangizni kiriting!", "info");
        document.getElementById('examStudentName')?.focus();
        return;
    }

    examStudentInfo = { name: nameInput, classVal: classInput };

    document.getElementById('examActiveStudentName').innerText = nameInput;
    document.getElementById('examActiveStudentClass').innerText = classInput;

    document.getElementById('examPreView')?.classList.add('hidden');
    document.getElementById('examActiveView')?.classList.remove('hidden');

    // Init timer (15 min = 900s)
    examSecondsRemaining = currentExamData.durationMinutes * 60;
    updateExamTimerDisplay();
    clearInterval(examTimerInterval);
    examTimerInterval = setInterval(() => {
        examSecondsRemaining--;
        updateExamTimerDisplay();
        if (examSecondsRemaining <= 0) {
            clearInterval(examTimerInterval);
            showToast("Vaqt tugadi! Test avtomatik yakunlandi.", "info");
            finishTestExam(false);
        }
    }, 1000);

    renderExamNavigator();
    renderExamQuestion(0);
}

function updateExamTimerDisplay() {
    const m = Math.floor(examSecondsRemaining / 60).toString().padStart(2, '0');
    const s = (examSecondsRemaining % 60).toString().padStart(2, '0');
    const el = document.getElementById('examTimerDisplay');
    if (el) el.innerText = `${m}:${s}`;
}

function renderExamNavigator() {
    const nav = document.getElementById('examQNavigator');
    if (!nav) return;

    nav.innerHTML = currentExamData.questions.map((q, idx) => `
        <button class="q-nav-dot ${idx === currentExamQIndex ? 'current' : ''} ${userExamAnswers[idx] !== undefined ? 'answered' : ''}" id="qNavDot-${idx}" onclick="jumpToExamQuestion(${idx})">
            ${idx + 1}
        </button>
    `).join('');
}

function renderExamQuestion(index) {
    currentExamQIndex = index;
    const q = currentExamData.questions[index];
    if (!q) return;

    document.getElementById('examProgressFraction').innerText = `${index + 1} / ${currentExamData.questions.length}`;
    document.getElementById('examQText').innerText = `${index + 1}. ${q.q}`;

    // Update buttons
    const btnPrev = document.getElementById('btnPrevQ');
    const btnNext = document.getElementById('btnNextQ');
    if (btnPrev) btnPrev.disabled = (index === 0);
    if (btnNext) {
        if (index === currentExamData.questions.length - 1) {
            btnNext.innerHTML = `<i class="fa-solid fa-flag-checkered"></i> Testni Yakunlash`;
            btnNext.onclick = () => finishTestExam(true);
        } else {
            btnNext.innerHTML = `Keyingi <i class="fa-solid fa-arrow-right"></i>`;
            btnNext.onclick = () => navigateExamQuestion(1);
        }
    }

    // Render Options
    const stack = document.getElementById('examOptionsStack');
    if (stack) {
        stack.innerHTML = q.opts.map((opt, optIdx) => {
            const isSelected = userExamAnswers[index] === optIdx;
            const letter = String.fromCharCode(65 + optIdx);
            return `
                <div class="exam-option-card ${isSelected ? 'selected' : ''}" onclick="selectExamOption(${optIdx})">
                    <span class="opt-letter">${letter}</span>
                    <span class="opt-text">${escapeHtml(opt)}</span>
                </div>
            `;
        }).join('');
    }

    // Update nav dots highlight
    document.querySelectorAll('.q-nav-dot').forEach((dot, dIdx) => {
        dot.classList.toggle('current', dIdx === index);
        dot.classList.toggle('answered', userExamAnswers[dIdx] !== undefined);
    });
}

function selectExamOption(optIndex) {
    userExamAnswers[currentExamQIndex] = optIndex;
    renderExamQuestion(currentExamQIndex);

    // Auto advance if not last
    if (currentExamQIndex < currentExamData.questions.length - 1) {
        setTimeout(() => {
            navigateExamQuestion(1);
        }, 220);
    }
}

function navigateExamQuestion(delta) {
    const nextIdx = currentExamQIndex + delta;
    if (nextIdx >= 0 && nextIdx < currentExamData.questions.length) {
        renderExamQuestion(nextIdx);
    }
}

function jumpToExamQuestion(index) {
    renderExamQuestion(index);
}

function finishTestExam(manual = true) {
    if (manual) {
        const answeredCount = Object.keys(userExamAnswers).length;
        const total = currentExamData.questions.length;
        if (answeredCount < total) {
            if (!confirm(`Siz ${total} ta savoldan ${answeredCount} tasiga javob berdingiz. Testni yakunlaysizmi?`)) {
                return;
            }
        }
    }

    clearInterval(examTimerInterval);

    // Calculate score
    let correctCount = 0;
    currentExamData.questions.forEach((q, idx) => {
        if (userExamAnswers[idx] === q.correct) {
            correctCount++;
        }
    });

    const totalQuestions = currentExamData.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const randomCertId = Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toLocaleDateString('uz-UZ');

    let gradeLevel = "A'lochi (5 baho)";
    if (percentage < 60) gradeLevel = "Qoniqarli (3 baho)";
    else if (percentage < 85) gradeLevel = "Yaxshi (4 baho)";

    // Fill Certificate
    document.getElementById('certStudentName').innerText = `${examStudentInfo.name} (${examStudentInfo.classVal})`;
    document.getElementById('certSubjectName').innerText = currentExamData.title;
    document.getElementById('certScoreText').innerText = `${correctCount} / ${totalQuestions} (${percentage}%)`;
    document.getElementById('certGradeLevel').innerText = `Daraja: ${gradeLevel}`;
    document.getElementById('certIdNum').innerText = randomCertId;

    // Fill Review List
    const reviewList = document.getElementById('examReviewList');
    if (reviewList) {
        reviewList.innerHTML = currentExamData.questions.map((q, idx) => {
            const userChoice = userExamAnswers[idx];
            const isCorrect = (userChoice === q.correct);
            const userChoiceText = userChoice !== undefined ? q.opts[userChoice] : "Javob berilmagan";
            const correctText = q.opts[q.correct];

            return `
                <div class="admin-msg-card mb-2" style="border-left: 4px solid ${isCorrect ? '#10b981' : '#ef4444'};">
                    <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                        <strong>${idx + 1}. ${escapeHtml(q.q)}</strong>
                        <span class="${isCorrect ? 'status-badge-approved' : 'status-badge-pending'}">${isCorrect ? '✓ To\'g\'ri (+1)' : '✗ Noto\'g\'ri (0)'}</span>
                    </div>
                    <p style="font-size:0.85rem; margin-bottom:0.25rem;">
                        Sizning javobingiz: <strong style="color: ${isCorrect ? '#10b981' : '#ef4444'}">${escapeHtml(userChoiceText)}</strong>
                    </p>
                    ${!isCorrect ? `<p style="font-size:0.85rem; color:#10b981;">To'g'ri javob: <strong>${escapeHtml(correctText)}</strong></p>` : ''}
                    <small style="color: var(--text-muted); display:block; margin-top:0.25rem;">💡 Izoh: ${escapeHtml(q.exp)}</small>
                </div>
            `;
        }).join('');
    }

    document.getElementById('examActiveView')?.classList.add('hidden');
    document.getElementById('examResultView')?.classList.remove('hidden');

    showToast(`🎉 Test yakunlandi! Natijangiz: ${correctCount}/${totalQuestions} (${percentage}%)`, "success");
}

function toggleExamReview() {
    const rev = document.getElementById('examReviewContainer');
    if (rev) {
        rev.classList.toggle('hidden');
    }
}

function printTestCertificate() {
    window.print();
}

function closeExamModal() {
    clearInterval(examTimerInterval);
    closeModal('testExamModal');
}

/* ==========================================================================
   8. ONLAYN SPRAVKA (SCHOOL CERTIFICATE) GENERATOR
   ========================================================================== */
function openSpravkaModal() {
    const form = document.getElementById('spravkaForm');
    const resultBox = document.getElementById('spravkaResultBox');
    if (form) {
        form.reset();
        form.classList.remove('hidden');
    }
    if (resultBox) resultBox.classList.add('hidden');
    openModal('spravkaModal');
}

function handleGenerateSpravka(e) {
    e.preventDefault();
    const name = document.getElementById('spravkaStudentName')?.value.trim() || 'O\'quvchi';
    const classVal = document.getElementById('spravkaClass')?.value || '7-A';
    const purpose = document.getElementById('spravkaPurpose')?.value.trim() || 'Talab qilingan joyga';

    const randomId = Math.floor(1000 + Math.random() * 9000);
    const today = new Date().toLocaleDateString('uz-UZ');

    document.getElementById('spravkaIdNum').innerText = randomId;
    document.getElementById('spravkaDateDisplay').innerText = today;
    document.getElementById('spravkaStudentResult').innerText = name;
    document.getElementById('spravkaClassResult').innerText = `${classVal} sinf`;
    document.getElementById('spravkaPurposeResult').innerText = purpose;

    document.getElementById('spravkaForm')?.classList.add('hidden');
    document.getElementById('spravkaResultBox')?.classList.remove('hidden');

    showToast("🎉 Rasmiy elektron ma'lumotnoma (Spravka) shakllantirildi!", "success");
}

function openGpaModal() {
    openModal('gpaModal');
}

/* ==========================================================================
   9. GULISTON 1-MAKTAB DARS JADVALI DATABASE
   ========================================================================== */
const timetableDatabase = {
    "1-A": {
        1: [
            { num: 1, time: "08:00 - 08:45", name: "Alifbe & Savodxonlik", teacher: "Muqaddas Jo'rayeva", room: "101-xona", icon: "fa-book-open" },
            { num: 2, time: "08:50 - 09:35", name: "Matematika", teacher: "Muqaddas Jo'rayeva", room: "101-xona", icon: "fa-calculator" },
            { num: 3, time: "09:50 - 10:35", name: "Tasviriy San'at", teacher: "Muqaddas Jo'rayeva", room: "101-xona", icon: "fa-palette" },
            { num: 4, time: "10:40 - 11:25", name: "Jismoniy Tarbiya", teacher: "Jismoniy tarbiya ustozi", room: "Sport zal", icon: "fa-futbol" }
        ],
        2: [
            { num: 1, time: "08:00 - 08:45", name: "O'qish Savodxonligi", teacher: "Muqaddas Jo'rayeva", room: "101-xona", icon: "fa-book" },
            { num: 2, time: "08:50 - 09:35", name: "Matematika", teacher: "Muqaddas Jo'rayeva", room: "101-xona", icon: "fa-calculator" },
            { num: 3, time: "09:50 - 10:35", name: "Tabiiy Fan (Science)", teacher: "Muqaddas Jo'rayeva", room: "101-xona", icon: "fa-leaf" }
        ]
    },
    "7-A": {
        1: [
            { num: 1, time: "08:00 - 08:45", name: "Matematika (Algebra)", teacher: "Sanobar Ergasheva", room: "204-xona", icon: "fa-calculator" },
            { num: 2, time: "08:50 - 09:35", name: "Ona Tili", teacher: "Botir Normurodov", room: "105-xona", icon: "fa-book-open" },
            { num: 3, time: "09:50 - 10:35", name: "Ingliz Tili", teacher: "Nodira Abdullayeva", room: "201-xona", icon: "fa-globe" },
            { num: 4, time: "10:40 - 11:25", name: "Fizika", teacher: "Fizika ustozi", room: "Fizika Lab", icon: "fa-bolt" },
            { num: 5, time: "11:35 - 12:20", name: "O'zbekiston Tarixi", teacher: "Tarix ustozi", room: "112-xona", icon: "fa-landmark" }
        ],
        2: [
            { num: 1, time: "08:00 - 08:45", name: "Geometriya", teacher: "Sanobar Ergasheva", room: "204-xona", icon: "fa-shapes" },
            { num: 2, time: "08:50 - 09:35", name: "Adabiyot", teacher: "Botir Normurodov", room: "105-xona", icon: "fa-book" },
            { num: 3, time: "09:50 - 10:35", name: "Informatika (e-Maktab)", teacher: "Informatika ustozi", room: "Kompyuter xonasi", icon: "fa-laptop-code" },
            { num: 4, time: "10:40 - 11:25", name: "Biologiya", teacher: "Biologiya ustozi", room: "215-xona", icon: "fa-leaf" }
        ]
    }
};

let currentSelectedDay = 1;

function initTimetable() {
    renderTimetable();
}

function selectDay(dayNum) {
    currentSelectedDay = dayNum;
    document.querySelectorAll('.day-btn').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.getAttribute('data-day')) === dayNum);
    });
    renderTimetable();
}

function switchTimetableMode(mode) {
    const tabLessons = document.getElementById('tabLessons');
    const tabBells = document.getElementById('tabBells');
    const classPickerWrap = document.getElementById('classPickerWrap');
    const daysBar = document.getElementById('daysBar');
    const lessonsContainer = document.getElementById('lessonsContainer');
    const bellsContainer = document.getElementById('bellsContainer');

    if (mode === 'lessons') {
        tabLessons?.classList.add('active');
        tabBells?.classList.remove('active');
        classPickerWrap?.classList.remove('hidden');
        daysBar?.classList.remove('hidden');
        lessonsContainer?.classList.remove('hidden');
        bellsContainer?.classList.add('hidden');
    } else {
        tabLessons?.classList.remove('active');
        tabBells?.classList.add('active');
        classPickerWrap?.classList.add('hidden');
        daysBar?.classList.add('hidden');
        lessonsContainer?.classList.add('hidden');
        bellsContainer?.classList.remove('hidden');
    }
}

function renderTimetable() {
    const classSelect = document.getElementById('classSelect');
    const selectedClass = classSelect ? classSelect.value : '7-A';
    const container = document.getElementById('lessonsContainer');

    if (!container) return;

    const classData = timetableDatabase[selectedClass] || timetableDatabase['7-A'];
    const lessons = classData[currentSelectedDay] || classData[1] || [];

    if (lessons.length === 0) {
        container.innerHTML = `
            <div class="search-empty-state">
                <i class="fa-solid fa-mug-hot"></i>
                <p>Ushbu kunda darslar rejalashtirilmagan yoki dam olish kuni.</p>
            </div>
        `;
        return;
    }

    let html = '<div class="lessons-timeline">';
    lessons.forEach(l => {
        html += `
            <div class="lesson-card">
                <div class="lesson-time-badge">
                    <span>${l.num}-Dars</span>
                    <small>${l.time}</small>
                </div>
                <div class="lesson-main-info">
                    <div class="lesson-icon"><i class="fa-solid ${l.icon}"></i></div>
                    <div>
                        <div class="lesson-subject-name">${l.name}</div>
                        <div class="lesson-teacher-name"><i class="fa-solid fa-user-tie"></i> ${l.teacher}</div>
                    </div>
                </div>
                <div class="lesson-room-pill"><i class="fa-solid fa-door-open"></i> ${l.room}</div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

/* ==========================================================================
   10. TEACHERS FILTER & DETAILS
   ========================================================================== */
function initTeachersFilter() {
    const filterBtns = document.querySelectorAll('.filter-buttons-wrapper .filter-btn');
    const teacherCards = document.querySelectorAll('.teachers-grid .teacher-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');
            teacherCards.forEach(card => {
                if (filter === 'all' || card.getAttribute('data-category') === filter) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function showTeacherDetails(name, role, bio, email, hours) {
    document.getElementById('tModalName').innerText = name;
    document.getElementById('tModalRole').innerText = role;
    document.getElementById('tModalBio').innerText = bio;
    document.getElementById('tModalEmail').innerText = email;
    document.getElementById('tModalHours').innerText = hours;
    openModal('teacherModal');
}

/* ==========================================================================
   11. GPA & BAHOLAR KALKULYATORI
   ========================================================================== */
function addGradeRow() {
    const container = document.getElementById('gradeInputsContainer');
    if (!container) return;

    const row = document.createElement('div');
    row.className = 'grade-row';
    row.style.display = 'flex';
    row.style.gap = '0.5rem';
    row.style.marginBottom = '0.5rem';
    row.innerHTML = `
        <input type="text" class="form-input subject-name" placeholder="Fan nomi" value="Yangi Fan">
        <select class="form-select grade-val">
            <option value="5" selected>5 (A'lo)</option>
            <option value="4">4 (Yaxshi)</option>
            <option value="3">3 (Qoniqarli)</option>
            <option value="2">2 (Qoniqarsiz)</option>
        </select>
        <button class="btn-remove-row btn btn-danger-sm" onclick="removeGradeRow(this)" title="O'chirish"><i class="fa-solid fa-trash"></i></button>
    `;
    container.appendChild(row);
}

function removeGradeRow(btn) {
    const row = btn.closest('.grade-row');
    const container = document.getElementById('gradeInputsContainer');
    if (container && container.querySelectorAll('.grade-row').length > 1) {
        row.remove();
        calculateGPA();
    } else {
        showToast("Kamida bitta fan qolishi shart!", "info");
    }
}

function calculateGPA() {
    const gradeSelects = document.querySelectorAll('#gradeInputsContainer .grade-val');
    if (gradeSelects.length === 0) return;

    let total = 0;
    gradeSelects.forEach(select => {
        total += parseInt(select.value, 10);
    });

    const avg = (total / gradeSelects.length).toFixed(2);
    const scoreNum = document.getElementById('calcScoreNum');
    const statusBadge = document.getElementById('calcStatusBadge');

    if (scoreNum) scoreNum.innerText = avg;

    if (statusBadge) {
        if (avg >= 4.5) {
            statusBadge.innerHTML = `<i class="fa-solid fa-award text-gold"></i> <strong class="text-success">A'lochi o'quvchi darajasi (GPA: ${avg})</strong>`;
        } else if (avg >= 3.5) {
            statusBadge.innerHTML = `<i class="fa-solid fa-star text-gold"></i> <strong class="text-cyan">Yaxshi o'zlashtiruvchi daraja (GPA: ${avg})</strong>`;
        } else {
            statusBadge.innerHTML = `<i class="fa-solid fa-book-open-reader text-warning"></i> <strong class="text-warning">Ko'proq dars qilish tavsiya etiladi (GPA: ${avg})</strong>`;
        }
    }
}

/* ==========================================================================
   12. ACCORDION (FAQ) SYSTEM
   ========================================================================== */
function initAccordion() {
    const items = document.querySelectorAll('.accordion-item');
    items.forEach(item => {
        const header = item.querySelector('.accordion-header');
        if (header) {
            header.addEventListener('click', () => {
                const wasActive = item.classList.contains('active');
                items.forEach(i => i.classList.remove('active'));
                if (!wasActive) {
                    item.classList.add('active');
                }
            });
        }
    });
}

/* ==========================================================================
   13. CONTACT FORM & SUBMISSIONS
   ========================================================================== */
function handleContactSubmit(e) {
    if (e) e.preventDefault();
    const name = document.getElementById('cName')?.value.trim();
    const phone = document.getElementById('cPhone')?.value.trim();
    const topic = document.getElementById('cTopic')?.value || 'Taklif / Savol';
    const msg = document.getElementById('cMessage')?.value.trim();

    if (!name || !phone || !msg) return;

    schoolMessages.unshift({
        id: schoolMessages.length + 1,
        name: name,
        phone: phone,
        topic: topic,
        text: msg,
        date: new Date().toLocaleDateString('uz-UZ')
    });

    renderAdminMessages();

    document.getElementById('contactForm')?.reset();
    showToast("🎉 Murojaatingiz maktab ma'muriyatiga muvaffaqiyatli yuborildi!", "success");
}

/* ==========================================================================
   14. ADMISSION (QABUL) MULTI-STEP MODAL
   ========================================================================== */
let currentAdmissionStep = 1;

function openAdmissionModal() {
    currentAdmissionStep = 1;
    goToStep(1);
    const form = document.getElementById('admissionForm');
    const voucher = document.getElementById('voucherWrap');
    if (form) {
        form.reset();
        form.classList.remove('hidden');
    }
    if (voucher) voucher.classList.add('hidden');
    openModal('admissionModal');
}

function goToStep(step) {
    currentAdmissionStep = step;
    document.querySelectorAll('.form-step').forEach((el, index) => {
        el.classList.toggle('active', index + 1 === step);
    });

    document.querySelectorAll('.step-dot').forEach((dot, index) => {
        dot.classList.toggle('active', index + 1 === step);
    });
}

function handleAdmissionSubmit(e) {
    e.preventDefault();
    const studentName = document.getElementById('studentFullName')?.value.trim() || "O'quvchi";
    const applyClass = document.getElementById('applyClass')?.value || "1";
    const parentName = document.getElementById('parentName')?.value.trim() || "Ota-ona";
    const parentPhone = document.getElementById('parentPhone')?.value.trim() || "+998 (90) 123-45-67";
    const address = document.getElementById('studentAddress')?.value.trim() || "Guliston sh.";

    const randomId = `G1-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    document.getElementById('vId').innerText = randomId;
    document.getElementById('vStudentName').innerText = studentName;
    document.getElementById('vClass').innerText = `${applyClass}-sinf`;

    schoolApplications.unshift({
        id: randomId,
        student: studentName,
        classVal: `${applyClass}-sinf`,
        parent: parentName,
        phone: parentPhone,
        address: address,
        status: "Yangi (Ko'rib chiqilmoqda)"
    });

    renderAdminApplications();

    document.getElementById('admissionForm')?.classList.add('hidden');
    document.getElementById('voucherWrap')?.classList.remove('hidden');

    showToast("🎉 Qabul arizangiz muvaffaqiyatli qabul qilindi!", "success");
}

/* ==========================================================================
   15. ADMIN DASHBOARD & STATE
   ========================================================================== */
let schoolApplications = [
    { id: "G1-2026-7814", student: "Karimova Dilrabo Rustam qizi", classVal: "1-sinf", parent: "Karimov Rustam", phone: "+998 (90) 123-45-67", address: "Guliston sh., Bo'ston MFY", status: "Yangi (Ko'rib chiqilmoqda)" },
    { id: "G1-2026-6521", student: "Toshmatov Jasur Jasurbek o'g'li", classVal: "1-sinf", parent: "Toshmatova Zulfiya", phone: "+998 (91) 456-78-90", address: "Guliston sh., Markaz-3", status: "Tasdiqlandi" },
    { id: "G1-2026-4190", student: "Xolmatova Malika Farhod qizi", classVal: "5-sinf", parent: "Xolmatov Farhod", phone: "+998 (93) 890-12-34", address: "Guliston sh., Yangi hayot MFY", status: "Yangi (Ko'rib chiqilmoqda)" }
];

let schoolMessages = [
    { id: 1, name: "Aliyeva Shahnoza", phone: "+998 (90) 555-11-22", topic: "1-Sinfga Qabul", text: "Assalomu alaykum! 1-sinfga qabul bo'yicha tibbiy daftarcha qachongacha topshirilishi kerak?", date: "21.08.2026" },
    { id: 2, name: "Sobirov Otabek", phone: "+998 (97) 333-44-55", topic: "To'garaklar", text: "Maktabda shaxmat va robototexnika to'garaklari qaysi kunlarda bo'lib o'tadi?", date: "20.08.2026" }
];

function openAdminModal() {
    const modal = document.getElementById('adminModalOverlay');
    if (!modal) return;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const isLoggedIn = sessionStorage.getItem('1maktab_admin_logged') === 'true';
    if (isLoggedIn) {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }
}

function closeAdminModal() {
    const modal = document.getElementById('adminModalOverlay');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showAdminLogin() {
    document.getElementById('adminLoginBox')?.classList.remove('hidden');
    document.getElementById('adminDashboardView')?.classList.add('hidden');
}

function showAdminDashboard() {
    document.getElementById('adminLoginBox')?.classList.add('hidden');
    document.getElementById('adminDashboardView')?.classList.remove('hidden');
    renderAdminApplications();
    renderAdminMessages();
}

function handleAdminLogin(e) {
    e.preventDefault();
    const u = document.getElementById('adminUsername')?.value.trim();
    const p = document.getElementById('adminPassword')?.value.trim();

    if (u === 'admin' && p === '12345') {
        sessionStorage.setItem('1maktab_admin_logged', 'true');
        showAdminDashboard();
        showToast("Xush kelibsiz! Maktab boshqaruv paneliga muvaffaqiyatli kirdingiz.", "success");
    } else {
        showToast("Login yoki parol noto'g'ri! (Login: admin, parol: 12345)", "info");
    }
}

function handleAdminLogout() {
    sessionStorage.removeItem('1maktab_admin_logged');
    showAdminLogin();
    showToast("Tizimdan muvaffaqiyatli chiqildi.", "info");
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.dash-tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    document.querySelectorAll('.dash-tab-pane').forEach(pane => {
        pane.classList.toggle('active', pane.id === `pane-${tabName}`);
    });
}

function renderAdminApplications() {
    const overviewTable = document.getElementById('overviewAppsTable');
    const fullTable = document.getElementById('adminFullAppsTable');
    const badge = document.getElementById('dashAppBadge');
    const totalStat = document.getElementById('statTotalApps');

    if (badge) badge.innerText = schoolApplications.length;
    if (totalStat) totalStat.innerText = `${schoolApplications.length} ta`;

    if (overviewTable) {
        overviewTable.innerHTML = schoolApplications.slice(0, 4).map(app => `
            <tr>
                <td><strong>${app.id}</strong></td>
                <td>${app.student}</td>
                <td><span class="search-result-badge">${app.classVal}</span></td>
                <td>${app.address}</td>
                <td><span class="${app.status.includes('Tasdiqlandi') ? 'status-badge-approved' : 'status-badge-pending'}">${app.status}</span></td>
            </tr>
        `).join('');
    }

    if (fullTable) {
        fullTable.innerHTML = schoolApplications.map((app, index) => `
            <tr>
                <td><strong>${app.id}</strong></td>
                <td>${app.student}</td>
                <td><span class="search-result-badge">${app.classVal}</span></td>
                <td>${app.parent}</td>
                <td>${app.phone}</td>
                <td><span class="${app.status.includes('Tasdiqlandi') ? 'status-badge-approved' : 'status-badge-pending'}">${app.status}</span></td>
                <td>
                    <button class="btn btn-success-sm" onclick="approveApplication(${index})" title="Tasdiqlash"><i class="fa-solid fa-check"></i></button>
                    <button class="btn btn-danger-sm" onclick="deleteApplication(${index})" title="O'chirish"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `).join('');
    }
}

function approveApplication(index) {
    if (schoolApplications[index]) {
        schoolApplications[index].status = "Tasdiqlandi";
        renderAdminApplications();
        showToast("Ariza tasdiqlandi!", "success");
    }
}

function deleteApplication(index) {
    if (confirm("Ushbu arizani o'chirishni tasdiqlaysizmi?")) {
        schoolApplications.splice(index, 1);
        renderAdminApplications();
        showToast("Ariza o'chirildi.", "info");
    }
}

function renderAdminMessages() {
    const list = document.getElementById('adminMessagesList');
    const badge = document.getElementById('dashMsgBadge');
    const totalStat = document.getElementById('statTotalMsgs');

    if (badge) badge.innerText = schoolMessages.length;
    if (totalStat) totalStat.innerText = `${schoolMessages.length} ta`;

    if (list) {
        if (schoolMessages.length === 0) {
            list.innerHTML = `<p class="text-muted">Hozircha yangi murojaatlar yo'q.</p>`;
            return;
        }

        list.innerHTML = schoolMessages.map(msg => `
            <div class="admin-msg-card">
                <div class="admin-msg-header">
                    <div>
                        <strong><i class="fa-solid fa-user"></i> ${msg.name}</strong> • <small>${msg.phone}</small>
                    </div>
                    <span class="search-result-badge">${msg.topic}</span>
                </div>
                <p>"${escapeHtml(msg.text)}"</p>
            </div>
        `).join('');
    }
}

function handleAdminAddNews(e) {
    e.preventDefault();
    const title = document.getElementById('adminNewsTitle')?.value.trim();
    const text = document.getElementById('adminNewsText')?.value.trim();

    if (!title || !text) return;

    document.getElementById('adminNewsTitle').value = '';
    document.getElementById('adminNewsText').value = '';
    showToast("🎉 Yangi e'lon tizimga muvaffaqiyatli saqlandi!", "success");
    switchAdminTab('overview');
}

/* ==========================================================================
   16. SUPERCHARGED GULISTON 1-MAKTAB AI ASSISTANT (CHATBOT)
   ========================================================================== */
function openChatModal() {
    openModal('aiChatModal');
    setTimeout(() => {
        document.getElementById('aiInputText')?.focus();
    }, 150);
}

function clearAiChat() {
    const msgContainer = document.getElementById('aiChatMessages');
    if (!msgContainer) return;

    msgContainer.innerHTML = `
        <div class="chat-msg bot-msg">
            <div class="msg-bubble">
                Chat tarixi tozalandi! Men <strong>Guliston 1-maktab AI Yordamchisiman</strong>. Qanday ma'lumot yoki yordam kerak?
            </div>
        </div>
    `;
    showToast("Chat tarixi tozalandi.", "info");
}

function askAiQuestion(questionText) {
    const input = document.getElementById('aiInputText');
    if (input) {
        input.value = questionText;
        handleSendAiMessage(new Event('submit'));
    }
}

function handleSendAiMessage(e) {
    if (e) e.preventDefault();
    const input = document.getElementById('aiInputText');
    const msgContainer = document.getElementById('aiChatMessages');
    const text = input ? input.value.trim() : '';

    if (!text || !msgContainer) return;

    // Append User Message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-msg user-msg';
    userDiv.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
    msgContainer.appendChild(userDiv);
    input.value = '';
    msgContainer.scrollTop = msgContainer.scrollHeight;

    // Show Typing Indicator
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-msg bot-msg';
    typingDiv.id = 'aiTypingIndicator';
    typingDiv.innerHTML = `
        <div class="msg-bubble typing-bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    msgContainer.appendChild(typingDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    setTimeout(() => {
        document.getElementById('aiTypingIndicator')?.remove();

        const answerData = generateAiAnswer(text);
        const botDiv = document.createElement('div');
        botDiv.className = 'chat-msg bot-msg';

        let actionBtnsHtml = '';
        if (answerData.actions && answerData.actions.length > 0) {
            actionBtnsHtml = `<div class="ai-actions-row">` + answerData.actions.map(act => `
                <button class="ai-action-link-btn" onclick="${act.action}">
                    <i class="fa-solid ${act.icon}"></i> ${act.text}
                </button>
            `).join('') + `</div>`;
        }

        const plainTextForVoice = answerData.text.replace(/<[^>]*>?/gm, '');

        botDiv.innerHTML = `
            <div class="msg-bubble">
                ${answerData.text}
            </div>
            ${actionBtnsHtml}
            <button class="ai-voice-listen-btn" onclick="speakText('${escapeHtml(plainTextForVoice.substring(0, 180))}')">
                <i class="fa-solid fa-volume-high"></i> Ovozli eshitish
            </button>
        `;

        msgContainer.appendChild(botDiv);
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, 450);
}

function speakText(txt) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(txt);
    utterance.lang = 'uz-UZ';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
}

function generateAiAnswer(query) {
    const q = query.toLowerCase();

    // 0. Onlayn Testlar
    if (q.includes('test') || q.includes('imtihon') || q.includes('sinov') || q.includes('sertifikat')) {
        return {
            text: "Guliston 1-maktab <strong>Onlayn Test Markazi</strong>da Matematika, Ingliz tili, Ona tili, Informatika va Tarix fanlaridan 10 ta savollik test topshirib, o'z bilimingizni sinashingiz va maxsus elektron diplom-sertifikat olishingiz mumkin!",
            actions: [
                { text: "Onlayn Testlarga O'tish", action: "closeModal('aiChatModal'); location.href='#tests';", icon: "fa-list-check" }
            ]
        };
    }

    // 1. Spravka / Ma'lumotnoma
    if (q.includes('spravka') || q.includes('malumotnoma') || q.includes('hujjat olish')) {
        return {
            text: "Guliston 1-maktab o'quvchisi uchun <strong>QR-kodli rasmiy ma'lumotnoma (Spravka)</strong>ni bir zumda onlayn shakllantirishingiz mumkin. O'quvchi F.I.SH va sinfini kiritishingiz kifoya!",
            actions: [
                { text: "Spravka Olish Oynasini Ochish", action: "openSpravkaModal(); closeModal('aiChatModal');", icon: "fa-file-certificate" }
            ]
        };
    }

    // 2. Qabul va 1-sinf
    if (q.includes('1-sinf') || q.includes('qabul') || q.includes('ariza') || q.includes('hujjat')) {
        return {
            text: "<strong>Guliston 1-maktabga 1-sinfga qabul uchun kerakli hujjatlar:</strong><br>1. Bolaning tug'ilganlik to'g'risidagi guvohnomasi nusxasi;<br>2. 086-shakldagi tibbiy ma'lumotnoma;<br>3. 3x4 rasm (4 dona);<br>4. Ota-onaning pasport nusxalari.<br><br>Saytimiz orqali to'g'ridan-to'g'ri qabul arizasini onlayn topshirishingiz mumkin!",
            actions: [
                { text: "Qabulga Ariza Qoldirish", action: "openAdmissionModal(); closeModal('aiChatModal');", icon: "fa-pen-to-square" }
            ]
        };
    }

    // 3. Kutubxona va kitoblar
    if (q.includes('kutubxona') || q.includes('kitob') || q.includes('darslik') || q.includes('pdf')) {
        return {
            text: "Maktabimizning <strong>Elektron Kutubxona</strong> bo'limida 1-4, 5-9 va 10-11 sinf umumta'lim darsliklari (Alifbe, Matematika, Algebra, Ingliz tili) hamda badiiy durdonalar PDF formatida bepul yuklab olishga tayyor.",
            actions: [
                { text: "E-Kutubxonaga O'tish", action: "closeModal('aiChatModal'); location.href='#library';", icon: "fa-book-open" }
            ]
        };
    }

    // 4. Kundalik.com / e-Maktab
    if (q.includes('kundalik') || q.includes('emaktab') || q.includes('baho') || q.includes('jurnal')) {
        return {
            text: "Maktabimizda barcha baholar va uyga vazifalar davlatning yagona <strong>Kundalik.com (e-Maktab.uz)</strong> platformasida yuritiladi. Ota-onalar va o'quvchilar login orqali shaxsiy profilga kirishlari mumkin.",
            actions: [
                { text: "Kundalik.com ga Kirish", action: "window.open('https://login.emaktab.uz', '_blank');", icon: "fa-arrow-up-right-from-square" },
                { text: "Baho Kalkulyatoriga O'tish", action: "openGpaModal(); closeModal('aiChatModal');", icon: "fa-calculator" }
            ]
        };
    }

    // 5. Dars va qo'ng'iroqlar jadvali
    if (q.includes('jadval') || q.includes('dars') || q.includes('smena') || q.includes('vaqt') || q.includes('qongiroq')) {
        return {
            text: "<strong>Maktab dars va smena vaqtlari:</strong><br>☀️ <strong>1-smena:</strong> 08:00 dan 13:10 gacha (1-4 boshlang'ich va 9-11 yuqori sinflar)<br>🌙 <strong>2-smena:</strong> 13:30 dan 18:35 gacha (5-8 o'rta sinflar).<br>Sinfingiz bo'yicha to'liq dars jadvalini saytimizdan ko'rishingiz mumkin!",
            actions: [
                { text: "Dars Jadvalini Ko'rish", action: "closeModal('aiChatModal'); location.href='#timetable';", icon: "fa-calendar-days" }
            ]
        };
    }

    // 6. Ustozlar va Rahbariyat / Direktor
    if (q.includes('direktor') || q.includes('rahbar') || q.includes('ustoz') || q.includes('oqituvchi') || q.includes('dilfuza')) {
        return {
            text: "<strong>Maktab Rahbariyati:</strong><br>• <strong>Direktor:</strong> Dilfuza Yusupova (Qabul kunlari: Dushanba va Payshanba 14:00 - 17:00)<br>• <strong>O'quv ishlari mudiri:</strong> Rustam Xolmatov (Seshanba va Juma 13:00 - 16:00)<br>• Maktabimizda 68+ nafar tajribali oliy va 1-toifali ustozlar faoliyat yuritadi.",
            actions: [
                { text: "O'qituvchilar Ro'yxati", action: "closeModal('aiChatModal'); location.href='#teachers';", icon: "fa-chalkboard-user" }
            ]
        };
    }

    // 7. Manzil va Bog'lanish
    if (q.includes('manzil') || q.includes('telefon') || q.includes('qayerda') || q.includes('aloqa') || q.includes('nomer')) {
        return {
            text: "📍 <strong>Manzil:</strong> Sirdaryo viloyati, Guliston shahri, 1-sonli umumiy o'rta ta'lim maktabi.<br>📞 <strong>Qabulxona telefoni:</strong> +998 (67) 225-11-01<br>✉️ <strong>Email:</strong> info@guliston1maktab.uz",
            actions: [
                { text: "Murojaat Yuborish", action: "closeModal('aiChatModal'); location.href='#contact';", icon: "fa-envelope" }
            ]
        };
    }

    // Default Friendly AI Response
    return {
        text: `Savolingiz uchun katta rahmat! Men Guliston shahar 1-umumta'lim maktabining barcha ma'lumotlari bilan tanishman. Sizga onlayn testlar, qabul, dars jadvallari, Kundalik.com yoki spravka olish bo'yicha yordam berishim mumkin.`,
        actions: [
            { text: "Onlayn Test Topshirish", action: "closeModal('aiChatModal'); location.href='#tests';", icon: "fa-list-check" },
            { text: "Spravka Olish", action: "openSpravkaModal(); closeModal('aiChatModal');", icon: "fa-file-certificate" }
        ]
    };
}

/* ==========================================================================
   17. GLOBAL SEARCH & MODAL HELPERS
   ========================================================================== */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

const searchableItems = [
    { title: "Onlayn Test Markazi & Sertifikatlar", category: "Test", link: "#tests" },
    { title: "Matematika & Algebra Testi (7-9 sinf)", category: "Test", link: "javascript:startTestExam('math')" },
    { title: "Ingliz Tili B1 Grammar Testi", category: "Test", link: "javascript:startTestExam('english')" },
    { title: "Ona Tili va Imlo Savodxonligi Testi", category: "Test", link: "javascript:startTestExam('onatili')" },
    { title: "Informatika va IT Savodxonlik Testi", category: "Test", link: "javascript:startTestExam('it')" },
    { title: "O'zbekiston Tarixi Testi", category: "Test", link: "javascript:startTestExam('history')" },
    { title: "Boshlang'ich Sinf Bilimdon Testi (1-4 sinf)", category: "Test", link: "javascript:startTestExam('primary')" },
    { title: "Guliston 1-Maktab AI Yordamchisi", category: "AI", link: "javascript:openChatModal()" },
    { title: "Elektron Ma'lumotnoma (Spravka) Olish", category: "Xizmat", link: "javascript:openSpravkaModal()" },
    { title: "Choraklik Baholar & GPA Kalkulyatori", category: "Kalkulyator", link: "javascript:openGpaModal()" },
    { title: "Elektron Kutubxona va PDF Darsliklar", category: "Kutubxona", link: "#library" },
    { title: "Kundalik.com / e-Maktab Portali", category: "Kundalik", link: "#kundalik" },
    { title: "Maktab Admin Paneli (Boshqaruv)", category: "Admin", link: "javascript:openAdminModal()" },
    { title: "1-A Boshlang'ich Sinf Dars Jadvali", category: "Dars Jadvali", link: "#timetable" },
    { title: "7-A Sinf Dars Jadvali", category: "Dars Jadvali", link: "#timetable" },
    { title: "Dilfuza Yusupova (Maktab Direktori)", category: "Rahbariyat", link: "#teachers" },
    { title: "1-Sinfga Qabul va Hujjatlar", category: "Qabul", link: "#hero" },
    { title: "Guliston 1-Maktab Manzili va Telefoni", category: "Aloqa", link: "#contact" }
];

function initKeyboardShortcuts() {
    const searchTriggerBtn = document.getElementById('searchTriggerBtn');
    if (searchTriggerBtn) {
        searchTriggerBtn.addEventListener('click', () => {
            openModal('searchModal');
            setTimeout(() => document.getElementById('globalSearchInput')?.focus(), 100);
        });
    }

    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openModal('searchModal');
            setTimeout(() => document.getElementById('globalSearchInput')?.focus(), 100);
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active, .admin-modal-overlay.active').forEach(m => {
                m.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

function handleLiveSearch(query) {
    const list = document.getElementById('searchResultsList');
    if (!list) return;

    const q = query.trim().toLowerCase();
    if (!q) {
        list.innerHTML = `
            <div class="search-empty-state">
                <i class="fa-solid fa-keyboard"></i>
                <p>Kalit so'zni yozing, masalan: <em>"Test", "Spravka", "Kutubxona", "Kundalik"</em></p>
            </div>
        `;
        return;
    }

    const filtered = searchableItems.filter(item => 
        item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
        list.innerHTML = `
            <div class="search-empty-state">
                <i class="fa-solid fa-circle-exclamation"></i>
                <p>"${escapeHtml(query)}" bo'yicha hech qanday ma'lumot topilmadi.</p>
            </div>
        `;
        return;
    }

    let html = '';
    filtered.forEach(item => {
        html += `
            <a href="${item.link}" class="search-result-item" onclick="closeModal('searchModal')">
                <span class="search-result-badge">${item.category}</span>
                <span>${item.title}</span>
                <i class="fa-solid fa-chevron-right" style="margin-left: auto; font-size: 0.8rem; color: var(--text-muted);"></i>
            </a>
        `;
    });
    list.innerHTML = html;
}

/* ==========================================================================
   18. TOAST NOTIFICATION SYSTEM
   ========================================================================== */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    const iconClass = type === 'success' ? 'fa-circle-check toast-icon-success' : 'fa-circle-info toast-icon-info';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function escapeHtml(string) {
    const entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}
