import './style.css'

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
        const basePath = window.location.pathname.replace(/[^/]*$/, '');
        window.location.href = basePath + link;
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

document.addEventListener('DOMContentLoaded', () => {
  renderProfileHeader(getTelegramUser());
  renderOrders();
  attachMenuHandlers();
});


