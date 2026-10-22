const db = require('../config/database');

const aiController = {
    ask: (req, res, next) => {
        try {
            const { query, mode, history } = req.body;
            if (!query || typeof query !== 'string') {
                return res.status(400).json({ success: false, message: "Savol matni kiritilmadi!" });
            }

            const rawQuery = query.trim();
            const q = rawQuery.toLowerCase();
            const currentMode = mode || 'school';

            // =========================================================================
            // 1. INTERACTIVE QUIZ & VIKTORINA (QUIZ ENGINE)
            // =========================================================================
            if (currentMode === 'quiz' || q.includes('test tuz') || q.includes('test ber') || q.includes('savol ber') || q.includes('viktorina')) {
                const questionsPool = [
                    {
                        q: "Matematika: 2x + 10 = 30 tenglamasida x ning qiymati nechaga teng?",
                        opts: ["x = 10", "x = 15", "x = 20", "x = 5"],
                        correct: 0,
                        exp: "2x = 30 - 10 → 2x = 20 → x = 10."
                    },
                    {
                        q: "Ingliz tili: 'She ___ to school every day' gapidagi bo'sh joyga qaysi fe'l to'g'ri keladi?",
                        opts: ["goes", "go", "gone", "going"],
                        correct: 0,
                        exp: "Present Simple zamonida 'she' olmoshi bilan fe'lga '-es' qo'shiladi (goes)."
                    },
                    {
                        q: "Informatika: HTML tilida sahifadagi eng katta sarlavha qaysi teg orqali yoziladi?",
                        opts: ["<h1>", "<head>", "<h6>", "<title>"],
                        correct: 0,
                        exp: "<h1> tegi HTML dagi 1-darajali eng katta sarlavhani bildiradi."
                    },
                    {
                        q: "O'zbekiston Tarixi: Amir Temur qaysi yilda tavallud topgan?",
                        opts: ["1336-yil 9-aprel", "1441-yil 9-fevral", "1370-yil 1-may", "1494-yil 14-fevral"],
                        correct: 0,
                        exp: "Sohibqiron Amir Temur 1336-yil 9-aprelda Kesh (Shahrisabz) yaqinidagi Xo'ja Ilg'or qishlog'ida tug'ilgan."
                    },
                    {
                        q: "Fizika: Zanjir qismidagi elektr kuchlanishi qaysi asbob orqali o'lchanadi?",
                        opts: ["Voltmetr", "Ampermetr", "Termometr", "Barometr"],
                        correct: 0,
                        exp: "Elektr kuchlanishi Voltmetr asbobi orqali o'lchanadi."
                    },
                    {
                        q: "Ona Tili: O'zbek tilida nechta kelishik mavjud?",
                        opts: ["6 ta", "4 ta", "8 ta", "5 ta"],
                        correct: 0,
                        exp: "O'zbek tilida 6 ta kelishik bor: Bosh, Qaratqich, Tushum, Jo'nalish, O'rin-payt, Chiqish."
                    },
                    {
                        q: "Kimyo: Suvning kimyoviy formulasi qanday?",
                        opts: ["H₂O", "CO₂", "NaCl", "H₂SO₄"],
                        correct: 0,
                        exp: "Suv ikki vodorod va bir kislorod atomidan tashkil topgan (H₂O)."
                    }
                ];

                let filtered = questionsPool;
                if (q.includes('ingliz')) {
                    filtered = questionsPool.filter(item => item.q.includes('Ingliz'));
                } else if (q.includes('tarix')) {
                    filtered = questionsPool.filter(item => item.q.includes('Tarix'));
                } else if (q.includes('fizika')) {
                    filtered = questionsPool.filter(item => item.q.includes('Fizika'));
                } else if (q.includes('matematika')) {
                    filtered = questionsPool.filter(item => item.q.includes('Matematika'));
                }

                const randomQuiz = (filtered.length > 0 ? filtered : questionsPool)[Math.floor(Math.random() * (filtered.length > 0 ? filtered : questionsPool).length)];
                const quizId = 'q_srv_' + Math.floor(Math.random() * 100000);

                return res.json({
                    success: true,
                    mode: 'quiz',
                    quizData: { id: quizId, ...randomQuiz },
                    html: `
                        <h4>⚡ Tezkor AI Viktorina Sinovi</h4>
                        <div class="ai-quiz-card" id="quizCard-${quizId}">
                            <div class="ai-quiz-q-title">❓ ${randomQuiz.q}</div>
                            <div class="ai-quiz-options-list">
                                ${randomQuiz.opts.map((opt, optIdx) => `
                                    <button class="ai-quiz-opt-btn" onclick="handleAiQuizAnswer('${quizId}', ${optIdx})">
                                        <strong>${String.fromCharCode(65 + optIdx)})</strong> ${escapeHtml(opt)}
                                    </button>
                                `).join('')}
                            </div>
                            <div id="quizFeedback-${quizId}"></div>
                        </div>
                    `,
                    actions: [
                        { text: "Yana yangi savol olish", action: "askAiQuestion('Menga yana test savoli ber')", icon: "fa-bolt" },
                        { text: "Onlayn Test Markaziga O'tish", action: "closeModal('aiChatModal'); location.href='#tests';", icon: "fa-list-check" }
                    ]
                });
            }

            // =========================================================================
            // 2. ESSAYS & INSHO GENERATOR (HIGH PRIORITY)
            // =========================================================================
            if (currentMode === 'essay' || q.includes('insho') || q.includes('esse') || q.includes('reja tuz') || q.includes('matn yoz')) {
                let topicTitle = "Vatanparvarlik — Oliy Burchimiz";
                let epigraph = "\"Ona yerga mehr — iymondandir\"";
                let plan1 = "Vatan tushunchasi va inson hayotidagi muqaddas o'rni";
                let plan2 = "O'zbekistonning boy tarixi, allomalar jasorati va yoshlarning ta'limdagi mas'uliyati";
                let plan3 = "Vatan taraqqiyotiga hissa qo'shish va uni ko'z qorachig'idek asrash";
                let sampleText = "Vatan — har bir inson uchun dunyodagi eng aziz va tabarruk dargohdir. Kindik qoni to'kilgan tuproq, ota-ona mehri va ona tili tarannumi inson qalbida vatanparvarlik tuyg'usini uyg'otadi.<br><br>Bugungi kunda DILBAR EDICATION innovatsion akademiyasi o'quvchilari sifatida bizning asosiy burchimiz — chuqur bilim olish, zamonaviy axborot texnologiyalari va xorijiy tillarni puxta egallashdir. Zero, buyuk ajdodlarimiz Al-Xorazmiy, Ibn Sino va Amir Temur kabi allomalarning munosib vorisi bo'lish Vatan oldidagi yuksak burchimizdir.";

                if (q.includes('ustoz') || q.includes('oqituvchi') || q.includes('o\'qituvchi')) {
                    topicTitle = "Ustoz — Otangdek Ulug'";
                    epigraph = "\"Ustoz ko'rmagan shogird har maqomga yo'rg'alar\"";
                    plan1 = "Ustozlik kasbining ulug'vorligi va jamiyatdagi yuksak o'rni";
                    plan2 = "O'qituvchining sabr-toqati, bizga harf tanitgani va qalbimizga ilm nurlarini sochgani";
                    plan3 = "Ustozlarga doimiy ehtirom va minnatdorchilik bildirish";
                    sampleText = "Insoniyat taraqqiyotining asosiy poydevori ustozlar mehnati bilan chambarchas bog'liqdir. Maktabimizdagi har bir o'qituvchi o'z vaqtini, qalbidagi mehrini va bilimini o'quvchilarga baxshida etadi.<br><br>Ular nafaqat fanlarni o'rgatadi, balki bizni komil inson, odobli va vatanparvar shaxs bo'lib voyaga yetishimizda yo'lchi yulduz vazifasini bajaradi.";
                } else if (q.includes('kitob') || q.includes('ilm')) {
                    topicTitle = "Kitob — Aql Chirog'i va Bilim Bulog'i";
                    epigraph = "\"Kitob o'qigan inson hech qachon yengilmaydi\"";
                    plan1 = "Kitobning inson ma'naviy dunyosini boyitishdagi ahamiyati";
                    plan2 = "Kitob o'qish orqali tafakkurning kengayishi, so'z boyligining oshishi";
                    plan3 = "Raqamli zamonda ham kitobxonlik madaniyatini saqlash";
                    sampleText = "Kitob — insoniyat tafakkurining eng buyuk mo'jizasidir. U bizni o'tmish allomalari bilan sirlashishga, olam sirlarini kashf etishga va komillik sari yetaklaydi. DILBAR EDICATION ta'lim tizimi yordamida har bir o'quvchi o'zbek va jahon adabiyoti durdonalarini o'qib, o'z bilimini boyitishi mumkin.";
                } else if (q.includes('ona tili') || q.includes('til')) {
                    topicTitle = "Ona Tili — Millatning Ruhi va G'ururi";
                    epigraph = "\"Ona tilim — jon-u dilim\"";
                    plan1 = "Ona tilining milliy o'zlikni anglashdagi o'rni";
                    plan2 = "O'zbek tilining boyligi, Navoiy va Bobur merosi";
                    plan3 = "Davlat tiliga hurmat va uni toza saqlash";
                    sampleText = "Ona tili — har bir millatning ruhi, g'ururi va uning mavjudlik timsolidir. O'zbek tili — boy, ohangdor va ifodali tildir. Alisher Navoiy bobomiz o'z asarlari bilan ona tilimizning qudratini butun dunyoga namoyon etganlar.";
                } else if (q.includes('tabiat') || q.includes('ekologiya')) {
                    topicTitle = "Ona Tabiatni Asrash — Barchamizning Burchimiz";
                    epigraph = "\"Tabiatni asrash — hayotni asrash demakdir\"";
                    plan1 = "Tabiat va inson o'rtasidagi uzviy bog'liqlik";
                    plan2 = "Ekologik muammolar va atrof-muhitni toza tutish choralari";
                    plan3 = "Maktabimizda yashil hududlarni ko'paytirish va tabiatni sevish";
                    sampleText = "Tabiat — bizning umumiy uyimizdir. Toza havo, zilol suv va yashil daraxtlar inson salomatligi hamda go'zal hayotining garovidir. Biz tabiat boyliklarini tejab-tergab ishlatishimiz va ekologik madaniyatni shakllantirishimiz zarur.";
                } else if (q.includes('sun\'iy intellekt') || q.includes('ai') || q.includes('it') || q.includes('texnologiya')) {
                    topicTitle = "Sun'iy Intellekt va Kelajak Texnologiyalari";
                    epigraph = "\"Ilm-fan va texnologiya — taraqqiyot poydevori\"";
                    plan1 = "Raqamli asrda Sun'iy Intellektning (AI) roli va rivojlanishi";
                    plan2 = "AIning ta'lim, tibbiyot va kundalik hayotdagi afzalliklari";
                    plan3 = "Yoshlarning zamonaviy dasturlash va IT bilimlarini egallashdagi vazifalari";
                    sampleText = "XXI asr — axborot texnologiyalari va sun'iy intellekt asridir. Bugungi kunda AI nafaqat murakkab masalalarni soniyalar ichida yechmoqda, balki ta'lim tizimida o'quvchilarga individual yordamchi bo'lib xizmat qilmoqda.";
                }

                return res.json({
                    success: true,
                    mode: 'essay',
                    html: `
                        <h4>✍️ Namunaviy Insho: "${topicTitle}"</h4>
                        <div class="math-card">
                            <div class="math-formula-title">📋 Insho Rejasi:</div>
                            <div class="math-step-row">1. <strong>Kirish (10-15%):</strong> ${plan1}</div>
                            <div class="math-step-row">2. <strong>Asosiy Qism (70-80%):</strong> ${plan2}</div>
                            <div class="math-step-row">3. <strong>Xulosa (10-15%):</strong> ${plan3}</div>
                            <div class="math-step-row" style="margin-top: 0.3rem; font-style: italic; color: var(--secondary);">✨ Epigraf: ${epigraph}</div>
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 0.85rem; border-radius: 8px; border-left: 3px solid var(--secondary); margin-top: 0.5rem; font-size: 0.88rem; line-height: 1.65;">
                            <strong>Namunaviy Matn:</strong><br>
                            ${sampleText}
                        </div>
                    `,
                    actions: [
                        { text: "Boshqa Mavzuda Insho Yozish", action: "askAiQuestion('Menga Kitobxonlik haqida insho yozib ber')", icon: "fa-pen-nib" }
                    ]
                });
            }

            // =========================================================================
            // 3. MATHEMATICS, ALGEBRA & ARITHMETIC (STEM SOLVER)
            // =========================================================================

            // A. Quadratic Equations (ax^2 + bx + c = 0)
            const quadMatch = q.match(/([+-]?\s*\d*)\s*x\s*\^?2\s*([+-]\s*\d*)\s*x\s*([+-]\s*\d+)\s*=\s*0/i) ||
                              q.match(/x\^2\s*-\s*5x\s*\+\s*6\s*=\s*0/i);
            if (quadMatch || q.includes('kvadrat tenglama') || (q.includes('x^2') && q.includes('='))) {
                let a = 1, b = -5, c = 6;
                const clean = rawQuery.replace(/\s+/g, '');
                const m = clean.match(/([+-]?\d*)x\^?2([+-]?\d*)x([+-]?\d+)=0/i);
                if (m) {
                    a = m[1] === '' || m[1] === '+' ? 1 : (m[1] === '-' ? -1 : parseFloat(m[1]));
                    b = m[2] === '' || m[2] === '+' ? 1 : (m[2] === '-' ? -1 : parseFloat(m[2]));
                    c = parseFloat(m[3]);
                }

                const D = (b * b) - (4 * a * c);
                let rootsHtml = '';
                if (D > 0) {
                    const x1 = ((-b + Math.sqrt(D)) / (2 * a)).toFixed(2);
                    const x2 = ((-b - Math.sqrt(D)) / (2 * a)).toFixed(2);
                    rootsHtml = `
                        <div class="math-step-row">• <strong>Diskriminant (D):</strong> <code>D = b² - 4ac = (${b})² - 4·(${a})·(${c}) = ${b*b} - ${4*a*c} = ${D}</code></div>
                        <div class="math-step-row">• <code>D > 0</code> bo'lgani uchun tenglama <strong>2 ta haqiqiy ildizga ega</strong>:</div>
                        <div class="math-step-row">• <code>x₁ = (-b + √D) / (2a) = (${-b} + ${Math.sqrt(D).toFixed(2)}) / (${2*a}) = <strong>${x1}</strong></code></div>
                        <div class="math-step-row">• <code>x₂ = (-b - √D) / (2a) = (${-b} - ${Math.sqrt(D).toFixed(2)}) / (${2*a}) = <strong>${x2}</strong></code></div>
                        <div class="math-result-highlight" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 0.5rem; border-radius: 6px; margin-top: 0.4rem; color: #34d399;">
                            ✅ <strong>Javob:</strong> x₁ = ${x1}, x₂ = ${x2}
                        </div>
                    `;
                } else if (D === 0) {
                    const x = (-b / (2 * a)).toFixed(2);
                    rootsHtml = `
                        <div class="math-step-row">• <strong>Diskriminant (D):</strong> <code>D = b² - 4ac = ${D}</code></div>
                        <div class="math-step-row">• <code>D = 0</code> bo'lgani uchun tenglama <strong>1 ta karrali ildizga ega</strong>:</div>
                        <div class="math-step-row">• <code>x = -b / (2a) = (${-b}) / (${2*a}) = <strong>${x}</strong></code></div>
                        <div class="math-result-highlight" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 0.5rem; border-radius: 6px; margin-top: 0.4rem; color: #34d399;">
                            ✅ <strong>Javob:</strong> x = ${x}
                        </div>
                    `;
                } else {
                    rootsHtml = `
                        <div class="math-step-row">• <strong>Diskriminant (D):</strong> <code>D = b² - 4ac = ${D}</code></div>
                        <div class="math-step-row">• <code>D < 0</code> bo'lgani uchun tenglama <strong>haqiqiy sonlar to'plamida ildizga ega emas</strong> (kompleks ildizlarga ega).</div>
                        <div class="math-result-highlight" style="background: rgba(239,68,68,0.15); border: 1px solid #ef4444; padding: 0.5rem; border-radius: 6px; margin-top: 0.4rem; color: #f87171;">
                            ⚠️ Haqiqiy ildizlar mavjud emas (D < 0)
                        </div>
                    `;
                }

                const vertexX = (-b / (2 * a)).toFixed(2);
                const vertexY = (a * vertexX * vertexX + b * vertexX + c).toFixed(2);

                return res.json({
                    success: true,
                    mode: 'math',
                    html: `
                        <h4>🧮 Kvadrat Tenglamaning Qadam-ba-Qadam Yechimi</h4>
                        <p>Berilgan tenglama: <code>${a !== 1 ? a : ''}x² ${b >= 0 ? '+' + b : b}x ${c >= 0 ? '+' + c : c} = 0</code></p>
                        <div class="math-card">
                            <div class="math-formula-title">Koeffitsiyentlar: a = ${a}, b = ${b}, c = ${c}</div>
                            ${rootsHtml}
                            <div class="math-step-row" style="margin-top: 0.5rem; font-size: 0.8rem; color: var(--text-muted);">
                                📍 Parabola uchining koordinatalari: <code>V(${vertexX}; ${vertexY})</code>
                            </div>
                        </div>
                    `,
                    actions: [
                        { text: "Matematika Testiga O'tish", action: "startTestExam('math'); closeModal('aiChatModal');", icon: "fa-calculator" }
                    ]
                });
            }

            // B. Linear Equations (ax + b = c)
            const linMatch = q.match(/([+-]?\s*\d*)\s*x\s*([+-]\s*\d+)\s*=\s*([+-]?\s*\d+)/i);
            if (linMatch && !q.includes('^2')) {
                const aStr = linMatch[1].replace(/\s+/g, '');
                const a = aStr === '' || aStr === '+' ? 1 : (aStr === '-' ? -1 : parseFloat(aStr));
                const b = parseFloat(linMatch[2].replace(/\s+/g, ''));
                const c = parseFloat(linMatch[3].replace(/\s+/g, ''));
                const step1 = c - b;
                const x = (step1 / a).toFixed(2);

                return res.json({
                    success: true,
                    mode: 'math',
                    html: `
                        <h4>⚖️ Chiziqli Tenglama Yechimi</h4>
                        <p>Berilgan tenglama: <code>${a !== 1 ? a : ''}x ${b >= 0 ? '+' + b : b} = ${c}</code></p>
                        <div class="math-card">
                            <div class="math-formula-title">Bosqichma-bosqich yechish:</div>
                            <div class="math-step-row">1. Ozod hadni o'ng tomonga qarama-qarshi ishora bilan o'tkazamiz:</div>
                            <div class="math-step-row"><code>${a}x = ${c} - (${b})</code> → <code>${a}x = ${step1}</code></div>
                            <div class="math-step-row">2. Ikkala tomonni x ning oldidagi koeffitsiyent (${a}) ga bo'lamiz:</div>
                            <div class="math-step-row"><code>x = ${step1} / ${a}</code></div>
                            <div class="math-result-highlight" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 0.5rem; border-radius: 6px; margin-top: 0.4rem; color: #34d399;">
                                ✅ <strong>Javob:</strong> x = ${x}
                            </div>
                        </div>
                    `,
                    actions: [
                        { text: "Matematika Testini Boshlash", action: "startTestExam('math'); closeModal('aiChatModal');", icon: "fa-play" }
                    ]
                });
            }

            // C. Arithmetic & Percentage & Square Root Solver
            const isArithmetic = /^[\d\s\+\-\*\/\^\(\)\.\%]+$/.test(q.replace(/(hisobla|yech|javobi|teng|ildiz|sqrt|foiz|of|dan)/g, '').trim()) &&
                                 /[\+\-\*\/\^\%]/.test(q);
            if (isArithmetic || q.includes('sqrt') || q.includes('ildiz') || q.includes('foiz') || q.includes('hisobla')) {
                // Percentage calculation
                const percentMatch = q.match(/(\d+(?:\.\d+)?)\s*%\s*(?:of|dan)?\s*(\d+(?:\.\d+)?)/i) ||
                                     q.match(/(\d+(?:\.\d+)?)\s*(?:ning)?\s*(\d+(?:\.\d+)?)\s*%\s*(?:i|qismi)?/i);
                if (percentMatch) {
                    const p = parseFloat(percentMatch[1]);
                    const val = parseFloat(percentMatch[2]);
                    const resVal = (p / 100) * val;
                    return res.json({
                        success: true,
                        mode: 'math',
                        html: `
                            <h4>🔢 Foiz Hisoblash</h4>
                            <div class="math-card">
                                <div class="math-step-row">• <strong>Savol:</strong> ${val} ning ${p}% qismi</div>
                                <div class="math-step-row">• <strong>Formula:</strong> <code>(${val} × ${p}) / 100</code></div>
                                <div class="math-result-highlight" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 0.5rem; border-radius: 6px; margin-top: 0.4rem; color: #34d399;">
                                    ✅ <strong>Natija:</strong> ${resVal}
                                </div>
                            </div>
                        `,
                        actions: [
                            { text: "Matematika Testi", action: "startTestExam('math'); closeModal('aiChatModal');", icon: "fa-calculator" }
                        ]
                    });
                }

                // Square root
                const sqrtMatch = q.match(/(?:sqrt|ildiz)\s*\(?(\d+(?:\.\d+)?)\)?/i);
                if (sqrtMatch) {
                    const num = parseFloat(sqrtMatch[1]);
                    const resVal = Math.sqrt(num);
                    return res.json({
                        success: true,
                        mode: 'math',
                        html: `
                            <h4>🔢 Kvadrat Ildiz</h4>
                            <div class="math-card">
                                <div class="math-step-row">• <code>√${num} = ${resVal}</code></div>
                                <div class="math-result-highlight" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 0.5rem; border-radius: 6px; margin-top: 0.4rem; color: #34d399;">
                                    ✅ <strong>Natija:</strong> ${resVal} (chunki ${resVal}² = ${num})
                                </div>
                            </div>
                        `,
                        actions: [
                            { text: "Matematika Testi", action: "startTestExam('math'); closeModal('aiChatModal');", icon: "fa-calculator" }
                        ]
                    });
                }

                // Safe arithmetic evaluation
                try {
                    let expr = q.replace(/(hisobla|yech|javobi|teng|necha|bo'ladi|chiqadi)/gi, '').trim();
                    expr = expr.replace(/\^/g, '**');
                    const sanitized = expr.replace(/[^0-9\+\-\*\/\.\(\)\s\*]/g, '');
                    if (sanitized) {
                        const result = Function('"use strict"; return (' + sanitized + ')')();
                        if (!isNaN(result) && isFinite(result)) {
                            return res.json({
                                success: true,
                                mode: 'math',
                                html: `
                                    <h4>🧮 Hisoblash Natijasi</h4>
                                    <div class="math-card">
                                        <div class="math-step-row"><strong>Ifoda:</strong> <code>${escapeHtml(expr)}</code></div>
                                        <div class="math-result-highlight" style="background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 0.5rem; border-radius: 6px; margin-top: 0.4rem; color: #34d399;">
                                            ✅ <strong>Natija:</strong> ${result}
                                        </div>
                                    </div>
                                `,
                                actions: [
                                    { text: "Matematika Testi", action: "startTestExam('math'); closeModal('aiChatModal');", icon: "fa-calculator" }
                                ]
                            });
                        }
                    }
                } catch (e) {}
            }

            // D. Geometry & Pythagoras Theorem
            if (q.includes('pifagor') || q.includes('gipotenuza') || q.includes('katet') || q.includes('uchburchak yuzi')) {
                return res.json({
                    success: true,
                    mode: 'math',
                    html: `
                        <h4>🔺 Pifagor Teoremasi va To'g'ri Burchakli Uchburchak</h4>
                        <div class="math-card">
                            <div class="math-formula-title">Pifagor Teoremasi Formulalari:</div>
                            <div class="math-step-row">• <strong>Asosiy Formula:</strong> <code>c² = a² + b²</code></div>
                            <div class="math-step-row">• <strong>Gipotenuza:</strong> <code>c = √(a² + b²)</code></div>
                            <div class="math-step-row">• <strong>Katetlar:</strong> <code>a = √(c² - b²)</code>, <code>b = √(c² - a²)</code></div>
                            <div class="math-step-row">• <strong>Yuzi (S):</strong> <code>S = (a · b) / 2</code></div>
                        </div>
                        <p><strong>Misol (Misr uchburchagi):</strong> Katetlari <code>a = 3 sm</code> va <code>b = 4 sm</code> bo'lsa:<br>
                        <code>c² = 3² + 4² = 9 + 16 = 25</code> → <strong><code>c = 5 sm</code></strong>, <code>S = (3·4)/2 = 6 sm²</code></p>
                    `,
                    actions: [
                        { text: "Matematika Testini Boshlash", action: "startTestExam('math'); closeModal('aiChatModal');", icon: "fa-play" }
                    ]
                });
            }

            if (q.includes('doira') || q.includes('aylana') || q.includes('radius') || q.includes('diametr')) {
                return res.json({
                    success: true,
                    mode: 'math',
                    html: `
                        <h4>📐 Doira va Aylana Geometrik Formulalari</h4>
                        <div class="math-card">
                            <div class="math-formula-title">Asosiy Formulalar:</div>
                            <div class="math-step-row">• <strong>Doira Yuzi (S):</strong> <code>S = π · r²</code> (bu yerda <code>π ≈ 3.14159</code>, <code>r</code> — radius)</div>
                            <div class="math-step-row">• <strong>Aylana Uzunligi (L):</strong> <code>L = 2 · π · r</code> yoki <code>L = π · d</code> (bu yerda <code>d</code> — diametr)</div>
                            <div class="math-step-row">• <strong>Diametr (d):</strong> <code>d = 2 · r</code></div>
                        </div>
                    `,
                    actions: [
                        { text: "Matematika Testiga O'tish", action: "startTestExam('math'); closeModal('aiChatModal');", icon: "fa-calculator" }
                    ]
                });
            }

            // =========================================================================
            // 4. ENGLISH TUTOR & IRREGULAR VERBS
            // =========================================================================

            if (currentMode === 'english' || q.includes('ingliz') || q.includes('english') || q.includes('grammar') || q.includes('verb') || q.includes('tarjima') || q.includes('tense') || q.includes('irregular')) {
                const irregularVerbsDb = {
                    'be': { v1: 'be (am/is/are)', v2: 'was / were', v3: 'been', uz: 'bo\'lmoq', ex: 'I was at DILBAR EDICATION yesterday.' },
                    'go': { v1: 'go', v2: 'went', v3: 'gone', uz: 'bormoq', ex: 'She went to school every morning.' },
                    'see': { v1: 'see', v2: 'saw', v3: 'seen', uz: 'ko\'rmoq', ex: 'I saw my English teacher in the library.' },
                    'take': { v1: 'take', v2: 'took', v3: 'taken', uz: 'olmoq', ex: 'He took an online exam.' },
                    'write': { v1: 'write', v2: 'wrote', v3: 'written', uz: 'yozmoq', ex: 'She wrote an essay about Uzbekistan.' },
                    'do': { v1: 'do', v2: 'did', v3: 'done', uz: 'bajarmoq', ex: 'I have done all my homework.' },
                    'have': { v1: 'have', v2: 'had', v3: 'had', uz: 'ega bo\'lmoq', ex: 'We had six interesting lessons today.' },
                    'make': { v1: 'make', v2: 'made', v3: 'made', uz: 'yasamoq / qilmoq', ex: 'We made a robot in the STEM club.' },
                    'read': { v1: 'read', v2: 'read', v3: 'read', uz: 'o\'qimoq', ex: 'I read three books this month.' },
                    'speak': { v1: 'speak', v2: 'spoke', v3: 'spoken', uz: 'gapirmoq', ex: 'He speaks English fluently.' },
                    'know': { v1: 'know', v2: 'knew', v3: 'known', uz: 'bilmoq', ex: 'I knew all answers to the test.' },
                    'think': { v1: 'think', v2: 'thought', v3: 'thought', uz: 'o\'ylamoq', ex: 'She thought about the future.' },
                    'come': { v1: 'come', v2: 'came', v3: 'come', uz: 'kelmoq', ex: 'They came to school at 8:00 AM.' },
                    'give': { v1: 'give', v2: 'gave', v3: 'given', uz: 'bermoq', ex: 'The teacher gave high grades.' },
                    'find': { v1: 'find', v2: 'found', v3: 'found', uz: 'topmoq', ex: 'I found the PDF textbook in the e-library.' }
                };

                for (const [verb, data] of Object.entries(irregularVerbsDb)) {
                    if (q.includes(verb)) {
                        return res.json({
                            success: true,
                            mode: 'english',
                            html: `
                                <h4>🇬🇧 Noto'g'ri Fe'l (Irregular Verb): <em>${data.v1.toUpperCase()}</em></h4>
                                <div class="math-card">
                                    <div class="math-formula-title">3 ta asosiy shakli:</div>
                                    <div class="math-step-row">• <strong>V1 (Infinitive / Present):</strong> <code>${data.v1}</code></div>
                                    <div class="math-step-row">• <strong>V2 (Past Simple):</strong> <code>${data.v2}</code></div>
                                    <div class="math-step-row">• <strong>V3 (Past Participle):</strong> <code>${data.v3}</code></div>
                                    <div class="math-step-row">• <strong>O'zbekcha ma'nosi:</strong> <em>${data.uz}</em></div>
                                </div>
                                <p><strong>Namunaviy gap:</strong> <em>"${data.ex}"</em></p>
                            `,
                            actions: [
                                { text: "Ingliz Tili Testiga O'tish", action: "startTestExam('english'); closeModal('aiChatModal');", icon: "fa-language" }
                            ]
                        });
                    }
                }

                return res.json({
                    success: true,
                    mode: 'english',
                    html: `
                        <h4>🇬🇧 English Grammar: Present Simple & Key Tenses</h4>
                        <div class="math-card">
                            <div class="math-formula-title">Present Simple Tense (Oddiy Hozirgi Zamon):</div>
                            <div class="math-step-row">• <strong>(+) Darak:</strong> <code>S + V1 (he/she/it + V-s/es)</code> (e.g. <em>I study at DILBAR EDICATION</em>)</div>
                            <div class="math-step-row">• <strong>(-) Inkor:</strong> <code>S + don't / doesn't + V1</code> (e.g. <em>She doesn't miss classes</em>)</div>
                            <div class="math-step-row">• <strong>(?) So'roq:</strong> <code>Do / Does + S + V1?</code> (e.g. <em>Do you speak English?</em>)</div>
                            <div class="math-step-row">• <strong>Kalit so'zlar:</strong> always, usually, often, sometimes, every day/week.</div>
                        </div>
                    `,
                    actions: [
                        { text: "Ingliz Tili Testini Topshirish", action: "startTestExam('english'); closeModal('aiChatModal');", icon: "fa-language" }
                    ]
                });
            }

            // =========================================================================
            // 5. SCIENCE & INFORMATICS (PHYSICS, CHEMISTRY, IT)
            // =========================================================================

            if (q.includes('om qonuni') || q.includes('tok kuchi') || q.includes('qarshilik') || q.includes('kuchlanish')) {
                return res.json({
                    success: true,
                    mode: 'math',
                    html: `
                        <h4>⚡ Fizika: Zanjir Qismi Uchun Om Qonuni</h4>
                        <div class="math-card">
                            <div class="math-formula-title">Om Qonuni Formulasi:</div>
                            <div class="math-step-row">• <strong>Formulasi:</strong> <code>I = U / R</code></div>
                            <div class="math-step-row">• <strong>I (Amper, A):</strong> Tok kuchi</div>
                            <div class="math-step-row">• <strong>U (Volt, V):</strong> Elektr kuchlanish (<code>U = I · R</code>)</div>
                            <div class="math-step-row">• <strong>R (Om, Ω):</strong> O'tkazgich qarshiligi (<code>R = U / I</code>)</div>
                        </div>
                    `,
                    actions: [
                        { text: "Fan Testlarini Boshlash", action: "closeModal('aiChatModal'); location.href='#tests';", icon: "fa-atom" }
                    ]
                });
            }

            if (q.includes('nyuton') || q.includes('arximed') || q.includes('kinetik') || q.includes('potensial')) {
                return res.json({
                    success: true,
                    mode: 'math',
                    html: `
                        <h4>🚀 Fizika: Mexanika va Dinamika Qonunlari</h4>
                        <div class="math-card">
                            <div class="math-formula-title">Asosiy Formulalar:</div>
                            <div class="math-step-row">• <strong>Nyutonning II Qonuni:</strong> <code>F = m · a</code> (Kuch = massa × tezlanish)</div>
                            <div class="math-step-row">• <strong>Og'irlik kuchi:</strong> <code>F = m · g</code> (g ≈ 9.8 m/s²)</div>
                            <div class="math-step-row">• <strong>Arximed kuchi:</strong> <code>F_A = ρ · g · V</code></div>
                        </div>
                    `,
                    actions: [
                        { text: "Onlayn Test Markazi", action: "closeModal('aiChatModal'); location.href='#tests';", icon: "fa-list-check" }
                    ]
                });
            }

            if (q.includes('python') || q.includes('dasturlash') || q.includes('html') || q.includes('javascript') || q.includes('kod') || q.includes('informatika')) {
                return res.json({
                    success: true,
                    mode: 'math',
                    html: `
                        <h4>💻 Informatika va Dasturlash (IT Bilimlari)</h4>
                        <div class="math-card">
                            <div class="math-formula-title">Python Dasturlash Asoslari:</div>
                            <div class="math-step-row">• <strong>Chiqarish:</strong> <code>print("Salom, DILBAR EDICATION!")</code></div>
                            <div class="math-step-row">• <strong>Shart:</strong> <code>if ball >= 86: print("5 (A'lo)")</code></div>
                            <div class="math-step-row">• <strong>Sikl:</strong> <code>for i in range(1, 11): print(i)</code></div>
                        </div>
                    `,
                    actions: [
                        { text: "Informatika Testini Boshlash", action: "startTestExam('informatics'); closeModal('aiChatModal');", icon: "fa-laptop-code" },
                        { text: "IT To'garagiga Yozilish", action: "closeModal('aiChatModal'); location.href='#clubs';", icon: "fa-signature" }
                    ]
                });
            }

            // =========================================================================
            // 6. LIVE DATABASE SEARCHES (BOOKS, CLUBS, NEWS, TEACHERS, HONORS, STATS)
            // =========================================================================

            // A. Books & E-Library Search from SQLite Database
            if (q.includes('kitob') || q.includes('darslik') || q.includes('kutubxona') || q.includes('pdf') || q.includes('adabiyot')) {
                try {
                    let books = [];
                    const classMatch = q.match(/(\d+)\s*-?\s*sinf/i);
                    if (classMatch) {
                        const classNum = classMatch[1];
                        books = db.all("SELECT * FROM books WHERE class_level LIKE ? OR title LIKE ? LIMIT 6", [`%${classNum}%`, `%${classNum}%`]);
                    } else if (q.includes('badiiy') || q.includes('roman')) {
                        books = db.all("SELECT * FROM books WHERE category LIKE '%badiiy%' OR category LIKE '%Badiiy%' LIMIT 6");
                    } else {
                        books = db.all("SELECT * FROM books ORDER BY downloads_count DESC LIMIT 5");
                    }

                    if (books && books.length > 0) {
                        const bookCardsHtml = books.map(b => `
                            <div class="math-step-row" style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0; border-bottom: 1px dashed rgba(255,255,255,0.08);">
                                <div>
                                    📖 <strong>${escapeHtml(b.title)}</strong> <span style="color: var(--secondary); font-size: 0.8rem;">(${escapeHtml(b.class_level || '')})</span>
                                    <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(b.author || '')} • ${escapeHtml(b.file_size || '15 MB')}</div>
                                </div>
                                <a href="${b.pdf_url || '#library'}" target="_blank" class="badge-tag" style="background: rgba(16,185,129,0.2); color: #34d399; text-decoration: none; padding: 0.25rem 0.6rem; border-radius: 6px; font-size: 0.78rem;">
                                    <i class="fa-solid fa-download"></i> PDF
                                </a>
                            </div>
                        `).join('');

                        return res.json({
                            success: true,
                            mode: 'school',
                            html: `
                                <h4>📚 Elektron Kutubxona: Topilgan Kitob va Darsliklar</h4>
                                <div class="math-card">
                                    <div class="math-formula-title">Mavjud Darsliklar Ro'yxati:</div>
                                    ${bookCardsHtml}
                                </div>
                            `,
                            actions: [
                                { text: "Barcha Kitoblarni Ko'rish", action: "closeModal('aiChatModal'); location.href='#library';", icon: "fa-book-open" }
                            ]
                        });
                    }
                } catch (e) {}
            }

            // B. Clubs & Circles from SQLite Database
            if (q.includes('togarak') || q.includes('to\'garak') || q.includes('shaxmat') || q.includes('robot') || q.includes('sport')) {
                try {
                    const clubs = db.all("SELECT * FROM clubs ORDER BY id ASC LIMIT 6");
                    if (clubs && clubs.length > 0) {
                        const clubsHtml = clubs.map(c => `
                            <div class="math-step-row" style="padding: 0.35rem 0; border-bottom: 1px dashed rgba(255,255,255,0.08);">
                                • <i class="fa-solid ${c.icon || 'fa-shapes'}" style="color: var(--secondary); margin-right: 4px;"></i> <strong>${escapeHtml(c.name)}</strong>: ${escapeHtml(c.schedule || '')} (Xona: ${escapeHtml(c.room || '')}, Ustoz: ${escapeHtml(c.teacher || '')})
                            </div>
                        `).join('');

                        return res.json({
                            success: true,
                            mode: 'school',
                            html: `
                                <h4>🏆 DILBAR EDICATION Bepul To'garaklari</h4>
                                <div class="math-card">
                                    <div class="math-formula-title">Faol To'garaklar Ro'yxati:</div>
                                    ${clubsHtml}
                                </div>
                            `,
                            actions: [
                                { text: "To'garakka Ro'yxatdan O'tish", action: "closeModal('aiChatModal'); location.href='#clubs';", icon: "fa-signature" }
                            ]
                        });
                    }
                } catch (e) {}
            }

            // C. News & Announcements from SQLite Database
            if (q.includes('yangilik') || q.includes('elon') || q.includes('e\'lon') || q.includes('tadbir')) {
                try {
                    const news = db.all("SELECT * FROM news ORDER BY id DESC LIMIT 4");
                    if (news && news.length > 0) {
                        const newsHtml = news.map(n => `
                            <div class="math-step-row" style="padding: 0.35rem 0; border-bottom: 1px dashed rgba(255,255,255,0.08);">
                                📰 <strong>${escapeHtml(n.title)}</strong> <span style="font-size: 0.78rem; color: var(--secondary);">(${escapeHtml(n.date || '')})</span>
                                <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHtml((n.summary || '').substring(0, 110))}...</div>
                            </div>
                        `).join('');

                        return res.json({
                            success: true,
                            mode: 'school',
                            html: `
                                <h4>📢 Maktabning So'nggi Yangiliklari</h4>
                                <div class="math-card">${newsHtml}</div>
                            `,
                            actions: [
                                { text: "Barcha Yangiliklar", action: "closeModal('aiChatModal'); location.href='#news';", icon: "fa-newspaper" }
                            ]
                        });
                    }
                } catch (e) {}
            }

            // D. Teachers & Leadership from SQLite Database
            if (q.includes('direktor') || q.includes('rahbar') || q.includes('ustoz') || q.includes('oqituvchi') || q.includes('o\'qituvchi') || q.includes('zavuch') || q.includes('pedagog')) {
                try {
                    const teachers = db.all("SELECT * FROM teachers ORDER BY id ASC LIMIT 5");
                    const teachersHtml = teachers.map(t => `
                        <div class="math-step-row" style="padding: 0.35rem 0; border-bottom: 1px dashed rgba(255,255,255,0.08);">
                            👨‍🏫 <strong>${escapeHtml(t.name)}</strong> — <em>${escapeHtml(t.role)}</em>
                            <div style="font-size: 0.78rem; color: var(--text-muted);">${escapeHtml(t.category || '')} • Qabul: ${escapeHtml(t.hours || 'Har kuni')}</div>
                        </div>
                    `).join('');

                    return res.json({
                        success: true,
                        mode: 'school',
                        html: `
                            <h4>👩‍🏫 DILBAR EDICATION Rahbariyati va Pedagogik Jamoasi</h4>
                            <div class="math-card">
                                <div class="math-formula-title">Maktab Ma'muriyati va Ustozlar:</div>
                                ${teachersHtml}
                            </div>
                        `,
                        actions: [
                            { text: "Pedagoglar Ro'yxati", action: "closeModal('aiChatModal'); location.href='#teachers';", icon: "fa-chalkboard-user" },
                            { text: "Murojaat Qoldirish", action: "closeModal('aiChatModal'); location.href='#contact';", icon: "fa-envelope" }
                        ]
                    });
                } catch (e) {}
            }

            // E. Admission / 1-Sinf
            if (q.includes('qabul') || q.includes('1-sinf') || q.includes('hujjat') || q.includes('ariza')) {
                return res.json({
                    success: true,
                    mode: 'school',
                    html: `
                        <h4>🎓 DILBAR EDICATIONga 1-Sinfga Qabul Tartibi</h4>
                        <p>DILBAR EDICATION innovatsion ta'lim maskaniga 1-sinfga qabul yoshi <strong>7 yoshga to'ladigan bolalar</strong> uchun amalga oshiriladi.</p>
                        <div class="math-card">
                            <div class="math-formula-title">Kerakli Hujjatlar Ro'yxati:</div>
                            <div class="math-step-row">1. 📄 Bolaning tug'ilganlik to'g'risidagi guvohnomasi nusxasi;</div>
                            <div class="math-step-row">2. 🏥 086-U shakldagi tibbiy ma'lumotnoma va emlash daftarchasi;</div>
                            <div class="math-step-row">3. 📸 Bolaning 3x4 o'lchamdagi 4 dona rangli fotosurati;</div>
                            <div class="math-step-row">4. 👨‍👩‍👦 Ota-onaning fuqarolik pasporti (ID karta) nusxalari.</div>
                        </div>
                    `,
                    actions: [
                        { text: "Qabulga Onlayn Ariza Yuborish", action: "openAdmissionModal(); closeModal('aiChatModal');", icon: "fa-pen-to-square" },
                        { text: "Spravka Olish", action: "openSpravkaModal(); closeModal('aiChatModal');", icon: "fa-file-certificate" }
                    ]
                });
            }

            // F. Spravka / Ma'lumotnoma
            if (q.includes('spravka') || q.includes('malumotnoma') || q.includes('ma\'lumotnoma') || q.includes('qr')) {
                return res.json({
                    success: true,
                    mode: 'school',
                    html: `
                        <h4>📑 QR-Kodli Rasmiy Elektron Ma'lumotnoma (Spravka)</h4>
                        <p>Maktabimiz o'quvchilariga davlat tashkilotlari, banklar yoki to'garaklar uchun <strong>QR-kodli rasmiy ma'lumotnoma</strong> avtomatik ravishda onlayn shakllantiriladi.</p>
                        <div class="math-card">
                            <div class="math-formula-title">Spravka Olish Qadamlari:</div>
                            <div class="math-step-row">1. "Spravka Olish" tugmasini bosing;</div>
                            <div class="math-step-row">2. O'quvchining F.I.SH va sinfini tanlang;</div>
                            <div class="math-step-row">3. "Spravkani Shakllantirish" tugmasini bosing va PDF sifatida yuklab oling!</div>
                        </div>
                    `,
                    actions: [
                        { text: "Spravka Olish Oynasini Ochish", action: "openSpravkaModal(); closeModal('aiChatModal');", icon: "fa-file-certificate" },
                        { text: "Hujjatni QR Tekshirish", action: "openVerifyCertModal(); closeModal('aiChatModal');", icon: "fa-shield-check" }
                    ]
                });
            }

            // G. Timetable
            if (q.includes('jadval') || q.includes('dars') || q.includes('smena') || q.includes('qongiroq') || q.includes('qo\'ng\'iroq')) {
                return res.json({
                    success: true,
                    mode: 'school',
                    html: `
                        <h4>⏰ DILBAR EDICATION Dars va Smenalar Jadvali</h4>
                        <div class="math-card">
                            <div class="math-formula-title">Smenalar:</div>
                            <div class="math-step-row">☀️ <strong>1-Smena (08:00 – 13:10):</strong> 1-4 boshlang'ich va 9-11 yuqori sinflar</div>
                            <div class="math-step-row">🌙 <strong>2-Smena (13:30 – 18:35):</strong> 5-8 o'rta sinflar</div>
                        </div>
                    `,
                    actions: [
                        { text: "Sinf Dars Jadvalini Ko'rish", action: "closeModal('aiChatModal'); location.href='#timetable';", icon: "fa-calendar-days" }
                    ]
                });
            }

            // H. General Greetings
            if (q.includes('salom') || q.includes('assalom') || q.includes('qalaysiz') || q.includes('kim siz') || q.includes('yordam')) {
                return res.json({
                    success: true,
                    mode: currentMode,
                    html: `
                        <h4>👋 Assalomu alaykum!</h4>
                        <p>Men <strong>DILBAR EDICATION AI 2.0 Supercharged aqlli ta'lim maslahatchisi va o'quv repetitoriman</strong>.</p>
                        <p>Sizga quyidagi sohalarda to'liq yordam bera olaman:</p>
                        <ul>
                            <li>🏫 <strong>Maktab ma'lumotlari:</strong> Qabul, QR-spravka, dars jadvallari, elektron tabel va onlayn testlar;</li>
                            <li>🧮 <strong>Matematika & Formulalar:</strong> Kvadrat va chiziqli tenglamalar, kasrlar, foizlar, Pifagor va geometriya;</li>
                            <li>🇬🇧 <strong>Ingliz tili:</strong> Zamonlar, grammatika qoidalari, noto'g'ri fe'llar, lug'at tarjimasi;</li>
                            <li>✍️ <strong>Insho va Esse:</strong> Mavzular bo'yicha to'liq 3 bosqichli reja va namunaviy matnlar;</li>
                            <li>⚡ <strong>Tezkor Viktorina:</strong> Chat ichida barcha fanlardan test topshirish.</li>
                        </ul>
                    `,
                    actions: [
                        { text: "Onlayn Test Markazi", action: "closeModal('aiChatModal'); location.href='#tests';", icon: "fa-list-check" },
                        { text: "Spravka Olish", action: "openSpravkaModal(); closeModal('aiChatModal');", icon: "fa-file-certificate" },
                        { text: "Dars Jadvali", action: "closeModal('aiChatModal'); location.href='#timetable';", icon: "fa-calendar-days" }
                    ]
                });
            }

            // Default intelligent fallback
            res.json({
                success: true,
                mode: currentMode,
                html: `
                    <h4>🏫 DILBAR EDICATION AI 3.0 Maslahatchisi</h4>
                    <p>Savolingiz qabul qilindi: <em>"${escapeHtml(rawQuery)}"</em></p>
                    <div class="math-card">
                        <div class="math-formula-title">Tezkor Maktab Xizmatlari:</div>
                        <div class="math-step-row">• Guliston shahar 1-sonli umumta'lim maktabi rasmiy portali orqali onlayn testlar topshirishingiz, elektron spravka olishingiz va 1-sinfga ariza topshirishingiz mumkin.</div>
                        <div class="math-step-row">• 📞 Bog'lanish: <strong>+998 (67) 225-11-01</strong></div>
                    </div>
                `,
                actions: [
                    { text: "Onlayn Test Markazi", action: "closeModal('aiChatModal'); location.href='#tests';", icon: "fa-list-check" },
                    { text: "Elektron Kutubxona", action: "closeModal('aiChatModal'); location.href='#library';", icon: "fa-book" },
                    { text: "Spravka Olish", action: "openSpravkaModal(); closeModal('aiChatModal');", icon: "fa-file-certificate" },
                    { text: "Qabulga Ariza", action: "openAdmissionModal(); closeModal('aiChatModal');", icon: "fa-pen-to-square" }
                ]
            });
        } catch (err) {
            next(err);
        }
    }
};

function escapeHtml(string) {
    const entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
    return String(string).replace(/[&<>"']/g, s => entityMap[s]);
}

module.exports = aiController;
