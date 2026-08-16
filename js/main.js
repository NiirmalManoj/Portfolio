/**
 * @file main.js
 * @description Initialises Lenis smooth-scroll and handles hash-anchor
 *              navigation when the page is loaded with a URL fragment
 *              (e.g. after clicking "Back to Portfolio" from a project page).
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Lenis smooth-scroll ──────────────────────────────────────────────────
  const lenis = new Lenis({
    duration:           1.2,
    easing:             (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation:        'vertical',
    gestureOrientation: 'vertical',
    smoothWheel:        true,
    smoothTouch:        false,
    touchMultiplier:    2,
  });

  /** Drives the Lenis RAF loop. */
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }

  requestAnimationFrame(raf);

  // ── Hash-anchor scroll ───────────────────────────────────────────────────
  // Uses getElementById instead of querySelector(hash) to avoid a
  // CSS selector SyntaxError when the fragment begins with a digit or
  // contains special characters (e.g. #1project).
  if (window.location.hash) {

    /**
     * Strips the leading '#', resolves the target element by ID,
     * and asks Lenis to scroll to it.
     */
    function scrollToHash() {
      const id     = window.location.hash.slice(1);
      const target = document.getElementById(id);
      if (target) {
        lenis.scrollTo(target, { offset: -50, duration: 1.5 });
      }
    }

    // Attempt scroll after DOMContentLoaded (fast path).
    setTimeout(scrollToHash, 100);

    // Retry after the full page load in case the canvas / images push
    // the layout further down before the first attempt fires.
    window.addEventListener('load', () => setTimeout(scrollToHash, 300));
  }
});
