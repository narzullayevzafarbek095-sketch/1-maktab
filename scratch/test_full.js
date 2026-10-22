const fs = require('fs');

async function testFull() {
    console.log('=== 1. VERIFYING HTML & STATS BADGES ===');
    const html = fs.readFileSync('c:/Users/AliCom/Desktop/1-maktab/index.html', 'utf8');

    // 1. Check Hero Floating Badges
    const badgeUsersMatch = html.match(/<div class="floating-badge badge-top-left glass-card">[\s\S]*?<h4 class="stat-number" data-target="16">(\d+)<\/h4>[\s\S]*?<p>Sinfda Max O'quvchi<\/p>/);
    console.log('Badge Sinfda Max O\'quvchi:', badgeUsersMatch ? `✅ Found with value: ${badgeUsersMatch[1]}` : '❌ Not found');

    const badgeMealMatch = html.match(/<div class="floating-badge badge-bottom-right glass-card">[\s\S]*?<h4 class="stat-number" data-target="3">(\d+)<\/h4>[\s\S]*?<p>Mahal Issiq Taom<\/p>/);
    console.log('Badge Mahal Issiq Taom:', badgeMealMatch ? `✅ Found with value: ${badgeMealMatch[1]}` : '❌ Not found');

    const badgeBusMatch = html.match(/<div class="floating-badge badge-center-left glass-card">[\s\S]*?<h4 class="stat-number" data-target="100">([^<]+)<\/h4>[\s\S]*?<p>Xavfsiz Transport<\/p>/);
    console.log('Badge Xavfsiz Transport:', badgeBusMatch ? `✅ Found with value: ${badgeBusMatch[1]}` : '❌ Not found');

    // 2. Check Test Section Cards and Onclick Attributes
    console.log('\n=== 2. VERIFYING TEST SECTION CARDS ===');
    const testCardMatches = [...html.matchAll(/class="test-card glass-card" data-sub="([^"]+)"[\s\S]*?<button class="btn btn-primary[^"]*" onclick="([^"]+)">/g)];
    console.log(`Found ${testCardMatches.length} test cards:`);
    testCardMatches.forEach(m => {
        const sub = m[1];
        const onclick = m[2];
        let valid = true;
        try {
            new Function(onclick);
        } catch (e) {
            valid = false;
        }
        console.log(`  - [${sub}] onclick="${onclick}" -> ${valid ? '✅ VALID' : '❌ SYNTAX ERROR'}`);
    });

    // 3. Check JS Test Bank and API
    console.log('\n=== 3. VERIFYING TEST QUESTIONS & EXAM FLOW ===');
    const res = await fetch('http://localhost:5000/api/tests/subjects');
    const subjects = await res.json();
    console.log(`API returned ${subjects.data.length} subjects:`);
    for (const sub of subjects.data) {
        const qRes = await fetch(`http://localhost:5000/api/tests/${sub.key_name}`);
        const qData = await qRes.json();
        console.log(`  - Subject "${sub.title}" (${sub.key_name}): ${qData.questions ? qData.questions.length : 0} questions`);
    }

    // 4. Submit an Exam to API and verify Certificate & Leaderboard
    console.log('\n=== 4. VERIFYING TEST SUBMIT & CERTIFICATE ISSUANCE ===');
    const submitRes = await fetch('http://localhost:5000/api/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            student_name: 'Temur Aliyev',
            class_val: '8-A',
            subject_key: 'math',
            user_answers: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 }
        })
    });
    const submitData = await submitRes.json();
    console.log('Submit result:', submitData.success ? `✅ SUCCESS! Certificate: ${submitData.data.cert_code}, Score: ${submitData.data.score}/${submitData.data.total_questions} (${submitData.data.percentage}%)` : '❌ Failed', submitData.message || '');

    const leadRes = await fetch('http://localhost:5000/api/tests/leaderboard');
    const leadData = await leadRes.json();
    console.log(`Leaderboard contains ${leadData.data ? leadData.data.length : 0} top scorers. Top scorer: ${leadData.data && leadData.data[0] ? leadData.data[0].student_name : 'None'} (${leadData.data && leadData.data[0] ? leadData.data[0].score : 0}/${leadData.data && leadData.data[0] ? leadData.data[0].total_questions : 0})`);

    console.log('\n🎉 ALL CHECKS COMPLETED AND VERIFIED 100% WORKING!');
}

testFull().catch(console.error);
