// =========================================================
// PORTFÓLIO — GABRIEL ANDRADE
// Arquivo: js/main.js
//
// SUMÁRIO
// 01. Cursor personalizado
// 02. Efeito de digitação no Hero
// 03. Animação Reveal ao rolar a página
// 04. Alteração visual da navbar no scroll
// 05. Tracking de visitas - SupaBase + IP GEO
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

// =========================================================
// 05. TRACKING DE VISITAS — SUPABASE + IP GEOLOCATION
//
// SETUP (faça isso UMA VEZ antes de usar):
//
//  1. Crie conta em https://supabase.com (gratuito)
//  2. Crie um novo projeto
//  3. Vá em "SQL Editor" e rode o SQL do arquivo: supabase-setup.sql
//  4. Vá em Project Settings → API
//     - Copie a "Project URL"  → cole em SUPABASE_URL abaixo
//     - Copie a "anon public"  → cole em SUPABASE_KEY abaixo
//  5. Cole este bloco no seu main.js (ou no <script> do index.html)
// =========================================================

const SUPABASE_URL =  'https://upzxedxfifhvdhwlphvw.supabase.co'
const SUPABASE_KEY = 'sb_publishable_2tx3XDBRHeRgp7KVolM2QA_a9JPO3Qw';  

async function registrarVisita() {
  try {
    // Pega dados de geolocalização pelo IP 
    const geo = await fetch('https://ipapi.co/json/').then(r => r.json());

    const visita = {
      ip:         geo.ip         || 'desconhecido',
      cidade:     geo.city       || 'desconhecida',
      regiao:     geo.region     || 'desconhecida',
      pais:       geo.country_name || 'desconhecido',
      pais_codigo: geo.country_code || '--',
      latitude:   geo.latitude   || null,
      longitude:  geo.longitude  || null,
      dispositivo: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      navegador:  navigator.userAgent.slice(0, 120),
      pagina:     window.location.pathname,
      referrer:   document.referrer || 'direto',
      // visitado_em é preenchido automaticamente pelo Supabase (now())
    };

    await fetch(`${SUPABASE_URL}/rest/v1/visitas`, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(visita),
    });

  } catch (e) {
    // Falha silenciosa — não quebra o site se algo der errado
    console.warn('[tracking] erro ao registrar visita:', e.message);
  }
}

// =========================================================
// 06. SISTEMA DE IDIOMAS (i18n) — PT-BR / EN
// =========================================================
const i18n = {
  pt: {
    'nav.about':    'Sobre',
    'nav.projects': 'Projetos',
    'nav.certs':    'Cursos',
    'nav.contact':  'Contato',
    'hero.tag':     'Disponível para contratações',
    'hero.desc':    'Bacharelando em Engenharia de Software, desenvolvedor web apaixonado por construir experiências digitais funcionais e elegantes. Técnico em Redes com background em Python, JavaScript, HTML e CSS.',
    'hero.cta':     'Contato',
    'hero.scroll':  'scroll para ver mais',
    'about.label':  '01 — Sobre mim',
    'about.title':  'Código que<br>resolve problemas.',
    'about.p1':     'Tenho <strong>20 anos</strong>, sou de Recife — PE, e estou cursando <strong>Engenharia de Software</strong> na Universidade Católica de Brasília. Antes disso, me formei técnico em <strong>Redes de Computadores</strong> pela ETE Professor Lucilo Ávila Pessoa.',
    'about.p2':     'Meu interesse por programação vai além da sala de aula: construo projetos reais, automações úteis e plataformas web com foco em código limpo e experiência do usuário. Tenho inglês avançado certificado (<strong>C1 – EF SET</strong>), o que me permite consumir e contribuir com conteúdo técnico internacional sem barreiras.',
    'about.stat1':  'Projetos no GitHub',
    'about.stat2':  'Commits (Nexy Animes)',
    'about.stat3':  'Inglês (EF SET)',
    'about.stat4':  'Certificações técnicas',
    'skills.label': '02 — Habilidades',
    'skills.title': 'Stack &<br>Tecnologias.',
    'projects.label':'03 — Projetos',
    'projects.title':'Minhas<br>construções.',
    'proj.featured': 'Destaque',
    'proj.automation':'Automação',
    'proj.nexy.desc': 'Plataforma de streaming de animes e filmes construída do zero com HTML, CSS e JavaScript. Conta com sistema de login, catálogo em JSON, player de episódios, páginas de detalhes e scripts Python para geração de thumbnails.',
    'proj.blacksheep.desc': 'Ferramenta de automação Python para processamento e análise de grandes bases de dados em planilhas Excel. Gera relatórios automatizados, filtra registros e exporta resultados consolidados, reduzindo trabalho manual repetitivo.',
    'proj.uis.desc': 'Plataforma web institucional desenvolvida como projeto universitário. Possui arquitetura modular, componentes reutilizáveis, seção de membros e navegação dinâmica via JavaScript.',
    'proj.portfolio.type': 'Este Site',
    'proj.portfolio.name': 'Portfólio Pessoal',
    'proj.portfolio.desc': 'Este portfólio foi construído do zero como um projeto completo, integrando front-end, back-end e cloud. Inclui sistema de tracking de visitantes com geolocalização por IP, painel administrativo protegido, banco de dados SQL no Supabase, deploy contínuo na Vercel e suporte a múltiplos idiomas.',
    'certs.label':  '04 — Formação',
    'certs.title':  'Cursos &<br>Certificações.',
    'cert.db':      'Banco de Dados — Trilha (38h)',
    'cert.db.meta': 'Ago 2025 · Concluído',
    'cert.model':   'Modelagem de Dados',
    'cert.model.meta':'Ago 2025 · Concluído',
    'cert.mobile':  'Aplicações Mobile com Android Studio',
    'cert.mobile.meta':'Jul 2025 · Concluído',
    'cert.excel':   'Microsoft Excel 2016 — Básico',
    'cert.excel.meta':'Jul 2025 · Concluído',
    'cert.biz':     'Estratégia de Negócios',
    'cert.biz.meta':'Jul 2025 · Concluído',
    'cert.en':      'Inglês — Nível C1',
    'cert.en.meta': 'Certificado · EF SET English Certificate',
    'cert.net':     'Técnico em Redes de Computadores',
    'cert.net.meta':'Diploma Técnico · Concluído',
    'contact.label':'05 — Contato',
    'contact.title':'Vamos<br>conversar.',
    'contact.sub':  'Aberto a contratação, projetos freelance e colaborações. Me manda uma mensagem!',
    'footer.built': 'Construido com <span class="heart">♥</span> em HTML · CSS · JS',
  },
  en: {
    'nav.about':    'About',
    'nav.projects': 'Projects',
    'nav.certs':    'Courses',
    'nav.contact':  'Contact',
    'hero.tag':     'Available for opportunities',
    'hero.desc':    'Software Engineering undergraduate, passionate web developer focused on building functional and elegant digital experiences. Network technician with background in Python, JavaScript, HTML and CSS.',
    'hero.cta':     'Contact',
    'hero.scroll':  'scroll for more',
    'about.label':  '01 — About me',
    'about.title':  'Code that<br>solves problems.',
    'about.p1':     'I\'m <strong>20 years old</strong>, from Recife — PE, Brazil, and I\'m studying <strong>Software Engineering</strong> at the Catholic University of Brasília. Before that, I earned a technician degree in <strong>Computer Networks</strong> from ETE Prof. Lucilo Ávila Pessoa.',
    'about.p2':     'My interest in programming goes beyond the classroom: I build real projects, useful automations and web platforms with a focus on clean code and user experience. I have advanced certified English (<strong>C1 – EF SET</strong>), which allows me to consume and contribute to international technical content without barriers.',
    'about.stat1':  'GitHub Projects',
    'about.stat2':  'Commits (Nexy Animes)',
    'about.stat3':  'English (EF SET)',
    'about.stat4':  'Technical certifications',
    'skills.label': '02 — Skills',
    'skills.title': 'Stack &<br>Technologies.',
    'projects.label':'03 — Projects',
    'projects.title':'My<br>builds.',
    'proj.featured': 'Featured',
    'proj.automation':'Automation',
    'proj.nexy.desc': 'Anime and movie streaming platform built from scratch with HTML, CSS and JavaScript. Features a login system, JSON catalog, episode player, detail pages and Python scripts for thumbnail generation.',
    'proj.blacksheep.desc': 'Python automation tool for processing and analyzing large Excel spreadsheet databases. Generates automated reports, filters records and exports consolidated results, reducing repetitive manual work.',
    'proj.uis.desc': 'Institutional web platform developed as a university project. Features modular architecture, reusable components, a members section and dynamic JavaScript navigation.',
    'proj.portfolio.type': 'This Site',
    'proj.portfolio.name': 'Personal Portfolio',
    'proj.portfolio.desc': 'This portfolio was built from scratch as a complete full-stack project. It includes a visitor tracking system with IP-based geolocation, a protected admin dashboard, SQL database on Supabase, continuous deployment on Vercel and multi-language support.',
    'certs.label':  '04 — Education',
    'certs.title':  'Courses &<br>Certifications.',
    'cert.db':      'Database — Full Track (38h)',
    'cert.db.meta': 'Aug 2025 · Completed',
    'cert.model':   'Data Modeling',
    'cert.model.meta':'Aug 2025 · Completed',
    'cert.mobile':  'Mobile Apps with Android Studio',
    'cert.mobile.meta':'Jul 2025 · Completed',
    'cert.excel':   'Microsoft Excel 2016 — Basic',
    'cert.excel.meta':'Jul 2025 · Completed',
    'cert.biz':     'Business Strategy',
    'cert.biz.meta':'Jul 2025 · Completed',
    'cert.en':      'English — C1 Level',
    'cert.en.meta': 'Certificate · EF SET English Certificate',
    'cert.net':     'Computer Networks Technician',
    'cert.net.meta':'Technical Diploma · Completed',
    'contact.label':'05 — Contact',
    'contact.title':'Let\'s<br>talk.',
    'contact.sub':  'Open to job offers, freelance projects and collaborations. Send me a message!',
    'footer.built': 'Built with <span class="heart">♥</span> in HTML · CSS · JS',
  }
};

let currentLang = localStorage.getItem('lang') || 'pt';

function applyLang(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key] !== undefined) el.innerHTML = i18n[lang][key];
  });
  const btn = document.getElementById('langBtn');
  if (btn) btn.innerHTML = lang === 'pt' ? '🇺🇸 EN' : '🇧🇷 PT';
}

function toggleLang() {
  applyLang(currentLang === 'pt' ? 'en' : 'pt');
}

// Aplica o idioma salvo quando a página carrega
applyLang(currentLang);