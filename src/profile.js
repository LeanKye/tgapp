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
    btn.addEventListener('click', () => {
      const link = btn.dataset.link;
      if (!link) return;
      if (link.startsWith('mailto:') || link.startsWith('https://')) {
        window.open(link, '_blank');
      } else {
        const basePath = window.location.pathname.replace(/[^/]*$/, '');
        window.location.href = basePath + link;
      }
    });
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


