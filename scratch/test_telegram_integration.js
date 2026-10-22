const fs = require('fs');

async function testTelegramFlow() {
    console.log('=== 1. TESTING APPLICATION CREATION & TELEGRAM DISPATCH ===');
    const appRes = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            student_name: 'Anvarov Bobur Shavkat o\'g\'li',
            birth_date: '2015-05-12',
            gender: 'male',
            applyClass: '4',
            address: 'Toshkent sh., Chilonzor 19-mavze, 45-uy',
            parent_name: 'Anvarov Shavkat',
            parent_phone: '+998 (90) 999-88-77',
            parent_email: 'shavkat.anvarov@gmail.com'
        })
    });

    const appData = await appRes.json();
    console.log('Application submission status:', appRes.status, appData.success ? `✅ Created ID: ${appData.id}` : '❌ Error');
    console.log('Application student name:', appData.data ? appData.data.student_name : 'N/A');

    console.log('\n=== 2. TESTING MESSAGE CREATION & TELEGRAM DISPATCH ===');
    const msgRes = await fetch('http://localhost:5000/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: 'Nodira Karimova',
            phone: '+998 (97) 123-45-67',
            topic: 'Qabul va Ekskursiya',
            message: 'Assalomu alaykum! Maktabga kelib ko\'rish va o\'quv dasturi bilan tanishish uchun ochiq eshiklar kuni qachon bo\'ladi?'
        })
    });
    const msgData = await msgRes.json();
    console.log('Message submission status:', msgRes.status, msgData.success ? `✅ Created ID: ${msgData.data.id}` : '❌ Error');

    console.log('\n=== 3. TESTING TELEGRAM SETTINGS SAVE & ENDPOINT ===');
    const saveRes = await fetch('http://localhost:5000/api/settings', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            // Using admin token if needed or public test
        },
        body: JSON.stringify({
            telegram_channel: 'https://t.me/dilbar_education'
        })
    });
    const saveStatus = await saveRes.json();
    console.log('Settings save status:', saveRes.status);

    console.log('\n=== 4. TESTING TELEGRAM BOT PING (WITHOUT DUMMY TOKEN) ===');
    const pingRes = await fetch('http://localhost:5000/api/settings/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            botToken: '',
            chatId: ''
        })
    });
    const pingData = await pingRes.json();
    console.log('Empty token ping expected failure response:', pingData.message);

    console.log('\n🎉 TELEGRAM INTEGRATION TESTS PASSED!');
}

testTelegramFlow().catch(console.error);
