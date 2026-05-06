// =========================================================
// PORTFÓLIO — GABRIEL ANDRADE
// Arquivo: js/main.js
//
// SUMÁRIO
// 01. Cursor personalizado
// 02. Efeito de digitação no Hero
// 03. Animação Reveal ao rolar a página
// 04. Alteração visual da navbar no scroll
// =========================================================

// =========================================================
// 01. CURSOR PERSONALIZADO
// =========================================================
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursorRing');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; cursor.style.left = mx+'px'; cursor.style.top = my+'px'; });
function animateRing() {
  rx += (mx - rx) * 0.12;
  ry += (my - ry) * 0.12;
  ring.style.left = rx+'px';
  ring.style.top = ry+'px';
  requestAnimationFrame(animateRing);
}
animateRing();
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => { ring.style.transform = 'translate(-50%,-50%) scale(1.6)'; ring.style.borderColor = 'rgba(0,229,204,0.8)'; });
  el.addEventListener('mouseleave', () => { ring.style.transform = 'translate(-50%,-50%) scale(1)'; ring.style.borderColor = 'rgba(0,229,204,0.5)'; });
});

// =========================================================
// 02. EFEITO DE DIGITAÇÃO NO HERO
// =========================================================
const phrases = [
  'Software Engineering Student',
  'Web Developer',
  'Python Automation',
  'Redes & Cloud',
  'Always Learning...'
];
let pi = 0, ci = 0, del = false;
const typingEl = document.getElementById('typing-text');
function type() {
  const current = phrases[pi];
  if (!del) {
    typingEl.textContent = current.slice(0, ++ci);
    if (ci === current.length) { del = true; setTimeout(type, 1800); return; }
  } else {
    typingEl.textContent = current.slice(0, --ci);
    if (ci === 0) { del = false; pi = (pi + 1) % phrases.length; }
  }
  setTimeout(type, del ? 40 : 80);
}
type();

// =========================================================
// 03. ANIMAÇÃO REVEAL AO ROLAR A PÁGINA
// =========================================================
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// =========================================================
// 04. ALTERAÇÃO VISUAL DA NAVBAR NO SCROLL
// =========================================================
window.addEventListener('scroll', () => {
  document.querySelector('nav').style.background = window.scrollY > 60
    ? 'rgba(8,11,16,0.95)' : 'rgba(8,11,16,0.7)';
});