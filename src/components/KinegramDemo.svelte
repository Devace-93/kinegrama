<script>
  // Looping demo of the barrier-grid effect: the grid sheet (a bit taller than
  // the image) sweeps across the interlaced kinegram and back. The user can
  // also grab it (press and hold) and slide it by hand.
  // The PNG was interlaced with strip=3px over 480px, so the grid gradient
  // uses matching percentage stops: slit 0.625%, cycle 2.5% of the width.
  import { t } from '../i18n/index.svelte.js';
  import kinegram from '../assets/demo-kinegram.png';

  // must match the CSS demo-slide animation-duration
  const DURATION_MS = 15000;
  // minimum patch of the sheet that must stay visible while dragging
  const MIN_VISIBLE = 100;

  let sliderEl;
  let dragging = $state(false);
  let entryAnim = null; // WAAPI glide back into the sweep range
  let startX = 0;
  let startTx = 0;
  let tx = 0;
  let minTx = 0;
  let maxTx = 0;
  let imgW = 0;

  function down(e) {
    entryAnim?.cancel();
    entryAnim = null;
    // freeze the sweep where it is: swap the CSS animation for an inline pose
    tx = startTx = new DOMMatrixReadOnly(getComputedStyle(sliderEl).transform).m41;
    sliderEl.style.animation = 'none';
    sliderEl.style.transform = `translateX(${startTx}px)`;
    // drag bounds: the sheet may leave the sweep range and even the screen,
    // as long as MIN_VISIBLE px of it stay inside the visible clip area
    const clip = sliderEl.closest('.clip').getBoundingClientRect();
    const stage = sliderEl.parentElement.getBoundingClientRect();
    const sheetW = sliderEl.offsetWidth;
    imgW = sheetW / 1.5;
    const visLeft = Math.max(clip.left, 0);
    const visRight = Math.min(clip.right, window.innerWidth);
    minTx = visLeft + MIN_VISIBLE - sheetW - stage.left;
    maxTx = visRight - MIN_VISIBLE - stage.left;
    dragging = true;
    startX = e.clientX;
    sliderEl.setPointerCapture(e.pointerId);
  }
  function move(e) {
    if (!dragging) return;
    tx = Math.min(maxTx, Math.max(minTx, startTx + e.clientX - startX));
    sliderEl.style.transform = `translateX(${tx}px)`;
  }
  // re-enable the CSS sweep, offset to the time matching position x
  function resumeAt(x, min, max) {
    sliderEl.style.transform = '';
    sliderEl.style.animation = '';
    sliderEl.style.animationDelay = `${(-((max - x) / (max - min)) * DURATION_MS) / 1000}s`;
  }
  function up() {
    if (!dragging) return;
    dragging = false;
    // sweep endpoints, same as the demo-slide keyframes
    const min = -30;
    const max = imgW + 30;
    if (tx >= min && tx <= max) {
      resumeAt(tx, min, max);
    } else {
      // dragged out of the sweep range: glide back to the nearest endpoint
      // at sweep speed, then hand the loop back to the CSS animation
      const end = tx > max ? max : min;
      const speed = (max - min) / DURATION_MS; // px per ms
      sliderEl.style.transform = `translateX(${end}px)`;
      entryAnim = sliderEl.animate(
        [{ transform: `translateX(${tx}px)` }, { transform: `translateX(${end}px)` }],
        { duration: Math.abs(tx - end) / speed, easing: 'linear' }
      );
      entryAnim.onfinish = () => resumeAt(end, min, max);
    }
  }
</script>

<figure class="demo mb-3">
  <div class="clip">
    <div class="stage">
      <img class="kine border border-base-300" src={kinegram} alt={t('step1.demoAlt')} />
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        class="slider"
        class:dragging
        bind:this={sliderEl}
        onpointerdown={down}
        onpointermove={move}
        onpointerup={up}
        onpointercancel={up}
      >
        <div class="sheet"></div>
      </div>

      <!-- static tag marking the sheet's resting spot, right of the image -->
      <div class="ann ann-grid">
        <span class="chip">{t('step1.demoGrid')}</span>
        <svg class="arrow" viewBox="0 0 20 30" aria-hidden="true">
          <path d="M 10 2 C 9 10 10 15 10 22 M 5 17 L 10 25 L 15 17" />
        </svg>
      </div>

      <div class="ann ann-kine">
        <span class="chip">{t('step1.demoKinegram')}</span>
        <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M 2 12 C 8 12 12 12 18 12 M 13 6 L 20 12 L 13 18" />
        </svg>
      </div>

      <div class="ann ann-magic">
        <span class="chip chip-magic">✨ {t('step1.demoMagic')}</span>
      </div>

      <!-- drag affordance: shows while hovering/holding the sheet -->
      <div class="ann ann-drag" aria-hidden="true">
        <span class="chip">👆 {t('step1.demoDragTip')}</span>
      </div>
    </div>
  </div>
  <figcaption class="text-xs opacity-70 text-center mt-2">
    {t('step1.demoCaption')}
  </figcaption>
</figure>

<style>
  /* daisyUI styles `.card figure` as a flex row (for card images); undo that here */
  .demo {
    display: block;
  }
  .clip {
    overflow: hidden;
    /* headroom for the labels floating above the image and the sheet */
    padding-top: 72px;
  }
  .stage {
    position: relative;
    max-width: 400px;
    margin-inline: auto;
  }
  .kine {
    display: block;
    width: 100%;
    border-radius: 0.5rem;
  }
  /* The sheet is 1.5× the image width so the whole image stays covered (and
     animating) while the sheet sweeps its last half-width to the left. */
  .slider {
    position: absolute;
    left: 0;
    width: 150%;
    top: -6.5%;
    height: 113%;
    animation: demo-slide 15s linear infinite alternate;
    cursor: grab;
    touch-action: pan-y; /* horizontal drags are ours; vertical still scrolls */
  }
  .slider.dragging {
    cursor: grabbing;
  }
  .sheet {
    position: absolute;
    inset: 0;
    /* Slit/cycle are 0.625% / 2.5% of the IMAGE width; the gradient resolves
       percentages against this 1.5×-wide element, hence the ÷1.5 values. */
    background: repeating-linear-gradient(
      90deg,
      transparent 0 0.41667%,
      #111 0.41667% 1.66667%
    );
    border-radius: 4px;
    box-shadow: 0 2px 8px rgb(0 0 0 / 0.35);
  }
  .ann {
    position: absolute;
    pointer-events: none;
  }
  .chip {
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 9999px;
    border: 1px solid var(--color-base-300);
    background: color-mix(in oklab, var(--color-base-100) 92%, transparent);
    box-shadow: 0 1px 3px rgb(0 0 0 / 0.2);
    white-space: nowrap;
  }
  .arrow {
    width: 20px;
    height: 22px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
    opacity: 0.75;
  }
  /* static label 30px right of the image, arrow pointing down at the sheet's
     start/return position. Every gap here is 10px — arrow to image top,
     text to arrow — matching the kinegram label's gaps on the left. */
  .ann-grid {
    bottom: calc(100% + 10px);
    left: calc(100% + 30px);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }
  /* no side room on narrow screens: tuck it above the image's top-right */
  @media (max-width: 639px) {
    .ann-grid {
      left: auto;
      right: 0;
    }
  }
  /* label fully outside the image, at its left, arrow pointing into it */
  .ann-kine {
    right: calc(100% + 10px);
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  /* no side room on narrow screens: move it above the image's top-left,
     between the grid tag's band and the magic chip's band */
  @media (max-width: 639px) {
    .ann-kine {
      right: auto;
      left: 0;
      top: auto;
      bottom: calc(100% + 36px);
      transform: none;
    }
    .ann-kine .arrow {
      transform: rotate(90deg); /* → becomes ↓, pointing at the image */
    }
  }
  /* fades in only while the sheet is over the image (same 15s alternate
     clock as demo-slide, so it tracks the sweep in both directions) */
  .ann-magic {
    left: 50%;
    bottom: calc(100% + 8px);
    transform: translateX(-50%);
    opacity: 0;
    animation: magic-fade 15s linear infinite alternate;
  }
  .chip-magic {
    font-size: 12px;
  }
  /* keep clear of the grid tag's arrow on narrow screens: left-anchored
     (single line, like everywhere) instead of centered */
  @media (max-width: 639px) {
    .ann-magic {
      left: 0;
      transform: none;
    }
  }
  /* drag hint: fades in while the pointer is over (or holding) the sheet */
  .ann-drag {
    left: 50%;
    bottom: 10px;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.2s;
  }
  .slider:hover ~ .ann-drag,
  .slider.dragging ~ .ann-drag {
    opacity: 1;
  }
  @keyframes magic-fade {
    0%, 15% { opacity: 0; }
    25%, 100% { opacity: 1; }
  }
  /* One slow constant-speed sweep. The sheet's left edge starts 30px right of
     the image (66.667% of this 1.5×-wide element = the image width) and stops
     30px past the image's left edge — still covering it, since the sheet is
     half an image wider. `alternate` slides it back to the right, like moving
     an acetate by hand. */
  @keyframes demo-slide {
    from { transform: translateX(calc(66.667% + 30px)); }
    to   { transform: translateX(-30px); }
  }
  @media (prefers-reduced-motion: reduce) {
    .slider { display: none; } /* also disables the drag + its hint */
    .ann-grid { display: none; } /* it labels the (hidden) sheet */
    .ann-magic { animation: none; } /* stays at opacity 0 */
  }
</style>
