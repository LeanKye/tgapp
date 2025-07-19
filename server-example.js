// Пример серверной части для обработки уведомлений Robokassa
// Используйте Express.js или любой другой фреймворк

const express = require('express');
const crypto = require('crypto');
const app = express();

// Конфигурация Robokassa
const ROBOKASSA_CONFIG = {
  merchantLogin: 'ВАШ_ЛОГИН',
  password1: 'ВАШ_ПАРОЛЬ_1',
  password2: 'ВАШ_ПАРОЛЬ_2',
  isTest: true
};

// Middleware для парсинга данных
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Генерация подписи
function generateSignature(orderId, amount, password) {
  const signatureString = `${ROBOKASSA_CONFIG.merchantLogin}:${amount}:${orderId}:${password}`;
  return crypto.createHash('md5').update(signatureString).digest('hex');
}

// Проверка подписи
function verifySignature(orderId, amount, signature, password) {
  const expectedSignature = generateSignature(orderId, amount, password);
  return signature.toLowerCase() === expectedSignature.toLowerCase();
}

// Обработка уведомления от Robokassa
app.post('/api/robokassa/notification', (req, res) => {
  const {
    OutSum,           // Сумма платежа
    InvId,            // Номер заказа
    SignatureValue,   // Подпись
    EMail,            // Email пользователя
    Fee,              // Комиссия
    OutSumCurrency    // Валюта
  } = req.body;

  console.log('Получено уведомление от Robokassa:', req.body);

  // Проверяем подпись
  const isValidSignature = verifySignature(
    InvId, 
    OutSum, 
    SignatureValue, 
    ROBOKASSA_CONFIG.password2
  );

  if (!isValidSignature) {
    console.error('Неверная подпись уведомления');
    res.status(400).send('WRONG SIGNATURE');
    return;
  }

  try {
    // Сохраняем заказ в базу данных
    saveOrder({
      orderId: InvId,
      amount: OutSum,
      email: EMail,
      fee: Fee,
      currency: OutSumCurrency,
      status: 'paid',
      timestamp: new Date()
    });

    // Отправляем уведомление в Telegram
    sendTelegramNotification({
      orderId: InvId,
      amount: OutSum,
      email: EMail
    });

    // Отвечаем Robokassa
    res.send(`OK${InvId}`);

  } catch (error) {
    console.error('Ошибка обработки заказа:', error);
    res.status(500).send('ERROR');
  }
});

// Обработка успешной оплаты (возврат пользователя)
app.get('/api/robokassa/success', (req, res) => {
  const { OutSum, InvId, SignatureValue } = req.query;

  // Проверяем подпись
  const isValidSignature = verifySignature(
    InvId, 
    OutSum, 
    SignatureValue, 
    ROBOKASSA_CONFIG.password1
  );

  if (!isValidSignature) {
    res.redirect('/payment-error?reason=invalid_signature');
    return;
  }

  // Перенаправляем на страницу успеха
  res.redirect(`/payment-success?order=${InvId}&amount=${OutSum}`);
});

// Обработка неуспешной оплаты
app.get('/api/robokassa/fail', (req, res) => {
  const { OutSum, InvId } = req.query;
  
  // Обновляем статус заказа
  updateOrderStatus(InvId, 'failed');
  
  // Перенаправляем на страницу ошибки
  res.redirect(`/payment-error?order=${InvId}&amount=${OutSum}`);
});

// Функция сохранения заказа (замените на вашу БД)
function saveOrder(orderData) {
  console.log('Сохраняем заказ:', orderData);
  // Здесь должна быть логика сохранения в базу данных
  // Например: await db.orders.create(orderData);
}

// Функция отправки уведомления в Telegram
async function sendTelegramNotification(data) {
  const botToken = 'ВАШ_BOT_TOKEN';
  const chatId = 'ВАШ_CHAT_ID';
  
  const message = `
💰 Новый заказ оплачен!

📋 Номер заказа: ${data.orderId}
💳 Сумма: ${data.amount} ₽
📧 Email: ${data.email || 'Не указан'}
⏰ Время: ${new Date().toLocaleString('ru-RU')}
  `;

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML'
      })
    });

    if (!response.ok) {
      throw new Error('Ошибка отправки в Telegram');
    }

    console.log('Уведомление отправлено в Telegram');
  } catch (error) {
    console.error('Ошибка отправки в Telegram:', error);
  }
}

// Функция обновления статуса заказа
function updateOrderStatus(orderId, status) {
  console.log(`Обновляем статус заказа ${orderId} на ${status}`);
  // Здесь должна быть логика обновления в базе данных
}

// Создание платежа (для фронтенда)
app.post('/api/robokassa/create-payment', (req, res) => {
  const { orderId, amount, description, email } = req.body;

  // Генерируем подпись
  const signature = generateSignature(orderId, amount, ROBOKASSA_CONFIG.password1);

  // Формируем данные для Robokassa
  const paymentData = {
    MerchantLogin: ROBOKASSA_CONFIG.merchantLogin,
    OutSum: amount,
    Description: description,
    InvId: orderId,
    Email: email,
    Culture: 'ru',
    Encoding: 'utf-8',
    SignatureValue: signature,
    IsTest: ROBOKASSA_CONFIG.isTest ? 1 : 0
  };

  // URL для перенаправления на Robokassa
  const robokassaUrl = 'https://auth.robokassa.ru/Merchant/Index.aspx';
  
  res.json({
    success: true,
    paymentUrl: robokassaUrl,
    paymentData: paymentData
  });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`URL для уведомлений: http://localhost:${PORT}/api/robokassa/notification`);
});

module.exports = app; 