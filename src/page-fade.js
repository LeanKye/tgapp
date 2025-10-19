(function () {
  const MAX_WAIT_MS = 700;   // максимум ждём критичные картинки
  const MIN_NOP_MS  = 60;    // если уложились быстрее — без анимации

  function inViewport(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.85 && r.bottom > 0;
  }

  function waitCriticalImages(timeoutMs) {
    const imgs = Array.from(document.images).filter(img => inViewport(img));
    if (!imgs.length) return Promise.resolve();

    let remaining = imgs.filter(img => !img.complete || img.naturalWidth === 0);
    if (!remaining.length) return Promise.resolve();

    return new Promise(resolve => {
      const timer = setTimeout(resolve, timeoutMs);
      const onDone = () => {
        remaining = remaining.filter(img => !img.complete || img.naturalWidth === 0);
        if (!remaining.length) {
          clearTimeout(timer);
          resolve();
        }
      };
      remaining.forEach(img => {
        img.addEventListener('load', onDone, { once: true });
        img.addEventListener('error', onDone, { once: true });
      });
    });
  }

  function mapDuration(loadMs) {
    if (loadMs < MIN_NOP_MS) return 0; // очень быстро: сразу без анимации
    // шкала 60..700 мс -> 80..280 мс
    const clamped = Math.max(60, Math.min(loadMs, 700));
    const dur = 80 + ((clamped - 60) / (700 - 60)) * (280 - 80);
    return Math.round(dur);
  }

  function showWithDuration(ms) {
    const dur = mapDuration(ms);
    document.body.style.setProperty('--page-fade-in', `${dur}ms`);
    document.body.classList.remove('leaving');
    if (dur === 0) {
      const prev = document.body.style.transition;
      document.body.style.transition = 'none';
      document.body.classList.add('loaded');
      requestAnimationFrame(() => { document.body.style.transition = prev; });
    } else {
      document.body.classList.add('loaded');
    }
  }

  // Возврат из bfcache: мгновенно, без анимации
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      document.body.style.setProperty('--page-fade-in', '0ms');
      document.body.classList.remove('leaving');
      document.body.classList.add('loaded');
    }
  });

  const start = performance.now();
  const onReady = () => {
    Promise.race([
      waitCriticalImages(MAX_WAIT_MS),
      new Promise(r => setTimeout(r, MAX_WAIT_MS))
    ]).then(() => {
      const elapsed = performance.now() - start;
      showWithDuration(elapsed);
    });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    onReady();
  } else {
    document.addEventListener('DOMContentLoaded', onReady, { once: true });
  }
})();


