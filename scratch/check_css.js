const fs = require('fs');

const css = fs.readFileSync('mian.css', 'utf8');

const classesToCheck = [
    'honors-grid', 'honor-card', 'honor-img-wrap', 'honor-info', 'honor-rank',
    'contact-grid', 'faq-accordion-wrap', 'contact-form-card', 'contact-mini-info-cards',
    'main-footer', 'footer-grid', 'footer-col', 'footer-social-links',
    'teachers-grid', 'teacher-card', 'teacher-image-wrapper', 'teacher-body',
    'test-cards-grid', 'test-card', 'leaderboard-card',
    'about-info-hero-grid', 'about-story-card', 'about-four-pillars', 'infrastructure-card',
    'hero-grid', 'hero-visual', 'hero-actions', 'hero-countdown-box'
];

classesToCheck.forEach(cls => {
    const hasClass = css.includes('.' + cls);
    console.log(`${cls}: ${hasClass ? 'FOUND' : 'MISSING'}`);
});
