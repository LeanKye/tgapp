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

  if (user) {
    nameEl.textContent = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь';
    subEl.textContent = '@' + (user.username || '—');
    // Рисуем инициалы, т.к. изображения аватаров Telegram недоступны напрямую
    const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '');
    avatar.textContent = initials || '👤';
  } else {
    nameEl.textContent = 'Гость';
    subEl.textContent = 'Войдите через Telegram';
    avatar.textContent = '👤';
  }
}

function getMockOrders() {
  // Заглушка истории заказов
  return [
    { id: 'ORD-001', date: '11.12.2024', title: 'Adobe Creative Cloud', total: '800₽' },
    { id: 'ORD-002', date: '08.12.2024', title: 'Microsoft 365', total: '1200₽' },
  ];
}

function renderOrders() {
  const container = document.getElementById('profile-orders');
  const orders = getMockOrders();
  container.innerHTML = orders.map(o => `
    <div class="order-card" data-id="${o.id}">
      <div class="order-thumb"></div>
      <div class="order-content">
        <div class="order-title">${o.title}</div>
        <div class="order-sub">${o.date}</div>
      </div>
      <div class="order-total">${o.total}</div>
    </div>
  `).join('');
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
}

document.addEventListener('DOMContentLoaded', () => {
  renderProfileHeader(getTelegramUser());
  renderOrders();
  attachMenuHandlers();
});


