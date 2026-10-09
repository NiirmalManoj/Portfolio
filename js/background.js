/**
 * @file background.js
 * @description Drives the fullscreen canvas background animation.
 *              Preloads a 240-frame JPEG sequence from assets/frames/ and
 *              scrubs through the frames in response to scroll position,
 *              with a lerp (linear interpolation) applied for smooth playback.
 */

(function () {
  'use strict';

  const TOTAL_FRAMES = 240;
  const LERP_FACTOR = 0.35; // Higher = snappier; lower = more lag

  const canvas = document.getElementById('animation-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: false });
  const loader = document.getElementById('loader');
  const loaderText = document.getElementById('loader-text');

  const images = [];
  let loadedCount = 0;
  let currentFrame = 0;
  let targetFrame = 0;
  let lastRenderedIdx = -1;

  // ── Helpers ────────────────────────────────────────────────────────────

  /**
   * Returns the URL for a given frame index (1-based).
   * @param {number} index
   * @returns {string}
   */
  function getFrameUrl(index) {
    return `assets/frames/ezgif-frame-${String(index).padStart(3, '0')}.jpg`;
  }

  /** Resizes the canvas to match the device pixel ratio and viewport. */
  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    lastRenderedIdx = -1; // Force redraw on resize
    renderFrame(currentFrame);
  }

  /**
   * Draws the given frame index onto the canvas using cover-fit scaling.
   * @param {number} frameIndex - Floating-point frame index (will be rounded).
   */
  function renderFrame(frameIndex) {
    const idx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(frameIndex)));
    if (idx === lastRenderedIdx) return; // Skip if we already rendered this exact frame

    const img = images[idx];
    if (!img || !img.complete || img.naturalWidth === 0) return;

    const viewW = window.innerWidth;
    const viewH = window.innerHeight;

    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, viewW, viewH);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const viewRatio = viewW / viewH;
    let drawW, drawH, drawX, drawY;

    if (viewRatio > imgRatio) {
      drawW = viewW;
      drawH = viewW / imgRatio;
      drawX = 0;
      drawY = (viewH - drawH) / 2;
    } else {
      drawH = viewH;
      drawW = viewH * imgRatio;
      drawX = (viewW - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    lastRenderedIdx = idx;
  }

  /** Maps the current scroll position to a frame index [0, TOTAL_FRAMES-1]. */
  function updateTargetFrame() {
    const scrollTop = window.lenis ? window.lenis.scroll : (window.scrollY || document.documentElement.scrollTop);
    const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    if (maxScroll <= 0) return;

    const fraction = Math.min(1, Math.max(0, scrollTop / maxScroll));
    targetFrame = fraction * (TOTAL_FRAMES - 1);
  }

  /** Main RAF loop — lerps currentFrame toward targetFrame each tick. */
  function tick() {
    updateTargetFrame();
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.001) {
      currentFrame += diff * LERP_FACTOR;
    }
    // Always attempt to render. If the image just finished loading in the background, 
    // it will be caught here and drawn, preventing the animation from getting "stuck".
    // The `lastRenderedIdx` check inside renderFrame ensures this is highly efficient.
    renderFrame(currentFrame);
    requestAnimationFrame(tick);
  }

  // ── Preload ────────────────────────────────────────────────────────────

  /** Preloads first frame, then loads the rest sequentially to avoid network lag. */
  function preloadImages() {
    // Initialize the array with empty Image objects so indices map correctly
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      images.push(new Image());
    }

    // Load first frame immediately to unblock the UI
    const firstImg = images[0];
    firstImg.onload = () => {
      loadedCount++;
      if (loader) loader.classList.add('hidden'); // Hide loader as soon as first frame is ready
      renderFrame(0);
      loadRestSequentially(); // Start loading the rest in the background
    };
    firstImg.onerror = () => {
      if (loader) loader.classList.add('hidden');
      loadRestSequentially();
    };
    firstImg.src = getFrameUrl(1);

    function loadRestSequentially() {
      let currentIndex = 1;
      const BATCH_SIZE = 8; // Load multiple frames at once to utilize network better
      
      const loadBatch = () => {
        if (currentIndex >= TOTAL_FRAMES) return;
        
        let loadedInBatch = 0;
        const currentBatchSize = Math.min(BATCH_SIZE, TOTAL_FRAMES - currentIndex);
        const startIndex = currentIndex;
        
        for (let i = 0; i < currentBatchSize; i++) {
          const imgIndex = startIndex + i;
          const img = images[imgIndex];
          
          img.onload = img.onerror = () => {
            loadedCount++;
            loadedInBatch++;
            
            if (loadedInBatch === currentBatchSize) {
              currentIndex += currentBatchSize;
              setTimeout(loadBatch, 5); // Small delay to yield to main thread
            }
          };
          img.src = getFrameUrl(imgIndex + 1);
        }
      };
      loadBatch();
    }
  }

  // ── Init ───────────────────────────────────────────────────────────────
  window.addEventListener('resize', resizeCanvas, { passive: true });
  // Removed redundant scroll listener as updateTargetFrame is called in tick()

  resizeCanvas();
  preloadImages();
  requestAnimationFrame(tick);
}());
