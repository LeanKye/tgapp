import './style.css'

function infoTemplate() {
  return `
    <div class="info-page">
      <header class="info-header">
        <h1>Информация</h1>
      </header>
      <main id="info-root">
        <div class="container">Загрузка…</div>
      </main>
    </div>
  `;
}

function getBasePath() {
  return window.location.pathname.replace(/[^/]*$/, '');
}

async function loadInfoContent() {
  const res = await fetch(getBasePath() + 'info.html', { credentials: 'same-origin' });
  const html = await res.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const main = doc.querySelector('main');
  return main ? main.innerHTML : '<div class="container">Не удалось загрузить содержимое</div>';
}

function initDynamicHeader() {
  const headerTitle = document.querySelector('.info-header h1');
  const sections = document.querySelectorAll('main section');
  const sectionTitles = {
    'privacy': 'Политика конфиденциальности',
    'offer': 'Публичная оферта',
    'consent': 'Согласие на обработку персональных данных',
    'consent-newsletter': 'Согласие на рассылку',
    'refund': 'Отмена заказа и возврат',
    'service-terms': 'Условия предоставления услуг',
    'contacts': 'Контакты',
    'about': 'О нас'
  };

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id;
        const newTitle = sectionTitles[sectionId] || 'Информация';
        headerTitle.style.opacity = '0.5';
        setTimeout(() => {
          headerTitle.textContent = newTitle;
          headerTitle.style.opacity = '1';
        }, 150);
      }
    });
  }, observerOptions);

  sections.forEach(section => observer.observe(section));

  const applyHash = () => {
    const id = (window.location.hash || '').replace('#', '');
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      try { el.scrollIntoView({ behavior: 'smooth', block: 'start' }); } catch { el.scrollIntoView(true); }
      if (sectionTitles[id]) headerTitle.textContent = sectionTitles[id];
    }
  };

  // начальная установка
  if (window.location.hash) {
    setTimeout(applyHash, 0);
  } else {
    const firstVisible = Array.from(sections).find(section => {
      const rect = section.getBoundingClientRect();
      return rect.top < window.innerHeight * 0.5 && rect.bottom > 0;
    });
    if (firstVisible) {
      const titleMap = sectionTitles[firstVisible.id] || 'Информация';
      headerTitle.textContent = titleMap;
    }
  }
  window.addEventListener('hashchange', applyHash);

  return () => {
    try { window.removeEventListener('hashchange', applyHash); } catch {}
    try { sections.forEach(section => observer.unobserve(section)); } catch {}
  };
}

let infoCleanup = null;

export async function mountInfo(appContainer, { hash } = {}) {
  appContainer.innerHTML = infoTemplate();
  document.body.classList.add('info-page');
  const infoRoot = document.getElementById('info-root');
  const inner = await loadInfoContent();
  infoRoot.innerHTML = inner;
  // Если пришёл хеш из роутера — прокрутим к нему
  if (hash) {
    try {
      const el = document.getElementById(hash);
      if (el) el.scrollIntoView({ behavior: 'auto', block: 'start' });
    } catch {}
  }
  infoCleanup = initDynamicHeader();
}

export function unmountInfo() {
  try { document.body.classList.remove('info-page'); } catch {}
  try { infoCleanup && infoCleanup(); } catch {}
  infoCleanup = null;
  const app = document.querySelector('#app');
  if (app) app.innerHTML = '';
}


