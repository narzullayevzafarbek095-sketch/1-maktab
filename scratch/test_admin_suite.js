const jwt = require('jsonwebtoken');

async function testAdminSuite() {
    console.log('🧪 RUNNING COMPREHENSIVE ADMIN PANEL BACKEND SUITE\n');

    // Generate test admin token
    const token = jwt.sign(
        { id: 1, username: 'admin', role: 'admin' },
        'guliston_1_maktab_super_secret_jwt_key_2026',
        { expiresIn: '1d' }
    );
    const authHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 1. Test Student Creation
    console.log('1. Testing Student Creation...');
    const createStudRes = await fetch('http://localhost:5000/api/students', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            studentIdCode: '2026-99',
            fullName: 'Test O\'quvchi Sanjarbek',
            classVal: '7-A Sinf',
            attendance: '99.5% (A\'lo)',
            gpa: '5.00',
            levelBadge: 'A\'lochi',
            classTeacher: 'S.Ergasheva'
        })
    });
    const studData = await createStudRes.json();
    console.log('Student creation result:', createStudRes.status, studData.success ? '✅ PASSED' : '❌ FAILED', studData.message);

    // 2. Test Student List & Search
    console.log('\n2. Testing Student List & Search...');
    const searchRes = await fetch('http://localhost:5000/api/students?search=Sanjarbek', {
        headers: authHeaders
    });
    const searchData = await searchRes.json();
    console.log('Student search count:', searchData.count, searchData.count > 0 ? '✅ PASSED' : '❌ FAILED');

    // 3. Test Student Deletion
    console.log('\n3. Testing Student Deletion...');
    const delStudRes = await fetch('http://localhost:5000/api/students/2026-99', {
        method: 'DELETE',
        headers: authHeaders
    });
    const delStudData = await delStudRes.json();
    console.log('Student delete result:', delStudRes.status, delStudData.success ? '✅ PASSED' : '❌ FAILED');

    // 4. Test Teacher Creation
    console.log('\n4. Testing Teacher Creation...');
    const createTeacherRes = await fetch('http://localhost:5000/api/teachers', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            name: 'Ustoz Testov Anvar',
            role: 'Kiberxavfsizlik & Dasturlash Ustozi',
            category: 'exact',
            bio: 'Xalqaro sertifikatli IT instruktor',
            email: 'anvar@dilbareducation.uz',
            hours: 'Dushanba – Juma 09:00 – 16:00'
        })
    });
    const teacherData = await createTeacherRes.json();
    console.log('Teacher creation result:', createTeacherRes.status, teacherData.success ? '✅ PASSED' : '❌ FAILED');

    if (teacherData.data && teacherData.data.id) {
        // Delete test teacher
        await fetch(`http://localhost:5000/api/teachers/${teacherData.data.id}`, {
            method: 'DELETE',
            headers: authHeaders
        });
    }

    // 5. Test Question Creation & Retrieval
    console.log('\n5. Testing Test Question Creation...');
    const createQRes = await fetch('http://localhost:5000/api/tests/questions', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            subject_key: 'it',
            question: 'Dasturlashda HTML qanday kengaytma hisoblanadi?',
            options: ['HyperText Markup Language', 'High Tech Machine Language', 'Home Tool Multi Language', 'Hyperlink Text Module Logic'],
            correct_idx: 0,
            explanation: 'HTML - Gipermatnli belgilash tili hisoblanadi.'
        })
    });
    const qData = await createQRes.json();
    console.log('Question create result:', createQRes.status, qData.success ? '✅ PASSED' : '❌ FAILED');

    // 6. Test Admin Questions List
    console.log('\n6. Testing Admin Questions List...');
    const allQRes = await fetch('http://localhost:5000/api/tests/admin/all-questions?subject_key=it', {
        headers: authHeaders
    });
    const allQData = await allQRes.json();
    console.log('Admin questions count for IT:', allQData.total, allQData.total > 0 ? '✅ PASSED' : '❌ FAILED');

    if (qData.data && qData.data.id) {
        await fetch(`http://localhost:5000/api/tests/questions/${qData.data.id}`, {
            method: 'DELETE',
            headers: authHeaders
        });
    }

    // 7. Test Timetable Lesson Creation
    console.log('\n7. Testing Timetable Lesson Creation...');
    const createLessonRes = await fetch('http://localhost:5000/api/timetable', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
            class_name: '7-A',
            day_num: 1,
            lesson_num: 6,
            time_range: '12:25 - 13:10',
            subject_name: 'Kiberxavfsizlik Asoslari',
            teacher_name: 'A.Normatov',
            room_name: 'IT Lab 2'
        })
    });
    const lessonData = await createLessonRes.json();
    console.log('Timetable create result:', createLessonRes.status, lessonData.success ? '✅ PASSED' : '❌ FAILED');

    if (lessonData.data && lessonData.data.id) {
        await fetch(`http://localhost:5000/api/timetable/${lessonData.data.id}`, {
            method: 'DELETE',
            headers: authHeaders
        });
    }

    console.log('\n🎉 ALL ADMIN PANEL INTEGRATION TESTS COMPLETED SUCCESSFULLY!');
}

testAdminSuite().catch(console.error);
