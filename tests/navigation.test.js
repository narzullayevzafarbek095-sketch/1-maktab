const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('🧪 Boshlandi: DILBAR EDICATION Navigatsiya va Bo\'limlar tekshiruvi...');

const htmlPath = path.join(__dirname, '../index.html');
const cssPath = path.join(__dirname, '../mian.css');
const jsPath = path.join(__dirname, '../java.js');

const html = fs.readFileSync(htmlPath, 'utf8');
const css = fs.readFileSync(cssPath, 'utf8');
const js = fs.readFileSync(jsPath, 'utf8');

// 1. Check if top-nav-ribbon exists inside header
assert(html.includes('class="top-nav-ribbon"'), 'Top navigation ribbon HTML da mavjud emas!');
assert(html.includes('class="top-nav-list"'), 'Top navigation list HTML da mavjud emas!');

// 2. Expected DILBAR EDICATION sections
const expectedSections = [
    { id: 'hero', name: 'Asosiy' },
    { id: 'about', name: 'Akademiya haqida' },
    { id: 'tests', name: 'Onlayn Test' },
    { id: 'teachers', name: 'Ustozlar & Mentorlar' },
    { id: 'honors', name: 'Faxriy O\'quvchilar' },
    { id: 'contact', name: 'Aloqa & Qabul' }
];

console.log('🔍 DILBAR EDICATION faol bo\'limlari tekshirilmoqda:');
expectedSections.forEach(sec => {
    // Check href in top navbar
    const hasNavLink = html.includes(`href="#${sec.id}"`);
    assert(hasNavLink, `Havola topilmadi: href="#${sec.id}"`);

    // Check target section ID exists in page
    const hasSection = html.includes(`id="${sec.id}"`);
    assert(hasSection, `Sahifada bo'lim topilmadi: id="${sec.id}"`);

    console.log(`  ✅ [${sec.id}] -> Top link va Target Section mos keladi`);
});

// 3. Confirm that all removed sections are NOT present in navigation or page
const removedSections = ['news', 'kundalik', 'library', 'clubs', 'timetable', 'gallery', 'tools'];
removedSections.forEach(sec => {
    const hasSection = html.includes(`<section class="${sec}-section`) || html.includes(`<section class="section-padding" id="${sec}"`);
    assert(!hasSection, `Olib tashlanishi kerak bo'lgan bo'lim hali ham mavjud: ${sec}`);
    console.log(`  🗑️ [${sec}] -> Bo'lim to'liq olib tashlangan`);
});

// 4. Check branding
assert(html.includes('DILBAR EDICATION'), 'HTML da DILBAR EDICATION brendi topilmadi!');
assert(js.includes('DILBAR EDICATION'), 'java.js da DILBAR EDICATION brendi topilmadi!');

console.log('\n🎉 DILBAR EDICATION BARCHA TEKSHIRUVLAR MUVAFFAQIYATLI O\'TDI!');
