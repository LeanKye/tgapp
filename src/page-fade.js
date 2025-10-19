(function () {
  const MAX_WAIT_MS = 400;   // максимум ждём критичные картинки
  const MIN_NOP_MS  = 40;    // если уложились быстрее — без анимации
  const SOFT_REVEAL_MS = 180; // мягкий дедлайн показа

  function inViewport(el) {
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return r.top < vh * 0.85 && r.bottom > 0;
  }

  function waitCriticalImages(timeoutMs) {
    // Берём только видимые и достаточно крупные изображения, максимум 3 самых больших
    const candidates = Array.from(document.images)
      .map(img => ({ img, rect: img.getBoundingClientRect() }))
      .filter(({ img, rect }) => inViewport(img) && (rect.width * rect.height) > 16000)
      .sort((a, b) => (b.rect.width * b.rect.height) - (a.rect.width * a.rect.height))
      .slice(0, 3)
      .map(({ img }) => img);

    if (!candidates.length) return Promise.resolve();

    let remaining = candidates.filter(img => !img.complete || img.naturalWidth === 0);
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
    // шкала 40..400 мс -> 60..220 мс
    const clamped = Math.max(40, Math.min(loadMs, 400));
    const dur = 60 + ((clamped - 40) / (400 - 40)) * (220 - 60);
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

  const onReady = () => {
    const start = performance.now();
    const waitPromise = waitCriticalImages(MAX_WAIT_MS);
    const softReveal = new Promise(r => setTimeout(r, SOFT_REVEAL_MS));
    Promise.race([waitPromise, softReveal]).then(() => {
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