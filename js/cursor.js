/**
 * @file cursor.js
 * @description Injects a custom glowing cursor that follows the mouse and
 *              expands when hovering interactive elements.
 *
 *              Uses textContent (not innerHTML) to inject the CSS string
 *              so the style tag itself is not an XSS surface.
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Cursor element ───────────────────────────────────────────────────────
  const cursor = document.createElement('div');
  cursor.classList.add('custom-cursor');
  document.body.appendChild(cursor);

  // ── Styles ───────────────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    body,
    a,
    button,
    .project-card,
    .social-btn { cursor: none; }

    .custom-cursor {
      position: fixed;
      top: 0;
      left: 0;
      width: 14px;
      height: 14px;
      border: 2px solid var(--primary);
      border-radius: 50%;
      pointer-events: none;
      z-index: 10000;
      transform: translate3d(-50%, -50%, 0);
      transition: width 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                  height 0.25s cubic-bezier(0.25, 1, 0.5, 1), 
                  background-color 0.25s ease;
      mix-blend-mode: difference;
      will-change: transform;
    }

    .custom-cursor.hover {
      width: 28px;
      height: 28px;
      background-color: rgba(224, 53, 21, 0.25);
    }
  `;
  document.head.appendChild(style);

  // ── Cursor tracking ──────────────────────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    requestAnimationFrame(() => {
      // Using transform translate3d instead of top/left for butter-smooth GPU rendering
      cursor.style.transform = \`translate3d(calc(\${e.clientX}px - 50%), calc(\${e.clientY}px - 50%), 0)\`;
    });
  });

  // ── Hover state ──────────────────────────────────────────────────────────
  const interactables = document.querySelectorAll('a, button, .project-card, .social-btn');
  interactables.forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
  });
});
