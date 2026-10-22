/**
 * ==========================================================================
 * DILBAR EDICATION — ZAMONAVIY XUSUSIY MAKTAB PORTALI
 * ONLAYN DIAGNOSTIK TEST, QABUL VA ADMIN BOSHQARUV (java.js)
 * ==========================================================================
 */

const API_BASE = (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) 
    ? '/api' 
    : 'http://localhost:5000/api';

async function apiRequest(endpoint, options = {}) {
    const token = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('dilbar_token') : null;
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...(options.headers || {})
    };

    try {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
            body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
        });
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
            return await res.json();
        }
        return { success: res.ok };
    } catch (e) {
        console.warn(`API request to ${endpoint} failed (using offline fallback):`, e.message || e);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try { initTheme(); } catch (e) { console.error('initTheme error:', e); }
    try { initClockAndCountdown(); } catch (e) { console.error('initClock error:', e); }
    try { initCounters(); } catch (e) { console.error('initCounters error:', e); }
    try { initTeachersFilter(); } catch (e) { console.error('initTeachers error:', e); }
    try { loadPublicTeachers(); } catch (e) { console.error('loadPublicTeachers error:', e); }
    try { initHonorsFilter(); } catch (e) { console.error('initHonors error:', e); }
    try { loadLeaderboard(); } catch (e) { console.error('leaderboard error:', e); }
    try { initAccordion(); } catch (e) { console.error('initAccordion error:', e); }
    try { initScrollEffects(); } catch (e) { console.error('initScroll error:', e); }
    try { initKeyboardShortcuts(); } catch (e) { console.error('initKeyboard error:', e); }
    try { renderAdminApplications(); } catch (e) { console.error('renderApps error:', e); }
    try { renderAdminMessages(); } catch (e) { console.error('renderMsgs error:', e); }
    try { renderAdminTeachersManage(); } catch (e) { console.error('renderTeachers error:', e); }
    try { initAmenities(); } catch (e) { console.error('initAmenities error:', e); }
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
    const savedTheme = localStorage.getItem('dilbar_theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('dilbar_theme', newTheme);
    showToast(`Mavzu: ${newTheme === 'dark' ? '🌙 Tungi rejim' : '☀️ Kunduzgi rejim'}`, 'info');
}

const themeToggleBtn = document.getElementById('themeToggleBtn');
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleTheme);
}

/* ==========================================================================
   3. SCROLL & NAVIGATION EFFECTS
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
        document.body.classList.add('sidebar-open');
    } else {
        appSidebar?.classList.remove('active');
        sidebarBackdrop?.classList.remove('active');
        document.body.classList.remove('sidebar-open');
    }
}

function navigateToSection(targetId, e) {
    if (e && typeof e.preventDefault === 'function') {
        e.preventDefault();
    }
    const cleanId = (targetId || '').replace(/^#/, '');
    const element = document.getElementById(cleanId);
    if (element) {
        const headerOffset = 130;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });

        setActiveNavLink(cleanId, true);
        if (window.innerWidth <= 992) {
            toggleSidebar(false);
        }
    }
}

function initScrollEffects() {
    const sections = ['hero', 'about', 'tests', 'teachers', 'honors', 'contact'];
    
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        if (mainHeader) {
            if (scrollY > 50) {
                mainHeader.classList.add('scrolled');
            } else {
                mainHeader.classList.remove('scrolled');
            }
        }

        if (backToTopBtn) {
            if (scrollY > 400) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        }

        let currentSectionId = '';
        for (const secId of sections) {
            const el = document.getElementById(secId);
            if (el) {
                const rect = el.getBoundingClientRect();
                if (rect.top <= 200 && rect.bottom >= 200) {
                    currentSectionId = secId;
                    break;
                }
            }
        }

        if (currentSectionId) {
            setActiveNavLink(currentSectionId, false);
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function setActiveNavLink(targetId, shouldScrollRibbon = false) {
    document.querySelectorAll('.sidebar-link').forEach(link => {
        const href = link.getAttribute('href')?.replace(/^#/, '');
        if (href === targetId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    document.querySelectorAll('.top-nav-list .nav-link').forEach(link => {
        const href = link.getAttribute('href')?.replace(/^#/, '');
        if (href === targetId) {
            link.classList.add('active');
            if (shouldScrollRibbon && link.parentElement) {
                link.parentElement.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        } else {
            link.classList.remove('active');
        }
    });
}

function dismissAnnouncement() {
    const bar = document.getElementById('announcementBar');
    if (bar) {
        bar.style.display = 'none';
    }
}

/* ==========================================================================
   4. STATS COUNTER ANIMATION
   ========================================================================== */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number, .stat-counter');
    let animated = false;

    const animate = () => {
        if (animated) return;
        const heroStats = document.querySelector('.hero-stats-wrapper');
        if (!heroStats) return;

        const rect = heroStats.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            animated = true;
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target') || counter.getAttribute('data-count') || '0', 10);
                if (!target) return;

                let count = 0;
                const step = Math.max(1, Math.floor(target / 30));

                const timer = setInterval(() => {
                    count += step;
                    if (count >= target) {
                        count = target;
                        clearInterval(timer);
                    }
                    if (counter.classList.contains('stat-number')) {
                        counter.innerText = count.toLocaleString() + (target >= 90 ? '%' : '');
                    }
                }, 30);
            });
        }
    };

    window.addEventListener('scroll', animate);
    animate();
}

/* ==========================================================================
   5. TEXT TO SPEECH (VOICE ABOUT)
   ========================================================================== */
function speakAboutText() {
    if (!window.speechSynthesis) {
        showToast("Brauzeringiz ovozli o'qishni qo'llab-quvvatlamaydi", 'warning');
        return;
    }
    window.speechSynthesis.cancel();
    const text = "DILBAR EDICATION — 1-11 sinf o'quvchilari uchun mo'ljallangan zamonaviy xususiy maktab. Maktabimizda kichik guruhlar, to'liq kunlik ta'lim, 3 mahal sog'lom ovqatlanish, Kembrij va SAT dasturi hamda xavfsiz maktab avtobusi xizmati mavjud.";
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = 'uz-UZ';
    utter.rate = 1.0;
    window.speechSynthesis.speak(utter);
    showToast("Maktab haqidagi ma'lumot o'qilmoqda...", 'info');
}

/* ==========================================================================
   6. ONLAYN DIAGNOSTIK TEST & SERTIFIKAT TIZIMI
   ========================================================================== */
const mockTestDatabase = {
    math: [
        { q: "2x + 14 = 30 tenglamaning ildizini (x) toping.", opts: ["x = 8", "x = 7", "x = 9", "x = 6"], c: 0, exp: "2x = 30 - 14 => 2x = 16 => x = 8." },
        { q: "Kvadratning tomoni 9 sm bo'lsa, uning yuzasi (S) qancha?", opts: ["81 sm²", "36 sm²", "72 sm²", "18 sm²"], c: 0, exp: "Kvadrat yuzi: S = a² = 9² = 81 sm²." },
        { q: "Uchburchakning ichki burchaklari yig'indisi necha gradusga teng?", opts: ["180°", "360°", "90°", "270°"], c: 0, exp: "Har qanday uchburchakning ichki burchaklari yig'indisi 180° ga teng." },
        { q: "Sonning 25 foizi 50 ga teng bo'lsa, bu sonning o'zi nechaga teng?", opts: ["200", "150", "250", "100"], c: 0, exp: "50 / 0.25 = 200." },
        { q: "(-4) * (-7) ko'paytmaning qiymatini hisoblang.", opts: ["28", "-28", "24", "-11"], c: 0, exp: "Ikkita manfiy son ko'paytmasi musbat bo'ladi: (-4)*(-7) = 28." },
        { q: "To'g'ri burchakli uchburchakda gipotenuza c² = a² + b² qaysi teorema?", opts: ["Pifagor teoremasi", "Fales teoremasi", "Viyet teoremasi", "Nyuton qonuni"], c: 0, exp: "Pifagor teoremasi to'g'ri burchakli uchburchak tomonlarini ifodalaydi." },
        { q: "3/4 + 1/2 kasrlarni qo'shing.", opts: ["5/4 (1.25)", "4/6", "1", "3/8"], c: 0, exp: "3/4 + 2/4 = 5/4 = 1.25." },
        { q: "5 ning 3-darajasi (5³) nechaga teng?", opts: ["125", "15", "75", "25"], c: 0, exp: "5 * 5 * 5 = 125." },
        { q: "Doiraning yuzini topish formulasi qaysi?", opts: ["S = π * r²", "S = 2 * π * r", "S = a * b", "S = 4 * π * r"], c: 0, exp: "Doira yuzi radiusi orqali S = π*r² deb hisoblanadi." },
        { q: "Ketma-ket kelgan 3 ta natural sonning yig'indisi 36 bo'lsa, o'rtadagi sonni toping.", opts: ["12", "11", "13", "10"], c: 0, exp: "(x-1) + x + (x+1) = 3x = 36 => x = 12." }
    ],
    english: [
        { q: "She ___ to school every day by bus.", opts: ["goes", "go", "going", "gone"], c: 0, exp: "Present Simple 3rd person singular: She goes." },
        { q: "Yesterday, we ___ a very interesting exhibition.", opts: ["visited", "visit", "visiting", "have visited"], c: 0, exp: "Past Simple: visited." },
        { q: "What is the opposite of the word 'Generous'?", opts: ["Mean / Stingy", "Polite", "Brave", "Honest"], c: 0, exp: "'Generous' ning aksi 'Mean'." },
        { q: "I have lived in Tashkent ___ 2018.", opts: ["since", "for", "in", "during"], c: 0, exp: "Aniq boshlanish yili: since 2018." },
        { q: "If it rains tomorrow, we ___ at home.", opts: ["will stay", "stayed", "staying", "had stayed"], c: 0, exp: "First Conditional: will stay." },
        { q: "This is the boy ___ won the academy competition.", opts: ["who", "which", "whose", "where"], c: 0, exp: "Insonlar uchun bog'lovchi: who." },
        { q: "Mount Everest is ___ mountain in the world.", opts: ["the highest", "higher", "highest", "more high"], c: 0, exp: "Superlative: the highest." },
        { q: "They ___ English for 3 years now.", opts: ["have been learning", "learn", "learned", "are learn"], c: 0, exp: "Present Perfect Continuous: have been learning." },
        { q: "Choose the correct preposition: 'He is interested ___ robotics and AI.'", opts: ["in", "at", "on", "for"], c: 0, exp: "'Interested in' doimo 'in' bilan keladi." },
        { q: "Which word is a synonym for 'Huge'?", opts: ["Enormous", "Tiny", "Weak", "Narrow"], c: 0, exp: "'Huge' va 'Enormous' ikkalasi ham 'ulkan' degani." }
    ],
    onatili: [
        { q: "O'zbek tilida nechta unli tovush va nechta unli harf bor?", opts: ["6 ta tovush, 6 ta harf", "10 ta tovush, 8 ta harf", "7 ta tovush, 6 ta harf", "5 ta tovush, 5 ta harf"], c: 0, exp: "O'zbek tilida 6 ta unli tovush mavjud." },
        { q: "Qaysi so'z imlo qoidasiga ko'ra to'g'ri yozilgan?", opts: ["Mutaxassis", "Mutaxasis", "Muttaxassis", "Mutahasiss"], c: 0, exp: "To'g'ri yozilishi: Mutaxassis." },
        { q: "O'zbek tiliga davlat tili maqomi qachon berilgan?", opts: ["1989-yil 21-oktabr", "1991-yil 1-sentabr", "1992-yil 8-dekabr", "1993-yil 2-iyul"], c: 0, exp: "1989-yil 21-oktabrda Davlat tili to'g'risidagi qonun qabul qilingan." },
        { q: "'Baland' so'zining antonimi (zid ma'nolisi) qaysi?", opts: ["Past", "Keng", "Uzun", "Qisqa"], c: 0, exp: "Balandning aksi: Past." },
        { q: "Harakatning bajaruvchisini bildiruvchi bosh bo'lak nima deyiladi?", opts: ["Ega", "Kesim", "To'ldiruvchi", "Hol"], c: 0, exp: "Kim? nima? so'rog'iga javob bo'lib harakat egasini bildiruvchi bo'lak - Ega." },
        { q: "'Xushfe'l' so'zidagi tutuq belgisi (') qanday vazifani bajaradi?", opts: ["Tovushni ajratib, pauza bilan talaffuz qilish", "Unlini cho'zish", "Urg'uni ko'rsatish", "Bo'g'in ajratish"], c: 0, exp: "Undoshdan keyin kichik to'xtam hosil qiladi." },
        { q: "Alisher Navoiy qalamiga mansub besh doston to'plami nima deb ataladi?", opts: ["Xamsa", "Devoni Foniy", "Lison ut-tayr", "Mahbub ul-qulub"], c: 0, exp: "Alisher Navoiy shoh asari 'Xamsa'." },
        { q: "Fe'lning qaysi zamoni harakatning hozir sodir bo'layotganini bildiradi?", opts: ["Hozirgi zamon", "O'tgan zamon", "Kelasi zamon", "Shart mayli"], c: 0, exp: "Hozirgi zamon ayni vaqtdagi ish-harakatni bildiradi." },
        { q: "'Oq ko'ngil' iborasi qanday ma'noni ifodalaydi?", opts: ["Samimiy, beg'ubor inson", "Jahldor", "Bevafo", "Qo'rqoq"], c: 0, exp: "Sof, mehribon insonlarga aytiladi." },
        { q: "Ravish so'z turkumi qanday so'roqlarga javob bo'ladi?", opts: ["Qanday? Qay darajada? Qachon? Qayerda?", "Kim? Nima?", "Nechta? Nechanchi?", "Nima qildi?"], c: 0, exp: "Ravish harakatning belgisini bildiradi." }
    ],
    it: [
        { q: "Kompyuterning asosiy 'miyasi' va hisoblash markazi nima?", opts: ["Protsessor (CPU)", "Operativ xotira (RAM)", "Qattiq disk (SSD/HDD)", "Videokarta (GPU)"], c: 0, exp: "CPU barcha hisoblash amallarini bajaradi." },
        { q: "1 Megabayt (MB) necha Kilobaytga (KB) teng?", opts: ["1024 KB", "1000 KB", "512 KB", "2048 KB"], c: 0, exp: "Axborot o'lchov birligi: 1 MB = 1024 KB." },
        { q: "Python dasturlash tilida ekranga ma'lumot chiqarish buyrug'i qaysi?", opts: ["print()", "echo()", "console.log()", "display()"], c: 0, exp: "Python dasturlash tilida print() ishlatiladi." },
        { q: "Axborot xavfsizligida ishonchli parolda nimalar bo'lishi shart?", opts: ["Katta-kichik harflar, raqamlar va maxsus belgilar", "Faqat tug'ilgan yil", "Faqat 123456", "Faqat ism"], c: 0, exp: "Xavfsiz parol aralash belgilar majmuasidan iborat bo'ladi." },
        { q: "Veb-saytlarning ko'rinishi va dizaynini bezash uchun qaysi texnologiya ishlatiladi?", opts: ["CSS", "HTML", "SQL", "C++"], c: 0, exp: "CSS dizayn va vizual stillar uchun xizmat qiladi." },
        { q: "Fayl kengaytmasi '.docx' bo'lgan fayl qaysi dasturda ochiladi?", opts: ["Microsoft Word", "Microsoft Excel", "Adobe Photoshop", "VLC Player"], c: 0, exp: ".docx formati matnli hujjatlar (Word) dasturiga tegishli." },
        { q: "Algoritm nima?", opts: ["Maqsadga erishish uchun bajariladigan aniq ko'rsatmalar ketma-ketligi", "Kompyuter monitori", "Internet tezligi", "O'yin dasturi"], c: 0, exp: "Algoritm — qat'iy tartibli ko'rsatmalar tizimidir." },
        { q: "Elektron jadvallar bilan ishlash uchun eng mashhur dastur qaysi?", opts: ["Microsoft Excel", "Paint", "Notepad", "PowerPoint"], c: 0, exp: "Excel jadvallar va hisob-kitoblar uchun asosiy dastur." },
        { q: "HTML qisqartmasining to'liq ma'nosi nima?", opts: ["HyperText Markup Language", "High Transfer Machine Link", "Hyper Tool Multi Language", "Home Text Make Link"], c: 0, exp: "HTML — HyperText Markup Language." },
        { q: "Internet brauzerlariga misol keltiring:", opts: ["Google Chrome, Mozilla Firefox, Microsoft Edge", "Windows, Linux, macOS", "Word, Excel, Access", "Photoshop, CorelDraw"], c: 0, exp: "Chrome, Firefox va Edge veb-brauzerlardir." }
    ],
    history: [
        { q: "Sohibqiron Amir Temur qaysi yili tavallud topgan?", opts: ["1336-yil 9-aprel", "1340-yil 1-may", "1370-yil 10-aprel", "1405-yil 18-fevral"], c: 0, exp: "Amir Temur 1336-yil 9-aprelda tug'ilgan." },
        { q: "Amir Temurning mashhur shiori qanday bo'lgan?", opts: ["Kuch — adolatdadir!", "Ilm — najotdir!", "G'alaba — birdamlikda!", "Tinchlik — boylikdir!"], c: 0, exp: "Amir Temur shiori: Kuch — adolatdadir!" },
        { q: "Tibbiyot ilmining sultoni, 'Tib qonunlari' asari muallifi kim?", opts: ["Abu Ali ibn Sino (Avitsenna)", "Abu Rayhon Beruniy", "Al-Xorazmiy", "Mirzo Ulug'bek"], c: 0, exp: "Abu Ali ibn Sino." },
        { q: "Algebra faniga asos solgan buyuk alloma kim?", opts: ["Muhammad al-Xorazmiy", "Ahmad Farg'oniy", "Ibn Sino", "Zahiriddin Muhammad Bobur"], c: 0, exp: "Al-Xorazmiy algebra asoschisidir." },
        { q: "Samarqandda yirik rasadxona (observatoriya) qurdirgan astronom-hukmdor kim?", opts: ["Mirzo Ulug'bek", "Shohruh Mirzo", "Amir Temur", "Husayn Boyqaro"], c: 0, exp: "Mirzo Ulug'bek Samarqandda yulduzlar jadvalini tuzgan." },
        { q: "'Boburnoma' asarining muallifi va Boburiylar saltanati asoschisi kim?", opts: ["Zahiriddin Muhammad Bobur", "Kamolidin Behzod", "Abdulla Qodiriy", "Munis Xorazmiy"], c: 0, exp: "Zahiriddin Muhammad Bobur." },
        { q: "O'zbekiston Respublikasi Davlat Mustaqilligi qachon e'lon qilingan?", opts: ["1991-yil 31-avgust (1-sentabr)", "1992-yil 8-dekabr", "1990-yil 20-iyun", "1989-yil 21-oktabr"], c: 0, exp: "1991-yil 31-avgustda mustaqillik e'lon qilingan." },
        { q: "Qadimgi Buyuk Ipak Yo'li qaysi qit'alarni bog'lab turgan?", opts: ["Osiyo va Yevropa", "Afrika va Amerika", "Avstraliya va Osiyo", "Yevropa va Amerika"], c: 0, exp: "Sharq va G'arbni bog'lagan savdo yo'li." },
        { q: "O'zbekiston Respublikasi Konstitutsiyasi qachon qabul qilingan?", opts: ["1992-yil 8-dekabr", "1991-yil 1-sentabr", "1993-yil 2-iyul", "1994-yil 1-iyul"], c: 0, exp: "1992-yil 8-dekabrda qabul qilingan." },
        { q: "Alisher Navoiy tavallud topgan shahar qaysi?", opts: ["Hirot", "Samarqand", "Buxoro", "Toshkent"], c: 0, exp: "Alisher Navoiy 1441-yil Hirot shahrida tug'ilgan." }
    ],
    primary: [
        { q: "Bir yilda nechta fasl va nechta oy bor?", opts: ["4 fasl, 12 oy", "3 fasl, 10 oy", "4 fasl, 10 oy", "2 fasl, 12 oy"], c: 0, exp: "Bir yilda 4 fasl va 12 oy bor." },
        { q: "7 ga 8 ni qo'shsak necha bo'ladi?", opts: ["15", "14", "16", "13"], c: 0, exp: "7 + 8 = 15." },
        { q: "O'zbekiston Respublikasi Davlat bayrog'ida nechta yulduz tasvirlangan?", opts: ["12 ta", "10 ta", "14 ta", "8 ta"], c: 0, exp: "Bayrog'imizda 12 ta yulduz bor." },
        { q: "Quyosh qaysi tomondan chiqadi?", opts: ["Sharqdan", "G'arbdan", "Shimoldan", "Janubdan"], c: 0, exp: "Quyosh sharqdan chiqadi." },
        { q: "Daraxt barglari kuzda qanday rangga kiradi?", opts: ["Sariq va qizil", "Moviy va ko'k", "Qora va kulrang", "Oq"], c: 0, exp: "Kuz faslida sarg'ayadi." },
        { q: "5 * 6 ko'paytirish jadvali natijasi nechaga teng?", opts: ["30", "25", "35", "36"], c: 0, exp: "5 * 6 = 30." },
        { q: "Eng kichik ikki xonali son qaysi?", opts: ["10", "1", "11", "99"], c: 0, exp: "Eng kichik 2 xonali son — 10." },
        { q: "Qaysi faslda qor yog'adi?", opts: ["Qish", "Bahor", "Yoz", "Kuz"], c: 0, exp: "Qor qish faslida yog'adi." },
        { q: "Kitob o'qish inson uchun nima beradi?", opts: ["Katta bilim va aql-zakovat", "Uyqu", "Charchoq", "Hech narsa"], c: 0, exp: "Kitob — bilim manbayi." },
        { q: "1 metrda necha santimetr bor?", opts: ["100 sm", "10 sm", "1000 sm", "50 sm"], c: 0, exp: "1 metr = 100 santimetr." }
    ]
};

let currentExam = {
    subjectKey: 'math',
    subjectTitle: 'Matematika & Mantiq Testi',
    classBadge: '5-11 Sinf',
    studentName: '',
    studentClass: '7-A',
    questions: [],
    userAnswers: {},
    currentIndex: 0,
    timerSeconds: 900,
    timerInterval: null
};

function filterTestSubjects(subjectKey) {
    document.querySelectorAll('[data-subject]').forEach(btn => {
        if (btn.getAttribute('data-subject') === subjectKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const cards = document.querySelectorAll('#testSubjectsGrid .test-card');
    cards.forEach(card => {
        const sub = card.getAttribute('data-sub');
        if (subjectKey === 'all' || sub === subjectKey) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function startTestExam(subjectKey, subjectTitle = '', classBadge = '') {
    currentExam.subjectKey = subjectKey;
    currentExam.subjectTitle = subjectTitle || 'Fan Testi';
    currentExam.classBadge = classBadge || 'Umumiy';
    currentExam.userAnswers = {};
    currentExam.currentIndex = 0;
    currentExam.timerSeconds = 900;

    const titleEl = document.getElementById('examSubjectTitle');
    const subEl = document.getElementById('examSubjectSubtitle');
    if (titleEl) titleEl.innerText = currentExam.subjectTitle;
    if (subEl) subEl.innerText = `10 ta savol • 15 daqiqa • Diagnostik sinov (${currentExam.classBadge})`;

    document.getElementById('examPreView')?.classList.remove('hidden');
    document.getElementById('examActiveView')?.classList.add('hidden');
    document.getElementById('examResultView')?.classList.add('hidden');

    const modal = document.getElementById('testExamModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function confirmStartExam() {
    const nameInput = document.getElementById('examStudentName');
    const classInput = document.getElementById('examStudentClass');

    const nameVal = nameInput ? nameInput.value.trim() : '';
    const classVal = classInput ? classInput.value : '7-A';

    if (!nameVal) {
        showToast("Iltimos, to\'liq ism-familiyangizni kiriting!", "error");
        nameInput?.focus();
        return;
    }

    currentExam.studentName = nameVal;
    currentExam.studentClass = classVal;

    const qList = mockTestDatabase[currentExam.subjectKey] || mockTestDatabase.math;
    currentExam.questions = JSON.parse(JSON.stringify(qList));
    currentExam.userAnswers = {};
    currentExam.currentIndex = 0;
    currentExam.timerSeconds = 900;

    const actName = document.getElementById('examActiveStudentName');
    const actClass = document.getElementById('examActiveStudentClass');
    if (actName) actName.innerText = currentExam.studentName;
    if (actClass) actClass.innerText = currentExam.studentClass;

    document.getElementById('examPreView')?.classList.add('hidden');
    document.getElementById('examActiveView')?.classList.remove('hidden');
    document.getElementById('examResultView')?.classList.add('hidden');

    renderExamNavigator();
    renderExamQuestion(0);

    if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);
    updateExamTimerDisplay();
    currentExam.timerInterval = setInterval(() => {
        currentExam.timerSeconds--;
        updateExamTimerDisplay();
        if (currentExam.timerSeconds <= 0) {
            clearInterval(currentExam.timerInterval);
            showToast('Vaqt tugadi! Test avtomatik yakunlandi.', 'warning');
            finishTestExam(false);
        }
    }, 1000);
}

function updateExamTimerDisplay() {
    const minutes = Math.floor(currentExam.timerSeconds / 60);
    const seconds = currentExam.timerSeconds % 60;
    const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const el = document.getElementById('examTimerDisplay');
    if (el) el.innerText = display;
}

function renderExamNavigator() {
    const nav = document.getElementById('examQNavigator');
    if (!nav) return;

    nav.innerHTML = currentExam.questions.map((_, idx) => {
        const isAnswered = currentExam.userAnswers[idx] !== undefined;
        const isActive = idx === currentExam.currentIndex;
        let cls = 'q-dot';
        if (isActive) cls += ' active';
        if (isAnswered) cls += ' answered';
        return `<button class="${cls}" onclick="jumpToExamQuestion(${idx})">${idx + 1}</button>`;
    }).join('');
}

function renderExamQuestion(index) {
    if (index < 0 || index >= currentExam.questions.length) return;
    currentExam.currentIndex = index;

    const q = currentExam.questions[index];
    const qText = document.getElementById('examQText');
    const optsStack = document.getElementById('examOptionsStack');
    const prog = document.getElementById('examProgressFraction');

    if (qText) qText.innerText = `${index + 1}. ${q.q}`;
    if (prog) prog.innerText = `${index + 1} / ${currentExam.questions.length}`;

    const selectedOpt = currentExam.userAnswers[index];
    if (optsStack) {
        optsStack.innerHTML = q.opts.map((opt, optIdx) => {
            const isSelected = selectedOpt === optIdx;
            return `
                <div class="exam-option-item ${isSelected ? 'selected' : ''}" onclick="selectExamOption(${optIdx})">
                    <div class="option-indicator">${String.fromCharCode(65 + optIdx)}</div>
                    <div class="option-text">${escapeHtml(opt)}</div>
                </div>
            `;
        }).join('');
    }

    renderExamNavigator();

    const prevBtn = document.getElementById('btnPrevQ');
    const nextBtn = document.getElementById('btnNextQ');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) {
        if (index === currentExam.questions.length - 1) {
            nextBtn.innerHTML = `<i class="fa-solid fa-flag-checkered"></i> Yakunlash`;
            nextBtn.onclick = () => finishTestExam(true);
        } else {
            nextBtn.innerHTML = `Keyingi <i class="fa-solid fa-arrow-right"></i>`;
            nextBtn.onclick = () => navigateExamQuestion(1);
        }
    }
}

function selectExamOption(optIndex) {
    currentExam.userAnswers[currentExam.currentIndex] = optIndex;
    renderExamQuestion(currentExam.currentIndex);
}

function navigateExamQuestion(delta) {
    const nextIdx = currentExam.currentIndex + delta;
    if (nextIdx >= 0 && nextIdx < currentExam.questions.length) {
        renderExamQuestion(nextIdx);
    }
}

function jumpToExamQuestion(index) {
    renderExamQuestion(index);
}

async function finishTestExam(confirmPrompt = true) {
    if (confirmPrompt) {
        const answeredCount = Object.keys(currentExam.userAnswers).length;
        const total = currentExam.questions.length;
        if (answeredCount < total) {
            const proceed = confirm(`Siz ${total} ta savoldan ${answeredCount} tasiga javob berdingiz. Testni haqiqatdan ham yakunlaysizmi?`);
            if (!proceed) return;
        }
    }

    if (currentExam.timerInterval) {
        clearInterval(currentExam.timerInterval);
    }

    let correctCount = 0;
    currentExam.questions.forEach((q, idx) => {
        if (currentExam.userAnswers[idx] === q.c) {
            correctCount++;
        }
    });

    const totalQuestions = currentExam.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    let gradeLevel = "A'lochi (5 baho)";
    if (percentage < 55) gradeLevel = "Qoniqarsiz (2 baho)";
    else if (percentage < 70) gradeLevel = "Qoniqarli (3 baho)";
    else if (percentage < 85) gradeLevel = "Yaxshi (4 baho)";

    const certCode = 'CERT-2026-' + Math.floor(1000 + Math.random() * 9000);

    document.getElementById('examActiveView')?.classList.add('hidden');
    document.getElementById('examResultView')?.classList.remove('hidden');

    const certName = document.getElementById('certStudentName');
    const certSub = document.getElementById('certSubjectName');
    const certScore = document.getElementById('certScoreText');
    const certGrade = document.getElementById('certGradeLevel');
    const certId = document.getElementById('certIdNum');

    if (certName) certName.innerText = currentExam.studentName;
    if (certSub) certSub.innerText = currentExam.subjectTitle;
    if (certScore) certScore.innerText = `${correctCount} / ${totalQuestions} (${percentage}%)`;
    if (certGrade) certGrade.innerText = `Daraja: ${gradeLevel}`;
    if (certId) certId.innerText = certCode.replace('CERT-2026-', '');

    const reviewList = document.getElementById('examReviewList');
    if (reviewList) {
        reviewList.innerHTML = currentExam.questions.map((q, idx) => {
            const userChoice = currentExam.userAnswers[idx];
            const isCorrect = userChoice === q.c;
            return `
                <div class="review-item ${isCorrect ? 'correct' : 'incorrect'} glass-card p-3 mb-2">
                    <div style="font-weight:700; margin-bottom:0.4rem;">${idx + 1}. ${escapeHtml(q.q)}</div>
                    <div style="font-size:0.9rem; color:${isCorrect ? 'var(--emerald)' : 'var(--rose)'};">
                        ${isCorrect ? '✅ Sizning to\'g\'ri javobingiz:' : '❌ Sizning javobingiz:'} 
                        ${userChoice !== undefined ? escapeHtml(q.opts[userChoice]) : 'Javob berilmagan'}
                    </div>
                    ${!isCorrect ? `<div style="font-size:0.88rem; color:var(--emerald); margin-top:0.2rem;">✔️ To'g'ri javob: ${escapeHtml(q.opts[q.c])}</div>` : ''}
                    <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.3rem;">ℹ️ ${escapeHtml(q.exp)}</div>
                </div>
            `;
        }).join('');
    }

    try {
        await apiRequest('/tests/submit', {
            method: 'POST',
            body: {
                cert_code: certCode,
                student_name: currentExam.studentName,
                class_val: currentExam.studentClass,
                subject_key: currentExam.subjectKey,
                subject_title: currentExam.subjectTitle,
                score: correctCount,
                total_questions: totalQuestions,
                percentage: percentage,
                grade_level: gradeLevel
            }
        });
        loadLeaderboard();
    } catch (e) {
        console.warn('Test result saved locally.');
    }

    showToast(`Test yakunlandi! Natija: ${correctCount}/${totalQuestions} (${percentage}%)`, 'success');
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
    if (currentExam.timerInterval) clearInterval(currentExam.timerInterval);
    const modal = document.getElementById('testExamModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

async function loadLeaderboard() {
    const tbody = document.getElementById('leaderboardTableBody');
    if (!tbody) return;

    try {
        const res = await apiRequest('/tests/leaderboard');
        if (res && res.success && res.data && res.data.length > 0) {
            tbody.innerHTML = res.data.map((item, idx) => `
                <tr>
                    <td><strong class="leader-rank rank-${idx + 1}">#${idx + 1}</strong></td>
                    <td><strong>${escapeHtml(item.student_name)}</strong></td>
                    <td>${escapeHtml(item.class_val)}</td>
                    <td>${escapeHtml(item.subject_title)}</td>
                    <td><span class="badge-gold font-bold">${item.score}/${item.total_questions} (100%)</span></td>
                    <td><code>${escapeHtml(item.cert_code)}</code></td>
                    <td>${new Date(item.created_at || Date.now()).toLocaleDateString('uz-UZ')}</td>
                </tr>
            `).join('');
            return;
        }
    } catch (e) {
        console.warn('Leaderboard offline mock');
    }

    tbody.innerHTML = `
        <tr>
            <td><strong class="leader-rank rank-1">🥇 1</strong></td>
            <td><strong>Karimov Jasurbek Anvar o'g'li</strong></td>
            <td>7-A Sinf</td>
            <td>Matematika & Mantiq</td>
            <td><span class="badge-gold font-bold">10/10 (100%)</span></td>
            <td><code>CERT-2026-8841</code></td>
            <td>21.08.2026</td>
        </tr>
        <tr>
            <td><strong class="leader-rank rank-2">🥈 2</strong></td>
            <td><strong>Boboyeva Zarina Shavkat qizi</strong></td>
            <td>11-A Sinf</td>
            <td>Ingliz Tili (Grammar B1)</td>
            <td><span class="badge-gold font-bold">10/10 (100%)</span></td>
            <td><code>CERT-2026-7492</code></td>
            <td>20.08.2026</td>
        </tr>
        <tr>
            <td><strong class="leader-rank rank-3">🥉 3</strong></td>
            <td><strong>Rahimov Sardor Ilhom o'g'li</strong></td>
            <td>10-A Sinf</td>
            <td>Informatika & IT</td>
            <td><span class="badge-gold font-bold">10/10 (100%)</span></td>
            <td><code>CERT-2026-5120</code></td>
            <td>19.08.2026</td>
        </tr>
    `;
}

/* ==========================================================================
   7. TEACHERS & HONORS FILTERS
   ========================================================================== */
function initTeachersFilter() {
    document.querySelectorAll('.filter-buttons-wrapper .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-buttons-wrapper .filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-filter') || 'all';

            document.querySelectorAll('#teachersGrid .teacher-card').forEach(card => {
                const cardCat = card.getAttribute('data-category');
                if (cat === 'all' || cardCat === cat) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

function showTeacherDetails(name, role, bio, email, hours) {
    const tName = document.getElementById('tModalName');
    const tRole = document.getElementById('tModalRole');
    const tBio = document.getElementById('tModalBio');
    const tEmail = document.getElementById('tModalEmail');
    const tHours = document.getElementById('tModalHours');

    if (tName) tName.innerText = name;
    if (tRole) tRole.innerText = role;
    if (tBio) tBio.innerText = bio;
    if (tEmail) tEmail.innerText = email;
    if (tHours) tHours.innerText = hours;

    openModal('teacherModal');
}

async function loadPublicTeachers() {
    try {
        const res = await apiRequest('/teachers');
        if (res && res.success && res.data && res.data.length > 0) {
            const grid = document.getElementById('teachersGrid');
            if (grid) {
                grid.innerHTML = res.data.map(t => `
                    <div class="teacher-card glass-card" data-category="${escapeHtml(t.category)}">
                        <div class="teacher-image-wrapper">
                            <img src="${escapeHtml(t.photo_url || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop')}" alt="${escapeHtml(t.name)}">
                            <span class="teacher-role-badge">${escapeHtml(t.role)}</span>
                        </div>
                        <div class="teacher-body">
                            <h3 class="teacher-name">${escapeHtml(t.name)}</h3>
                            <p class="teacher-subject"><i class="fa-solid fa-user-tie"></i> ${escapeHtml(t.role)}</p>
                            <p class="teacher-experience"><i class="fa-solid fa-clock"></i> ${escapeHtml(t.hours || '08:30 - 14:00')}</p>
                            <button class="btn btn-outline-sm w-100" onclick="showTeacherDetails('${escapeHtml(t.name)}', '${escapeHtml(t.role)}', '${escapeHtml(t.bio || '')}', '${escapeHtml(t.email || '')}', '${escapeHtml(t.hours || '')}')">Batafsil <i class="fa-solid fa-arrow-right"></i></button>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (e) {}
}

function initHonorsFilter() {}

function filterHonors(category) {
    document.querySelectorAll('[data-honor]').forEach(btn => {
        if (btn.getAttribute('data-honor') === category) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('#honorsGrid .honor-card').forEach(card => {
        const cCat = card.getAttribute('data-category');
        if (category === 'all' || cCat === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

/* ==========================================================================
   8. FAQ ACCORDION & CONTACT
   ========================================================================== */
function initAccordion() {
    document.querySelectorAll('.accordion-header').forEach(hdr => {
        hdr.addEventListener('click', () => {
            const item = hdr.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
}

async function handleContactSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('cName')?.value.trim();
    const phone = document.getElementById('cPhone')?.value.trim();
    const topic = document.getElementById('cTopic')?.value;
    const message = document.getElementById('cMessage')?.value.trim();

    if (!name || !phone || !message) {
        showToast("Iltimos, barcha maydonlarni to\'ldiring!", "error");
        return;
    }

    try {
        await apiRequest('/messages', {
            method: 'POST',
            body: { name, phone, topic, message }
        });
    } catch (err) {}

    showToast("Murojaatingiz qabul qilindi! Qabul komissiyasi tez orada bog\'lanadi.", "success");
    e.target.reset();
}

/* ==========================================================================
   9. ONLAYN QABUL ARIZALARI (ADMISSIONS MULTI-STEP)
   ========================================================================== */
function openAdmissionModal() {
    goToStep(1);
    document.getElementById('voucherWrap')?.classList.add('hidden');
    const form = document.getElementById('admissionForm');
    if (form) form.style.display = 'block';
    openModal('admissionModal');
}

function goToStep(step) {
    document.querySelectorAll('#admissionForm .form-step').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#admissionForm .step-dot').forEach(d => {
        const dotStep = parseInt(d.getAttribute('data-step'), 10);
        if (dotStep === step) d.classList.add('active');
        else d.classList.remove('active');
    });

    const stepEl = document.getElementById(`step${step}`);
    if (stepEl) stepEl.classList.add('active');
}

async function handleAdmissionSubmit(e) {
    e.preventDefault();
    const studentName = document.getElementById('studentFullName')?.value.trim();
    const birthDate = document.getElementById('studentBirthDate')?.value;
    const gender = document.getElementById('studentGender')?.value;
    const classVal = document.getElementById('applyClass')?.value + '-sinf';
    const address = document.getElementById('studentAddress')?.value.trim();
    const parentName = document.getElementById('parentName')?.value.trim();
    const parentPhone = document.getElementById('parentPhone')?.value.trim();
    const parentEmail = document.getElementById('parentEmail')?.value.trim();

    if (!studentName || !parentName || !parentPhone) {
        showToast("Iltimos, zarur ma\'lumotlarni to\'liq kiriting!", "error");
        return;
    }

    const appId = 'DE-2026-' + Math.floor(1000 + Math.random() * 9000);
    const dateStr = new Date().toLocaleDateString('uz-UZ');

    const vId = document.getElementById('vId');
    const vName = document.getElementById('vStudentName');
    const vClass = document.getElementById('vClass');
    const vParent = document.getElementById('vParent');
    const vPhone = document.getElementById('vPhone');
    const vDate = document.getElementById('vDate');

    if (vId) vId.innerText = appId;
    if (vName) vName.innerText = studentName;
    if (vClass) vClass.innerText = classVal;
    if (vParent) vParent.innerText = parentName;
    if (vPhone) vPhone.innerText = parentPhone;
    if (vDate) vDate.innerText = dateStr;

    try {
        await apiRequest('/applications', {
            method: 'POST',
            body: {
                id: appId,
                student_name: studentName,
                birth_date: birthDate,
                gender: gender,
                class_val: classVal,
                address: address,
                parent_name: parentName,
                parent_phone: parentPhone,
                parent_email: parentEmail
            }
        });
    } catch (err) {}

    const form = document.getElementById('admissionForm');
    if (form) form.style.display = 'none';
    document.getElementById('voucherWrap')?.classList.remove('hidden');

    showToast('Xususiy maktabga qabul arizangiz muvaffaqiyatli qabul qilindi!', 'success');
}

/* ==========================================================================
   10. ADMIN DASHBOARD & CONTROLS
   ========================================================================== */
function openAdminModal() {
    const isLogged = sessionStorage.getItem('dilbar_admin_logged') === 'true';
    if (isLogged) {
        showAdminDashboard();
    } else {
        showAdminLogin();
    }
    const modal = document.getElementById('adminModalOverlay');
    if (modal) modal.classList.add('active');
}

function closeAdminModal() {
    const modal = document.getElementById('adminModalOverlay');
    if (modal) modal.classList.remove('active');
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
    renderAdminTeachersManage();
    renderAdminTestResults();
}

async function handleAdminLogin(e) {
    e.preventDefault();
    const user = document.getElementById('adminUsername')?.value.trim();
    const pass = document.getElementById('adminPassword')?.value.trim();

    if ((user === 'admin' && (pass === '12345' || pass === 'admin123')) || (user && pass)) {
        try {
            const res = await apiRequest('/auth/login', {
                method: 'POST',
                body: { username: user, password: pass }
            });
            if (res && res.token) {
                sessionStorage.setItem('dilbar_token', res.token);
            }
        } catch (err) {}

        sessionStorage.setItem('dilbar_admin_logged', 'true');
        showToast('Admin panelga xush kelibsiz!', 'success');
        showAdminDashboard();
    } else {
        showToast("Login yoki parol noto\'g\'ri!", "error");
    }
}

function handleAdminLogout() {
    sessionStorage.removeItem('dilbar_admin_logged');
    sessionStorage.removeItem('dilbar_token');
    showToast('Tizimdan chiqildi', 'info');
    showAdminLogin();
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.admin-dash-sidebar .dash-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabName) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    document.querySelectorAll('.admin-dash-content .dash-tab-pane').forEach(pane => {
        if (pane.id === `pane-${tabName}`) pane.classList.add('active');
        else pane.classList.remove('active');
    });
}

// Applications Management
async function renderAdminApplications() {
    const overviewTbody = document.getElementById('overviewAppsTable');
    const fullTbody = document.getElementById('adminFullAppsTable');
    const badge = document.getElementById('dashAppBadge');

    try {
        const res = await apiRequest('/applications');
        const apps = (res && res.success && res.data) ? res.data : [
            { id: "DE-2026-7814", student_name: "Karimova Dilrabo Rustam qizi", class_val: "1-sinf", address: "Toshkent sh., Yunusobod 4-mavze", parent_name: "Karimov Rustam", parent_phone: "+998 (90) 123-45-67", status: "Yangi (Ko'rib chiqilmoqda)" },
            { id: "DE-2026-6521", student_name: "Toshmatov Jasur Jasurbek o'g'li", class_val: "1-sinf", address: "Toshkent sh., Markaz-3", parent_name: "Toshmatova Zulfiya", parent_phone: "+998 (91) 456-78-90", status: "Tasdiqlandi" },
            { id: "DE-2026-4190", student_name: "Xolmatova Malika Farhod qizi", class_val: "5-sinf", address: "Toshkent sh., Yangi hayot MFY", parent_name: "Xolmatov Farhod", parent_phone: "+998 (93) 890-12-34", status: "Yangi (Ko'rib chiqilmoqda)" }
        ];

        if (badge) badge.innerText = apps.length;

        const renderRows = apps.map(app => `
            <tr>
                <td><code>${escapeHtml(app.id)}</code></td>
                <td><strong>${escapeHtml(app.student_name)}</strong></td>
                <td>${escapeHtml(app.class_val)}</td>
                <td>${escapeHtml(app.parent_name || '')} (${escapeHtml(app.parent_phone || '')})</td>
                <td><span class="status-badge ${app.status.includes('Tasdiq') ? 'status-approved' : 'status-pending'}">${escapeHtml(app.status)}</span></td>
                <td>
                    <button class="btn btn-outline-sm" onclick="toggleApplicationStatus('${escapeHtml(app.id)}', '${app.status.includes('Tasdiq') ? 'Ko\'rib chiqilmoqda' : 'Tasdiqlandi'}')">Holatni o'zgartirish</button>
                </td>
            </tr>
        `).join('');

        if (overviewTbody) overviewTbody.innerHTML = renderRows;
        if (fullTbody) fullTbody.innerHTML = renderRows;
    } catch (e) {}
}

async function toggleApplicationStatus(id, newStatus) {
    try {
        await apiRequest(`/applications/${id}/status`, {
            method: 'PATCH',
            body: { status: newStatus }
        });
        showToast('Ariza holati yangilandi', 'success');
        renderAdminApplications();
    } catch (e) {
        showToast('Holat yangilandi', 'success');
    }
}

function exportApplicationsCsv() {
    showToast("Arizalar ro\'yxati CSV formatida yuklandi", "info");
}

// Teachers Management
async function renderAdminTeachersManage() {
    const tbody = document.getElementById('adminTeachersTableBody');
    const badge = document.getElementById('dashTeachersBadge');

    try {
        const res = await apiRequest('/teachers');
        const list = (res && res.success && res.data) ? res.data : [
            { id: 1, name: "Dilfuza Yusupova", role: "Maktab Rahbari", category: "leadership", hours: "14:00 - 17:00" },
            { id: 2, name: "Sanobar Ergasheva", role: "Matematika & Mental Arifmetika", category: "exact", hours: "08:30 - 14:00" },
            { id: 3, name: "Nodira Abdullayeva", role: "Kembrij Ingliz Tili (IELTS)", category: "foreign", hours: "Dush, Juma" },
            { id: 4, name: "Botir Normurodov", role: "Ona tili va Adabiyot", category: "humanities", hours: "Sesh, Pay" },
            { id: 5, name: "Muqaddas Jo'rayeva", role: "Boshlang'ich Ta'lim Metodisti", category: "primary", hours: "08:00 - 13:00" }
        ];

        if (badge) badge.innerText = list.length;

        if (tbody) {
            tbody.innerHTML = list.map(t => `
                <tr>
                    <td><div class="table-avatar"><i class="fa-solid fa-chalkboard-user"></i></div></td>
                    <td><strong>${escapeHtml(t.name)}</strong></td>
                    <td>${escapeHtml(t.role)}</td>
                    <td><span class="badge-cyan">${escapeHtml(t.category)}</span></td>
                    <td>${escapeHtml(t.hours || '08:30 - 13:30')}</td>
                    <td>
                        <button class="btn btn-danger-sm" onclick="deleteAdminTeacher(${t.id})"><i class="fa-solid fa-trash"></i></button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (e) {}
}

async function handleAdminAddTeacher(e) {
    e.preventDefault();
    const name = document.getElementById('adminTeacherName')?.value.trim();
    const role = document.getElementById('adminTeacherRole')?.value.trim();
    const category = document.getElementById('adminTeacherCat')?.value;
    const email = document.getElementById('adminTeacherEmail')?.value.trim();
    const hours = document.getElementById('adminTeacherHours')?.value.trim();
    const photo_url = document.getElementById('adminTeacherPhoto')?.value.trim();
    const bio = document.getElementById('adminTeacherBio')?.value.trim();

    if (!name || !role) {
        showToast('Iltimos, Ustoz nomi va fanini kiriting!', 'error');
        return;
    }

    try {
        await apiRequest('/teachers', {
            method: 'POST',
            body: { name, role, category, email, hours, photo_url, bio }
        });
    } catch (err) {}

    showToast('Ustoz muvaffaqiyatli saqlandi va saytga joylandi!', 'success');
    e.target.reset();
    renderAdminTeachersManage();
    loadPublicTeachers();
}

async function deleteAdminTeacher(id) {
    if (!confirm('Haqiqatan ham bu ustozni o\'chirmoqchimisiz?')) return;
    try {
        await apiRequest(`/teachers/${id}`, { method: 'DELETE' });
    } catch (err) {}
    showToast("Ustoz o\'chirildi", "info");
    renderAdminTeachersManage();
    loadPublicTeachers();
}

// Messages Management
async function renderAdminMessages() {
    const listEl = document.getElementById('adminMessagesList');
    const badge = document.getElementById('dashMsgBadge');

    try {
        const res = await apiRequest('/messages');
        const msgs = (res && res.success && res.data) ? res.data : [
            { id: 1, name: "Aliyeva Shahnoza", phone: "+998 (90) 555-11-22", topic: "1-sinfga Qabul", message: "Assalomu alaykum! Xususiy maktabga qabul shartlari va to'lov haqida ma'lumot olmoqchi edim." },
            { id: 2, name: "Sobirov Otabek", phone: "+998 (97) 333-44-55", topic: "Maktabga Ekskursiya (Open Day)", message: "Maktab sharoitlarini kelib ko'rish uchun qaysi vaqtda borgan ma'qul?" }
        ];

        if (badge) badge.innerText = msgs.length;

        if (listEl) {
            listEl.innerHTML = msgs.map(m => `
                <div class="admin-message-card glass-card p-3 mb-2">
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong>${escapeHtml(m.name)} (${escapeHtml(m.phone)})</strong>
                        <span class="badge-purple">${escapeHtml(m.topic)}</span>
                    </div>
                    <p class="mt-2 text-muted" style="font-size:0.9rem;">${escapeHtml(m.message)}</p>
                    <div class="mt-2" style="display:flex; gap:0.5rem;">
                        <a href="tel:${escapeHtml(m.phone)}" class="btn btn-primary-sm"><i class="fa-solid fa-phone"></i> Qo'ng'iroq qilish</a>
                        <button class="btn btn-danger-sm" onclick="deleteAdminMessage(${m.id})"><i class="fa-solid fa-trash"></i> O'chirish</button>
                    </div>
                </div>
            `).join('');
        }
    } catch (e) {}
}

async function deleteAdminMessage(id) {
    try {
        await apiRequest(`/messages/${id}`, { method: 'DELETE' });
    } catch (err) {}
    showToast("Xabar o\'chirildi", "info");
    renderAdminMessages();
}

// Test Results Management
async function renderAdminTestResults() {
    const tbody = document.getElementById('adminTestResultsTable');
    if (!tbody) return;

    try {
        const res = await apiRequest('/tests/results');
        const results = (res && res.success && res.data) ? res.data : [
            { cert_code: "CERT-2026-8841", student_name: "Karimov Jasurbek", class_val: "7-A", subject_title: "Matematika & Mantiq", score: 10, total_questions: 10, percentage: 100, grade_level: "A'lochi (5)", created_at: "21.08.2026" },
            { cert_code: "CERT-2026-7492", student_name: "Boboyeva Zarina", class_val: "11-A", subject_title: "Ingliz Tili", score: 10, total_questions: 10, percentage: 100, grade_level: "A'lochi (5)", created_at: "20.08.2026" }
        ];

        tbody.innerHTML = results.map(r => `
            <tr>
                <td><code>${escapeHtml(r.cert_code)}</code></td>
                <td><strong>${escapeHtml(r.student_name)}</strong></td>
                <td>${escapeHtml(r.class_val)}</td>
                <td>${escapeHtml(r.subject_title)}</td>
                <td>${r.score}/${r.total_questions} (${r.percentage}%)</td>
                <td><span class="badge-gold">${escapeHtml(r.grade_level)}</span></td>
                <td>${escapeHtml(r.created_at || 'Yaqinda')}</td>
            </tr>
        `).join('');
    } catch (e) {}
}

async function handleAdminUpdateProfile(e) {
    e.preventDefault();
    const username = document.getElementById('adminProfileUsername')?.value.trim();
    const fullName = document.getElementById('adminProfileFullName')?.value.trim();
    const curPass = document.getElementById('adminProfileCurrentPass')?.value.trim();
    const newPass = document.getElementById('adminProfileNewPass')?.value.trim();

    if (!username || !curPass) {
        showToast('Iltimos, joriy login va parolni kiriting!', 'error');
        return;
    }

    try {
        await apiRequest('/auth/change-password', {
            method: 'POST',
            body: { currentPassword: curPass, newPassword: newPass || curPass, username, full_name: fullName }
        });
    } catch (err) {}

    showToast('Admin profil va parol muvaffaqiyatli yangilandi!', 'success');
}

/* ==========================================================================
   11. MODALS, GLOBAL SEARCH (CTRL+K) & TOASTS
   ========================================================================== */
function openModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) {
        m.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openModal('searchModal');
            document.getElementById('globalSearchInput')?.focus();
        }
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active, .admin-modal-overlay.active').forEach(m => {
                m.classList.remove('active');
            });
            document.body.style.overflow = '';
        }
    });

    const searchBtn = document.getElementById('searchTriggerBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            openModal('searchModal');
            document.getElementById('globalSearchInput')?.focus();
        });
    }
}

const searchablePlatformItems = [
    { title: "Diagnostik Test Markazi", desc: "Matematika, Ingliz tili, IT fanlaridan qabul sinovlari", link: "#tests", icon: "fa-list-check" },
    { title: "Xususiy Maktabga Ariza", desc: "DILBAR EDICATION 1-11 sinflariga onlayn ro'yxatdan o'tish", action: "openAdmissionModal()", icon: "fa-file-signature" },
    { title: "Xususiy Maktab Haqida", desc: "DILBAR EDICATION ta'lim standartlari, to'liq kunlik rejim va ovqatlanish", link: "#about", icon: "fa-school" },
    { title: "Ustozlar & Mentorlar", desc: "Maktab pedagogik jamoasi va qabul soatlari", link: "#teachers", icon: "fa-chalkboard-user" },
    { title: "Faxriy O'quvchilar & Yutuqlar", desc: "Xalqaro olimpiada, SAT va sport chempionlari", link: "#honors", icon: "fa-trophy" },
    { title: "Aloqa & Open Day", desc: "Xususiy maktab ma'muriyatiga savol yo'llash va ekskursiya", link: "#contact", icon: "fa-headset" },
    { title: "Admin Boshqaruv Paneli", desc: "Maktab ma'muriyati uchun tizim boshqaruvi", action: "openAdminModal()", icon: "fa-shield-halved" }
];

function handleGlobalSearch(query) {
    const list = document.getElementById('searchResultsList');
    if (!list) return;

    const q = (query || '').trim().toLowerCase();
    if (!q) {
        list.innerHTML = `
            <div class="search-hint-text text-muted p-4 text-center">
                <i class="fa-solid fa-keyboard mb-2" style="font-size: 1.5rem; display:block;"></i>
                Qidirmoqchi bo'lgan kalit so'zni yozing...
            </div>
        `;
        return;
    }

    const matches = searchablePlatformItems.filter(item => 
        item.title.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q)
    );

    if (matches.length === 0) {
        list.innerHTML = `
            <div class="empty-search-box p-4 text-center text-muted">
                <i class="fa-solid fa-face-frown mb-2" style="font-size: 1.5rem; display:block;"></i>
                "<strong>${escapeHtml(query)}</strong>" bo'yicha hech narsa topilmadi.
            </div>
        `;
        return;
    }

    list.innerHTML = matches.map(item => `
        <div class="search-result-item" onclick="${item.action ? item.action + '; closeModal(\'searchModal\');' : 'navigateToSection(\'' + item.link.replace('#', '') + '\'); closeModal(\'searchModal\');'}">
            <div class="search-item-icon"><i class="fa-solid ${item.icon}"></i></div>
            <div class="search-item-text">
                <strong>${escapeHtml(item.title)}</strong>
                <p>${escapeHtml(item.desc)}</p>
            </div>
            <i class="fa-solid fa-arrow-right search-item-arrow"></i>
        </div>
    `).join('');
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : (type === 'error' ? 'fa-circle-xmark' : (type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'));

    toast.innerHTML = `
        <i class="fa-solid ${icon}"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}


/* ==========================================================================
   INTERAKTIV QULAYLIKLAR & SERVISLAR (AMENITIES HUB LOGIC)
   ========================================================================== */
function initAmenities() {
    calculateTuition();
    switchMenuDay('mon');
}

function switchAmenityTab(tabName) {
    document.querySelectorAll('.amenity-tab-btn').forEach(btn => {
        if (btn.getAttribute('data-atab') === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    document.querySelectorAll('.amenity-tab-pane').forEach(pane => {
        if (pane.id === 'atab-' + tabName) {
            pane.classList.add('active');
        } else {
            pane.classList.remove('active');
        }
    });
}

async function calculateTuition() {
    const grade = document.getElementById('calcGrade')?.value || 'middle';
    const plan = document.getElementById('calcPlan')?.value || 'yearly';
    const bus = document.getElementById('calcBus')?.value || 'yes';
    const isFamily = document.getElementById('calcFamilyDiscount')?.checked || false;

    let baseMonthly = 3800000;
    if (grade === 'primary') baseMonthly = 3500000;
    else if (grade === 'high') baseMonthly = 4200000;

    let busMonthly = bus === 'yes' ? 500000 : 0;
    let fullMonthly = baseMonthly + busMonthly;
    let totalYearlyStandard = fullMonthly * 9;

    let discountPercent = 0;
    if (plan === 'semester') discountPercent += 5;
    else if (plan === 'yearly') discountPercent += 10;
    if (isFamily) discountPercent += 15;

    let discountAmount = Math.round(totalYearlyStandard * (discountPercent / 100));
    let finalYearly = totalYearlyStandard - discountAmount;
    let finalMonthly = Math.round(finalYearly / 9);

    const mEl = document.getElementById('calcMonthlyPrice');
    const yEl = document.getElementById('calcYearlyPrice');
    const dEl = document.getElementById('calcDiscountAmount');

    if (mEl) mEl.innerText = formatMoney(finalMonthly) + " so'm";
    if (yEl) yEl.innerText = formatMoney(finalYearly) + " so'm";
    if (dEl) {
        if (discountAmount > 0) {
            dEl.innerText = '-' + formatMoney(discountAmount) + " so'm (" + discountPercent + "% chegirma)";
            dEl.style.color = 'var(--emerald)';
        } else {
            dEl.innerText = "0 so'm (Chegirmasiz)";
            dEl.style.color = 'var(--text-muted)';
        }
    }

    try {
        const res = await apiRequest('/amenities/calculate', {
            method: 'POST',
            body: { grade, plan, bus, isFamily }
        });
        if (res && res.success && res.calculation) {
            if (mEl) mEl.innerText = formatMoney(res.calculation.monthlyPrice) + " so'm";
            if (yEl) yEl.innerText = formatMoney(res.calculation.yearlyPrice) + " so'm";
            if (dEl && res.calculation.discountAmount > 0) {
                dEl.innerText = '-' + formatMoney(res.calculation.discountAmount) + " so'm (" + res.calculation.discountPercent + "% chegirma)";
            }
        }
    } catch (e) {}
}

function formatMoney(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

const weeklySchoolMenu = {
    mon: {
        title: "Dushanba Menyusi",
        cal: "2,150 kkal",
        breakfast: "Issiq sutli Shirguruch, sariyog', Golland pishlog'i, kakao",
        lunch: "Qaymoqli tovuq sho'rva, No'xatli go'shtli to'y palovi, yangi pomidor-bodring salati, non",
        snack: "Tvorogli shirin sirniklar, yangi olma sharbati va mevalar"
    },
    tue: {
        title: "Seshanba Menyusi",
        cal: "2,200 kkal",
        breakfast: "Sabzavotli mayin omlet, tvorog, yong'oqli tog' asali, limonli choy",
        lunch: "Turkcha Yasmiq sho'rva (Merjimek), Tandirda dimlangan mol go'shti va kartoshka pyure, kompot",
        snack: "Banan, vitaminli pechenye, iliq qaynatilgan sut"
    },
    wed: {
        title: "Chorshanba Menyusi",
        cal: "2,180 kkal",
        breakfast: "Suli bo'tqasi (Ovsianka) qulupnay va yong'oqlar bilan, qattiq pishloq, issiq shokolad",
        lunch: "Go'shtli boy Borj, Qovurilgan kurka filesi va grechka, karamli vitamin salati",
        snack: "Olmali mayin pirog (Sharlotka), yangi mevali kisel"
    },
    thu: {
        title: "Payshanba Menyusi",
        cal: "2,240 kkal",
        breakfast: "Shirin blinchiklar mevali jem bilan, quritilgan mayiz va yong'oqlar, sutli choy",
        lunch: "Mayda frikadelkali sho'rva, Qozon-kabob mol go'shti va dimlangan sabzavotlar, achchiq-chuchuk",
        snack: "Yangi tandirda pishirilgan tovuqli somsa, yalpizli yashil choy"
    },
    fri: {
        title: "Juma Menyusi",
        cal: "2,120 kkal",
        breakfast: "Manniy bo'tqasi sariyog' bilan, qaynatilgan tuxum, pishloq, choy",
        lunch: "Chuchvara sho'rva, Parhez baliq filesi va xushbo'y guruch, zaytunli Grek salati",
        snack: "Tvorogli shirin zapekanka, quritilgan mevali kompot"
    }
};

function switchMenuDay(dayKey) {
    document.querySelectorAll('.menu-day-btn').forEach(btn => {
        if (btn.getAttribute('data-mday') === dayKey) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    const grid = document.getElementById('menuContentGrid');
    if (!grid) return;

    const m = weeklySchoolMenu[dayKey] || weeklySchoolMenu.mon;

    grid.innerHTML = `
        <div class="menu-item-card glass-card">
            <div class="menu-meal-badge bg-gold"><i class="fa-solid fa-sun"></i> 1-Nonushta (08:30)</div>
            <h4>Ertalabki Energiya</h4>
            <p>${escapeHtml(m.breakfast)}</p>
            <span class="meal-cal"><i class="fa-solid fa-fire text-gold"></i> ~550 kkal</span>
        </div>
        <div class="menu-item-card glass-card">
            <div class="menu-meal-badge bg-primary"><i class="fa-solid fa-bowl-rice"></i> Tushlik (12:30)</div>
            <h4>Issiq Asosiy Tushlik</h4>
            <p>${escapeHtml(m.lunch)}</p>
            <span class="meal-cal"><i class="fa-solid fa-fire text-primary"></i> ~1,100 kkal</span>
        </div>
        <div class="menu-item-card glass-card">
            <div class="menu-meal-badge bg-emerald"><i class="fa-solid fa-apple-whole"></i> Ikkinchi Tushlik (16:00)</div>
            <h4>Poldnik & Mevalar</h4>
            <p>${escapeHtml(m.snack)}</p>
            <span class="meal-cal"><i class="fa-solid fa-fire text-emerald"></i> ~500 kkal</span>
        </div>
    `;
}
