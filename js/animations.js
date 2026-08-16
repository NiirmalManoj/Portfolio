/**
 * @file animations.js
 * @description Scroll-reveal observer and magnetic social-icon effect.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll-reveal ────────────────────────────────────────────────────────
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      });
    },
    {
      threshold:  0.1,
      rootMargin: '0px 0px -50px 0px',
    }
  );

  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  // ── Magnetic buttons ─────────────────────────────────────────────────────
  document.querySelectorAll('.social-btn').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const { left, top, width, height } = el.getBoundingClientRect();
      const x = e.clientX - left - width  / 2;
      const y = e.clientY - top  - height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.1)`;
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'translate(0px, 0px) scale(1)';
    });
  });
});
