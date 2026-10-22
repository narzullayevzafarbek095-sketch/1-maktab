/**
 * ==========================================================================
 * DILBAR EDICATION BACKEND AUTOMATED API TEST SUITE
 * ==========================================================================
 */

const http = require('http');
const app = require('../src/server');

let server;
let baseUrl;
let authToken = '';

async function request(path, options = {}) {
    const url = `${baseUrl}${path}`;
    const headers = {
        'Content-Type': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
        ...(options.headers || {})
    };

    const res = await fetch(url, {
        ...options,
        headers,
        body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
    });

    let data;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        data = await res.json();
    } else {
        data = await res.text();
    }

    return { status: res.status, data, headers: res.headers };
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(`❌ Assertion Failed: ${message}`);
    }
}

async function runTests() {
    console.log('====================================================');
    console.log('🧪 RUNNING DILBAR EDICATION REST API TESTS');
    console.log('====================================================');

    const PORT = 5557;
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(PORT, resolve));
    baseUrl = `http://localhost:${PORT}`;

    let passedCount = 0;
    let failedCount = 0;

    async function test(name, fn) {
        try {
            process.stdout.write(`⏳ Testing: ${name}... `);
            await fn();
            console.log('✅ PASSED');
            passedCount++;
        } catch (err) {
            console.log(`❌ FAILED: ${err.message}`);
            failedCount++;
        }
    }

    try {
        // 1. Health & Docs
        await test('GET /api/health returns 200 and OK status for DILBAR EDICATION', async () => {
            const res = await request('/api/health');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.status === 'OK', 'Expected status OK');
            assert(res.data.platform.includes('DILBAR EDICATION'), 'Expected platform name DILBAR EDICATION');
        });

        await test('GET /api returns 200 and platform documentation endpoints', async () => {
            const res = await request('/api');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.endpoints && res.data.endpoints.auth, 'Expected endpoints object');
        });

        // 2. Auth
        await test('POST /api/auth/login with valid credentials generates JWT token', async () => {
            const res = await request('/api/auth/login', {
                method: 'POST',
                body: { username: 'admin', password: 'admin123' }
            });
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.success === true, 'Expected success true');
            assert(res.data.token, 'Expected JWT token');
            authToken = res.data.token;
        });

        await test('GET /api/auth/me returns authenticated admin profile', async () => {
            const res = await request('/api/auth/me');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.user && res.data.user.username === 'admin', 'Expected admin username');
        });

        await test('PUT /api/auth/profile updates admin login/username and full name', async () => {
            const res = await request('/api/auth/profile', {
                method: 'PUT',
                body: {
                    username: 'admin',
                    fullName: 'DILBAR EDICATION Administrator (Yangilangan)',
                    currentPassword: 'admin123'
                }
            });
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.success === true, 'Expected success true');
            assert(res.data.user.full_name === 'DILBAR EDICATION Administrator (Yangilangan)', 'Expected updated full_name');
        });

        // 3. Applications
        let createdAppId = '';
        await test('POST /api/applications creates new admission application', async () => {
            const res = await request('/api/applications', {
                method: 'POST',
                body: {
                    studentName: "Test O'quvchi Jasurbek",
                    applyClass: "1",
                    parentName: "Test Ota",
                    parentPhone: "+998 90 123 45 67",
                    address: "Toshkent sh., Yunusobod"
                }
            });
            assert(res.status === 201, `Expected 201, got ${res.status}`);
            assert(res.data.success === true, 'Expected success');
            assert(res.data.id, 'Expected application ID');
            createdAppId = res.data.id;
        });

        await test('GET /api/applications returns list with auth', async () => {
            const res = await request('/api/applications');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(Array.isArray(res.data.data), 'Expected array of applications');
        });

        await test('GET /api/applications/stats returns admission stats', async () => {
            const res = await request('/api/applications/stats');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.stats && res.data.stats.total >= 1, 'Expected stats count');
        });

        await test('PATCH /api/applications/:id/status updates status', async () => {
            const res = await request(`/api/applications/${createdAppId}/status`, {
                method: 'PATCH',
                body: { status: 'Tasdiqlandi' }
            });
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.data.status === 'Tasdiqlandi', 'Expected updated status');
        });

        // 4. Messages
        let createdMsgId = null;
        await test('POST /api/messages creates new contact appeal', async () => {
            const res = await request('/api/messages', {
                method: 'POST',
                body: {
                    name: "Valiyev Sherzod",
                    phone: "+998 91 999 88 77",
                    topic: "Akademiyaga Qabul",
                    message: "DILBAR EDICATION ga yangi o'quv yilida qabul shartlari haqida so'ramoqchi edim."
                }
            });
            assert(res.status === 201, `Expected 201, got ${res.status}`);
            assert(res.data.data && res.data.data.id, 'Expected message ID');
            createdMsgId = res.data.data.id;
        });

        await test('POST /api/messages/:id/reply replies to message', async () => {
            const res = await request(`/api/messages/${createdMsgId}/reply`, {
                method: 'POST',
                body: { replyText: "Rahmat! Qabul jarayoni saytimiz orqali onlayn davom etmoqda." }
            });
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.data.reply, 'Expected reply field');
        });

        // 5. Online Tests
        await test('GET /api/tests/subjects returns subjects and question counts', async () => {
            const res = await request('/api/tests/subjects');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.data.length === 6, 'Expected 6 subjects');
        });

        await test('GET /api/tests/:subjectKey returns questions bank', async () => {
            const res = await request('/api/tests/math');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.questions.length === 10, 'Expected 10 questions in math');
        });

        let testCertCode = '';
        await test('POST /api/tests/submit scores exam and issues certificate', async () => {
            const res = await request('/api/tests/submit', {
                method: 'POST',
                body: {
                    studentName: "Qodirova Madina",
                    classVal: "9-A",
                    subjectKey: "math",
                    userAnswers: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
                }
            });
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.result.score === 10, 'Expected 10/10 score');
            assert(res.data.result.percentage === 100, 'Expected 100%');
            assert(res.data.result.certCode, 'Expected certCode');
            testCertCode = res.data.result.certCode;
        });

        // 6. Certificates
        await test('GET /api/certificates/verify/:code verifies issued test certificate', async () => {
            const res = await request(`/api/certificates/verify/${testCertCode}`);
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.valid === true, 'Expected valid true');
            assert(res.data.data.studentName === 'Qodirova Madina', 'Expected studentName match');
        });

        // 7. Teachers
        await test('GET /api/teachers returns teacher faculty directory', async () => {
            const res = await request('/api/teachers');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.data.length >= 5, 'Expected teachers list');
        });

        // 8. Honors (Faxriy O'quvchilar)
        await test('GET /api/honors returns school champions & olympiad winners', async () => {
            const res = await request('/api/honors');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.data.length >= 3, 'Expected honors list');
        });

        // 9. Settings
        await test('GET /api/settings returns school configuration', async () => {
            const res = await request('/api/settings');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.settings && res.data.settings.school_name, 'Expected school_name');
        });

        // 10. AI Assistant Solver
        await test('POST /api/ai/ask solves math quadratic equation', async () => {
            const res = await request('/api/ai/ask', {
                method: 'POST',
                body: { query: "x^2 - 5x + 6 = 0 tenglamani yech", mode: "math" }
            });
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.html.includes('Diskriminant'), 'Expected discriminant in response');
        });

        // 11. Amenities & Private School Services
        await test('GET /api/amenities/menu returns weekly healthy nutrition menu', async () => {
            const res = await request('/api/amenities/menu');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.data && res.data.data.mon, 'Expected monday menu');
        });

        await test('GET /api/amenities/transport returns school bus routes', async () => {
            const res = await request('/api/amenities/transport');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.data && res.data.data.length === 4, 'Expected 4 bus routes');
        });

        await test('GET /api/amenities/clubs returns extracurricular activities & sports', async () => {
            const res = await request('/api/amenities/clubs');
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.data && res.data.data.length === 6, 'Expected 6 clubs');
        });

        await test('POST /api/amenities/calculate calculates tuition with discounts', async () => {
            const res = await request('/api/amenities/calculate', {
                method: 'POST',
                body: { grade: 'middle', plan: 'yearly', bus: 'yes', isFamily: true }
            });
            assert(res.status === 200, `Expected 200, got ${res.status}`);
            assert(res.data.calculation.discountPercent === 25, 'Expected 25% total discount');
            assert(res.data.calculation.yearlyPrice > 0, 'Expected valid yearly price');
        });

    } finally {
        if (server) {
            server.close();
        }
    }

    console.log('====================================================');
    console.log(`📊 TEST RESULTS: ${passedCount} PASSED | ${failedCount} FAILED`);
    console.log('====================================================');

    if (failedCount > 0) {
        process.exit(1);
    } else {
        process.exit(0);
    }
}

if (require.main === module) {
    runTests().catch(err => {
        console.error('Fatal test error:', err);
        process.exit(1);
    });
}

module.exports = runTests;
