import './style.css'

function profileTemplate() {
  return `
    <div class="catalog">
      <div class="category-title" style="padding-left:16px; padding-right:16px; margin-top: calc(env(safe-area-inset-top) + 12px); font-size: 24px;">Профиль</div>
      <div class="container profile-card">
        <div class="profile-avatar" id="profile-avatar"></div>
        <div class="profile-info">
          <div class="profile-name" id="profile-name">—</div>
          <div class="profile-sub" id="profile-sub">Настройки</div>
        </div>
        <button class="reset-Button profile-next" aria-label="Открыть настройки">›</button>
      </div>
      <div class="quick-actions">
        <button class="reset-Button quick-action" id="qa-fav">
          <span class="qa-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21c-.3 0-.6-.1-.8-.3C6 16.5 3 13.8 3 9.9 3 7.2 5.2 5 7.9 5c1.6 0 3.1.8 4.1 2.1C13 5.8 14.5 5 16.1 5 18.8 5 21 7.2 21 9.9c0 3.9-3 6.6-8.2 10.8-.2.2-.5.3-.8.3z"/>
            </svg>
          </span>
          <span class="qa-title">Избранное</span>
        </button>
        <button class="reset-Button quick-action" id="qa-orders">
          <span class="qa-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="3" y1="7" x2="13" y2="7" />
                <polyline points="16,7 18,9 22,5" />
                <line x1="3" y1="15" x2="13" y2="15" />
                <polyline points="16,15 18,17 22,13" />
              </g>
            </svg>
          </span>
          <span class="qa-title">Заказы</span>
        </button>
      </div>
      <div class="container profile-menu">
        <button class="reset-Button profile-menu-item" data-link="info.html#privacy"><span>Политика конфиденциальности</span></button>
        <button class="reset-Button profile-menu-item" data-link="info.html#consent"><span>Согласие на обработку персональных данных</span></button>
        <button class="reset-Button profile-menu-item" data-link="info.html#consent-newsletter"><span>Согласие на рассылку</span></button>
        <button class="reset-Button profile-menu-item" data-link="info.html#refund"><span>Отмена заказа и возврат</span></button>
        <button class="reset-Button profile-menu-item" data-link="info.html#service-terms"><span>Условия предоставления услуг</span></button>
        <button class="reset-Button profile-menu-item" data-link="info.html#offer"><span>Публичная оферта</span></button>
        <button class="reset-Button profile-menu-item" data-link="info.html#contacts"><span>Контакты</span></button>
        <button class="reset-Button profile-menu-item" data-link="info.html#about"><span>О нас</span></button>
      </div>
    </div>
  `;
}

// Получаем данные пользователя из Telegram WebApp
function getTelegramUser() {
  try {
    const tg = window.Telegram?.WebApp;
    return tg?.initDataUnsafe?.user || null;
  } catch {
    return null;
  }
}

function renderProfileHeader(user) {
  const avatar = document.getElementById('profile-avatar');
  const nameEl = document.getElementById('profile-name');
  const subEl = document.getElementById('profile-sub');

  avatar.textContent = '?';
  nameEl.textContent = 'Узнать обновления площадки';
  subEl.textContent = 'Перейти';
}

function renderOrders() {
  // История заказов удалена — ничего не рендерим
}

function attachMenuHandlers() {
  document.querySelectorAll('.profile-menu-item').forEach(btn => {
    const handler = () => {
      const link = btn.dataset.link;
      if (!link) return;
      if (link.startsWith('mailto:') || link.startsWith('https://')) {
        window.open(link, '_blank');
      } else {
        if (window.AppNav && typeof window.AppNav.go === 'function') {
          window.AppNav.go(link);
        } else {
          const basePath = window.location.pathname.replace(/[^/]*$/, '');
          window.location.href = basePath + link;
        }
      }
    };
    btn.addEventListener('click', handler);
    // Fast-tap с защитой от скролла/удержания
    let sx=0, sy=0, st=0; const MOVE=8, HOLD=300;
    const onPD = (e) => { sx = e.clientX; sy = e.clientY; st = performance.now(); btn.__moved = false; };
    const onPM = (e) => { if (!st) return; if (Math.abs(e.clientX - sx) > MOVE || Math.abs(e.clientY - sy) > MOVE) btn.__moved = true; };
    const onPU = () => { const dur = performance.now() - (st || performance.now()); const ok = !btn.__moved && dur <= HOLD; st = 0; if (!ok) return; if (btn.__fastTapLock) return; btn.__fastTapLock = true; try { handler(); } finally { setTimeout(() => { btn.__fastTapLock = false; }, 250); } };
    btn.addEventListener('pointerdown', onPD, { passive: true });
    btn.addEventListener('pointermove', onPM, { passive: true });
    btn.addEventListener('pointerup', onPU, { passive: true });
    btn.addEventListener('touchend', onPU, { passive: true });
  });

  const favBtn = document.getElementById('qa-fav');
  const ordersBtn = document.getElementById('qa-orders');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      // заглушка
    });
  }
  if (ordersBtn) {
    ordersBtn.addEventListener('click', () => {
      // заглушка
    });
  }
}

export async function mountProfile(appContainer) {
  appContainer.innerHTML = profileTemplate();
  renderProfileHeader(getTelegramUser());
  renderOrders();
  attachMenuHandlers();
  try { window.refreshBottomNavActive && window.refreshBottomNavActive(); } catch {}
}

export function unmountProfile() {
  const app = document.querySelector('#app');
  if (app) app.innerHTML = '';
}
