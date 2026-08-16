/**
 * @file typewriter.js
 * @description Typewriter effect for the hero tagline and stat counter animation.
 *              Instagram QR modal is also initialised here.
 */

(function initTypewriter() {
  const el = document.getElementById('nb-typed');
  if (!el) return;

  const LINES         = ['I ANALYZE LOGS.', 'I DETECT THREATS.', 'I SECURE SYSTEMS.', 'I BUILD DEFENSES.'];
  const TYPING_SPEED  = 75;
  const DELETING_SPEED = 38;
  const PAUSE_END     = 2000;
  const PAUSE_START   = 400;

  let lineIdx   = 0;
  let charIdx   = 0;
  let deleting  = false;

  function tick() {
    const current = LINES[lineIdx];

    if (!deleting) {
      el.textContent = current.slice(0, charIdx + 1);
      charIdx++;

      if (charIdx === current.length) {
        deleting = true;
        setTimeout(tick, PAUSE_END);
        return;
      }
      setTimeout(tick, TYPING_SPEED);
    } else {
      el.textContent = current.slice(0, charIdx - 1);
      charIdx--;

      if (charIdx === 0) {
        deleting = false;
        lineIdx  = (lineIdx + 1) % LINES.length;
        setTimeout(tick, PAUSE_START);
        return;
      }
      setTimeout(tick, DELETING_SPEED);
    }
  }

  // Delay start until after the loading overlay completes.
  setTimeout(tick, 1200);
}());


(function initStatCounters() {
  /**
   * Animates a single counter element from 0 to its data-target value.
   * @param {HTMLElement} el
   */
  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1200;
    const step     = Math.ceil(duration / target);
    let   current  = 0;

    const timer = setInterval(() => {
      current++;
      el.textContent = current;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.hero-stat-num').forEach((el) => observer.observe(el));
}());


(function initInstagramModal() {
  const igBtns  = document.querySelectorAll('.ig-btn');
  const modal   = document.getElementById('ig-modal');
  const closeBtn = document.querySelector('.ig-close');

  if (!modal) return;

  /** Opens the Instagram QR modal. */
  function openModal() {
    modal.style.display = 'flex';
    // Tiny delay allows the display change to paint before the transition fires.
    requestAnimationFrame(() => modal.classList.add('show'));
  }

  /** Closes the Instagram QR modal. */
  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }

  igBtns.forEach((btn) => btn.addEventListener('click', (e) => { e.preventDefault(); openModal(); }));
  closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
}());
