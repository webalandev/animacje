document.addEventListener('DOMContentLoaded', () => {
  const state = {
    speedMultiplier: 1.0,
    reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    currentScreen: 0,
    activeModalCard: null
  };

  const introCurtain = document.getElementById('introCurtain');
  const btnReplayIntro = document.getElementById('btnReplayIntro');
  let introTimerA = null;
  let introTimerB = null;

  function playIntro(isReplay = false) {
    if (!introCurtain || state.reducedMotion) {
      if (introCurtain) introCurtain.classList.add('hidden');
      return;
    }
    clearTimeout(introTimerA);
    clearTimeout(introTimerB);

    if (isReplay) {
      introCurtain.classList.add('instant-reset');
      introCurtain.classList.remove('hidden', 'revealed');
      void introCurtain.offsetHeight;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          introCurtain.classList.remove('instant-reset');
          introTimerA = setTimeout(() => {
            introCurtain.classList.add('revealed');
            introTimerB = setTimeout(() => {
              introCurtain.classList.add('hidden');
            }, 1000 * state.speedMultiplier);
          }, 350 * state.speedMultiplier);
        });
      });
    } else {
      introCurtain.classList.remove('hidden', 'revealed');
      void introCurtain.offsetHeight;

      introTimerA = setTimeout(() => {
        introCurtain.classList.add('revealed');
        introTimerB = setTimeout(() => {
          introCurtain.classList.add('hidden');
        }, 1000 * state.speedMultiplier);
      }, 250 * state.speedMultiplier);
    }
  }

  playIntro(false);

  if (btnReplayIntro) {
    btnReplayIntro.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      playIntro(true);
    });
  }

  const fpsCounter = document.getElementById('fpsCounter');
  let lastFpsTime = performance.now();
  let frameCount = 0;
  let fpsTimer = 0;

  function loopFps(now) {
    const delta = now - lastFpsTime;
    lastFpsTime = now;
    frameCount++;
    fpsTimer += delta;

    if (fpsTimer >= 450) {
      const currentFps = Math.round((frameCount * 1000) / fpsTimer);
      if (fpsCounter) {
        fpsCounter.textContent = `${Math.min(currentFps, 60)} FPS`;
      }
      frameCount = 0;
      fpsTimer = 0;
    }
    requestAnimationFrame(loopFps);
  }
  requestAnimationFrame(loopFps);

  const canvas = document.getElementById('waveCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    let mouseX = -1000;
    let mouseY = -1000;

    window.addEventListener('pointermove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const spacing = 52;
    let waveTime = 0;

    function drawWave() {
      ctx.clearRect(0, 0, width, height);
      if (!state.reducedMotion) {
        waveTime += 0.025 * state.speedMultiplier;
      }

      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);

      ctx.fillStyle = '#0f172a';

      for (let r = 0; r <= rows; r++) {
        for (let c = 0; c <= cols; c++) {
          const baseX = c * spacing;
          const baseY = r * spacing;

          const dx = mouseX - baseX;
          const dy = mouseY - baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let offsetX = state.reducedMotion ? 0 : Math.sin(waveTime + r * 0.22) * 3.5;
          let offsetY = state.reducedMotion ? 0 : Math.cos(waveTime + c * 0.22) * 3.5;

          if (!state.reducedMotion && dist < 170) {
            const force = (1 - dist / 170) * 16;
            offsetX -= (dx / dist) * force;
            offsetY -= (dy / dist) * force;
          }

          ctx.beginPath();
          ctx.arc(baseX + offsetX, baseY + offsetY, 1.25, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(drawWave);
    }
    requestAnimationFrame(drawWave);
  }

  const charSpans = document.querySelectorAll('.char-span');
  window.addEventListener('pointermove', (e) => {
    if (state.reducedMotion) return;
    charSpans.forEach((span) => {
      const rect = span.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 130) {
        const factor = (1 - dist / 130);
        const transX = -(dx / dist) * factor * 16;
        const transY = -(dy / dist) * factor * 16;
        const rot = (dx / dist) * factor * 12;
        span.style.transform = `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 0) rotate(${rot.toFixed(1)}deg) scale(1.06)`;
      } else {
        span.style.transform = '';
      }
    });
  });

  const resetHeroLetters = () => {
    charSpans.forEach((span) => {
      span.style.transform = '';
    });
  };
  window.addEventListener('pointerup', resetHeroLetters);
  window.addEventListener('pointercancel', resetHeroLetters);

  const screenTabs = document.querySelectorAll('.screen-tab-btn');
  const screenPanes = document.querySelectorAll('.screen-pane');
  const screenWiper = document.getElementById('screenWiper');
  const dynamicNum = document.getElementById('dynamicNum');
  let isScreenTransitioning = false;

  function animateCounter() {
    if (!dynamicNum) return;
    if (state.reducedMotion) {
      dynamicNum.textContent = '100%';
      return;
    }
    let startVal = 0;
    const targetVal = 100;
    const startTime = performance.now();
    const duration = 650 * state.speedMultiplier;

    function updateNum(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (targetVal - startVal) * ease);
      dynamicNum.textContent = `${current}%`;

      if (progress < 1) {
        requestAnimationFrame(updateNum);
      }
    }
    requestAnimationFrame(updateNum);
  }

  function activateScreen(targetIndex) {
    if (targetIndex === state.currentScreen || isScreenTransitioning) return;
    isScreenTransitioning = true;

    screenTabs.forEach((t, i) => {
      const isCurrent = i === targetIndex;
      t.classList.toggle('active', isCurrent);
      t.setAttribute('aria-selected', isCurrent.toString());
      t.tabIndex = isCurrent ? 0 : -1;
    });

    if (state.reducedMotion) {
      screenPanes.forEach((p) => p.classList.remove('active'));
      screenPanes[targetIndex].classList.add('active');
      state.currentScreen = targetIndex;
      if (targetIndex === 2) animateCounter();
      isScreenTransitioning = false;
      return;
    }

    screenWiper.classList.remove('wiping-out');
    screenWiper.classList.add('wiping-in');

    setTimeout(() => {
      screenPanes.forEach((p) => p.classList.remove('active'));
      screenPanes[targetIndex].classList.add('active');
      state.currentScreen = targetIndex;

      if (targetIndex === 2) animateCounter();

      screenWiper.classList.remove('wiping-in');
      screenWiper.classList.add('wiping-out');

      setTimeout(() => {
        screenWiper.classList.remove('wiping-out');
        isScreenTransitioning = false;
      }, 380 * state.speedMultiplier);
    }, 320 * state.speedMultiplier);
  }

  screenTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      const targetIndex = parseInt(tab.getAttribute('data-screen'), 10);
      activateScreen(targetIndex);
    });

    tab.addEventListener('keydown', (e) => {
      let nextIndex = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextIndex = (index + 1) % screenTabs.length;
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        nextIndex = (index - 1 + screenTabs.length) % screenTabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = screenTabs.length - 1;
      }

      if (nextIndex !== null) {
        e.preventDefault();
        screenTabs[nextIndex].focus();
        activateScreen(nextIndex);
      }
    });
  });

  const flipSpecimens = document.querySelectorAll('.flip-specimen');
  const flipModalStage = document.getElementById('flipModalStage');
  const modalCard = document.getElementById('modalCard');
  const btnModalClose = document.getElementById('btnModalClose');
  const btnModalBackdrop = document.getElementById('btnModalBackdrop');
  const modalSlotGraphic = document.getElementById('modalSlotGraphic');
  const modalBadgeId = document.getElementById('modalBadgeId');
  const modalHeading = document.getElementById('modalHeading');
  const modalCopy = document.getElementById('modalCopy');

  const cardDetails = {
    '1': {
      badge: 'KAFELEK // 01',
      title: 'Orbita Współrzędnych',
      copy: 'Ten kafelek urósł płynnie ze swojej pierwotnej pozycji na karcie za pomocą techniki FLIP (First, Last, Invert, Play). Zamknij go krzyżykiem, klikając w tło lub wciskając Escape: zwinie się dokładnie na swoje miejsce!'
    },
    '2': {
      badge: 'KAFELEK // 02',
      title: 'Siatka Kwadratowa',
      copy: 'Precyzyjna modernistyczna proporcja. Element powiększa się proporcjonalnie i gładko pozycjonuje na środku ekranu, bez żadnych zbędnych skoków i przeskoków.'
    },
    '3': {
      badge: 'KAFELEK // 03',
      title: 'Pryzmat Wektorowy',
      copy: 'Geometryczny pryzmat wektorowy. Całe przejście wylicza różnicę wymiarów i pozycji za pomocą prostego kodu w czystym JavaScript i WAAPI.'
    }
  };

  function openCardModal(card) {
    state.activeModalCard = card;
    const first = card.getBoundingClientRect();

    const cardId = card.getAttribute('data-card');
    const details = cardDetails[cardId] || cardDetails['1'];

    if (modalBadgeId) modalBadgeId.textContent = details.badge;
    if (modalHeading) modalHeading.textContent = details.title;
    if (modalCopy) modalCopy.textContent = details.copy;

    const svg = card.querySelector('.specimen-graphic svg');
    if (modalSlotGraphic && svg) {
      modalSlotGraphic.innerHTML = '';
      modalSlotGraphic.appendChild(svg.cloneNode(true));
    }

    flipModalStage.classList.add('active');
    flipModalStage.setAttribute('aria-hidden', 'false');
    const last = modalCard.getBoundingClientRect();

    if (state.reducedMotion) {
      modalCard.style.transform = 'translate3d(0, 0, 0)';
      if (btnModalClose) btnModalClose.focus();
      return;
    }

    const deltaX = first.left - last.left;
    const deltaY = first.top - last.top;
    const scaleX = first.width / last.width;
    const scaleY = first.height / last.height;

    const anim = modalCard.animate([
      {
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
        opacity: 0.8
      },
      {
        transform: 'translate3d(0, 0, 0) scale(1, 1)',
        opacity: 1
      }
    ], {
      duration: 450 * state.speedMultiplier,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    });

    anim.onfinish = () => {
      anim.cancel();
      modalCard.style.transform = 'translate3d(0, 0, 0)';
      if (btnModalClose) btnModalClose.focus();
    };
  }

  flipSpecimens.forEach((card) => {
    let startX = 0;
    let startY = 0;
    let didDrag = false;

    card.addEventListener('pointerdown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      didDrag = false;
    });

    card.addEventListener('pointermove', (e) => {
      if (state.reducedMotion) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = -((y - centerY) / centerY) * 8;
      const rotateY = ((x - centerX) / centerX) * 8;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;

      const orbitSvg = card.querySelector('.svg-orbit');
      if (orbitSvg && e.pointerType === 'touch') {
        orbitSvg.style.transform = `rotate(${(rotateY * 4).toFixed(1)}deg) scale(1.08)`;
      }

      if (Math.hypot(e.clientX - startX, e.clientY - startY) > 8) {
        didDrag = true;
      }
    });

    const resetCardState = () => {
      card.style.transform = '';
      const orbitSvg = card.querySelector('.svg-orbit');
      if (orbitSvg) orbitSvg.style.transform = '';
    };

    card.addEventListener('pointerleave', resetCardState);
    card.addEventListener('pointercancel', resetCardState);
    card.addEventListener('pointerup', () => {
      setTimeout(resetCardState, 140);
    });

    card.addEventListener('click', () => {
      if (didDrag) {
        didDrag = false;
        return;
      }
      openCardModal(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openCardModal(card);
      }
    });
  });

  const flipContainer = document.getElementById('flipContainer');
  const pagerDots = document.querySelectorAll('.flip-pager .pager-dot');

  if (flipContainer && pagerDots.length > 0) {
    let scrollTimeout = null;
    flipContainer.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = flipContainer.scrollLeft;
        const containerWidth = flipContainer.clientWidth;
        const center = scrollLeft + containerWidth / 2;

        let closestIndex = 0;
        let minDiff = Infinity;

        flipSpecimens.forEach((card, idx) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const diff = Math.abs(center - cardCenter);
          if (diff < minDiff) {
            minDiff = diff;
            closestIndex = idx;
          }
        });

        pagerDots.forEach((dot, idx) => {
          const isActive = idx === closestIndex;
          dot.classList.toggle('active', isActive);
          dot.setAttribute('aria-current', isActive ? 'true' : 'false');
        });
      }, 40);
    }, { passive: true });

    pagerDots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const idx = parseInt(dot.getAttribute('data-index'), 10);
        if (flipSpecimens[idx]) {
          flipSpecimens[idx].scrollIntoView({
            behavior: state.reducedMotion ? 'auto' : 'smooth',
            inline: 'center',
            block: 'nearest'
          });
        }
      });
    });
  }

  function closeModal() {
    if (!state.activeModalCard || !flipModalStage.classList.contains('active')) {
      flipModalStage.classList.remove('active');
      flipModalStage.setAttribute('aria-hidden', 'true');
      return;
    }

    const previousCard = state.activeModalCard;

    if (state.reducedMotion) {
      flipModalStage.classList.remove('active');
      flipModalStage.setAttribute('aria-hidden', 'true');
      modalCard.style.transform = '';
      state.activeModalCard = null;
      if (previousCard) previousCard.focus();
      return;
    }

    const first = modalCard.getBoundingClientRect();
    const last = previousCard.getBoundingClientRect();

    const deltaX = last.left - first.left;
    const deltaY = last.top - first.top;
    const scaleX = last.width / first.width;
    const scaleY = last.height / first.height;

    const anim = modalCard.animate([
      {
        transform: 'translate3d(0, 0, 0) scale(1, 1)',
        opacity: 1
      },
      {
        transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(${scaleX}, ${scaleY})`,
        opacity: 0
      }
    ], {
      duration: 360 * state.speedMultiplier,
      easing: 'cubic-bezier(0.16, 1, 0.3, 1)'
    });

    anim.onfinish = () => {
      anim.cancel();
      flipModalStage.classList.remove('active');
      flipModalStage.setAttribute('aria-hidden', 'true');
      modalCard.style.transform = '';
      state.activeModalCard = null;
      if (previousCard) previousCard.focus();
    };
  }

  if (btnModalClose) btnModalClose.addEventListener('click', closeModal);
  if (btnModalBackdrop) btnModalBackdrop.addEventListener('click', closeModal);

  window.addEventListener('keydown', (e) => {
    if (flipModalStage.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'Tab') {
        const focusable = modalCard.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (focusable.length > 0) {
          const firstElement = focusable[0];
          const lastElement = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  });

  const shockwaveArena = document.getElementById('shockwaveArena');
  const shockCoords = document.getElementById('shockCoords');

  function triggerShockwave(x, y) {
    if (!shockwaveArena) return;
    const pulse = document.createElement('div');
    pulse.className = 'wave-pulse';
    pulse.style.left = `${x}px`;
    pulse.style.top = `${y}px`;
    pulse.style.animationDuration = `${750 * state.speedMultiplier}ms`;

    shockwaveArena.appendChild(pulse);

    pulse.addEventListener('animationend', () => pulse.remove());
    setTimeout(() => {
      if (pulse.parentNode) pulse.remove();
    }, 1000 * state.speedMultiplier);
  }

  if (shockwaveArena) {
    let isShockwaveDown = false;
    let lastShockwaveTime = 0;
    let lastShockX = 0;
    let lastShockY = 0;

    const handleCoords = (clientX, clientY) => {
      const rect = shockwaveArena.getBoundingClientRect();
      const x = Math.round(clientX - rect.left);
      const y = Math.round(clientY - rect.top);
      if (shockCoords && x >= 0 && y >= 0 && x <= rect.width && y <= rect.height) {
        shockCoords.textContent = `POZYCJA: [ ${x}px, ${y}px ]`;
      }
    };

    shockwaveArena.addEventListener('pointerdown', (e) => {
      isShockwaveDown = true;
      const rect = shockwaveArena.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      lastShockX = x;
      lastShockY = y;
      lastShockwaveTime = performance.now();
      handleCoords(e.clientX, e.clientY);
      triggerShockwave(x, y);
    });

    shockwaveArena.addEventListener('pointermove', (e) => {
      handleCoords(e.clientX, e.clientY);
      if (isShockwaveDown) {
        const now = performance.now();
        const rect = shockwaveArena.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const dist = Math.hypot(x - lastShockX, y - lastShockY);
        if (now - lastShockwaveTime > 90 && dist > 24) {
          lastShockwaveTime = now;
          lastShockX = x;
          lastShockY = y;
          triggerShockwave(x, y);
        }
      }
    });

    const stopShockwave = () => {
      isShockwaveDown = false;
    };
    window.addEventListener('pointerup', stopShockwave);
    window.addEventListener('pointercancel', stopShockwave);

    shockwaveArena.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const rect = shockwaveArena.getBoundingClientRect();
        triggerShockwave(rect.width / 2, rect.height / 2);
      }
    });
  }

  const morphPath = document.getElementById('morphPath');
  const morphButtons = document.querySelectorAll('.morph-selector-btn');
  const morphCenterDot = document.querySelector('.morph-center-dot') || document.querySelector('.morph-core-dot');
  const NUM_POINTS = 60;

  function generatePoints(type) {
    const pts = [];
    const cx = 100;
    const cy = 100;

    if (type === 'circle') {
      const r = 68;
      for (let i = 0; i < NUM_POINTS; i++) {
        const angle = (i / NUM_POINTS) * Math.PI * 2 - Math.PI / 2;
        pts.push({
          x: cx + r * Math.cos(angle),
          y: cy + r * Math.sin(angle)
        });
      }
    } else if (type === 'diamond') {
      const vertices = [
        { x: 100, y: 28 },
        { x: 172, y: 100 },
        { x: 100, y: 172 },
        { x: 28, y: 100 }
      ];
      const perSide = NUM_POINTS / 4;
      for (let s = 0; s < 4; s++) {
        const v1 = vertices[s];
        const v2 = vertices[(s + 1) % 4];
        for (let i = 0; i < perSide; i++) {
          const t = i / perSide;
          pts.push({
            x: v1.x + (v2.x - v1.x) * t,
            y: v1.y + (v2.y - v1.y) * t
          });
        }
      }
    } else if (type === 'star') {
      const rOuter = 76;
      const rInner = 32;
      const starVerts = [];
      for (let j = 0; j < 10; j++) {
        const a = (j / 10) * Math.PI * 2 - Math.PI / 2;
        const r = (j % 2 === 0) ? rOuter : rInner;
        starVerts.push({
          x: cx + r * Math.cos(a),
          y: (cy + 2) + r * Math.sin(a)
        });
      }
      const perEdge = NUM_POINTS / 10;
      for (let s = 0; s < 10; s++) {
        const v1 = starVerts[s];
        const v2 = starVerts[(s + 1) % 10];
        for (let i = 0; i < perEdge; i++) {
          const t = i / perEdge;
          pts.push({
            x: v1.x + (v2.x - v1.x) * t,
            y: v1.y + (v2.y - v1.y) * t
          });
        }
      }
    } else if (type === 'drop') {
      for (let i = 0; i < NUM_POINTS; i++) {
        const t = (i / NUM_POINTS) * Math.PI * 2;
        const x = cx + 64 * Math.sin(t) * Math.pow(Math.sin(t / 2), 1.5);
        const y = 168 - 140 * Math.sin(t / 2);
        pts.push({ x, y });
      }
    }

    return pts;
  }

  function pointsToSvgPath(pts) {
    if (!pts || pts.length === 0) return '';
    let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
    for (let i = 1; i < pts.length; i++) {
      d += ` L ${pts[i].x.toFixed(1)} ${pts[i].y.toFixed(1)}`;
    }
    return d + ' Z';
  }

  let currentPoints = generatePoints('circle');
  if (morphPath) {
    morphPath.setAttribute('d', pointsToSvgPath(currentPoints));
  }

  let morphAnimFrame = null;

  function morphToShape(shapeName) {
    const targetPoints = generatePoints(shapeName);
    if (state.reducedMotion) {
      currentPoints = targetPoints;
      if (morphPath) morphPath.setAttribute('d', pointsToSvgPath(currentPoints));
      return;
    }

    const startPoints = currentPoints.map(p => ({ ...p }));
    const startTime = performance.now();
    const duration = 480 * state.speedMultiplier;

    if (morphAnimFrame) cancelAnimationFrame(morphAnimFrame);

    if (morphCenterDot) {
      morphCenterDot.style.transform = 'scale(1.4)';
      setTimeout(() => {
        morphCenterDot.style.transform = 'scale(1)';
      }, 300);
    }

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);

      for (let i = 0; i < NUM_POINTS; i++) {
        currentPoints[i].x = startPoints[i].x + (targetPoints[i].x - startPoints[i].x) * ease;
        currentPoints[i].y = startPoints[i].y + (targetPoints[i].y - startPoints[i].y) * ease;
      }

      if (morphPath) {
        morphPath.setAttribute('d', pointsToSvgPath(currentPoints));
      }

      if (progress < 1) {
        morphAnimFrame = requestAnimationFrame(step);
      }
    }

    morphAnimFrame = requestAnimationFrame(step);
  }

  const morphShapeNames = ['circle', 'diamond', 'star', 'drop'];
  let currentShapeIdx = 0;

  function switchMorphShape(idx) {
    currentShapeIdx = (idx + morphShapeNames.length) % morphShapeNames.length;
    const target = morphShapeNames[currentShapeIdx];
    morphButtons.forEach((b) => {
      const isActive = b.getAttribute('data-shape') === target;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', isActive.toString());
    });
    morphToShape(target);
  }

  morphButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const shape = btn.getAttribute('data-shape');
      const idx = morphShapeNames.indexOf(shape);
      if (idx !== -1) {
        switchMorphShape(idx);
      }
    });
  });

  const morphShapeContainer = document.querySelector('.morph-shape-container');
  if (morphShapeContainer) {
    let morphTouchStartX = 0;
    let morphTouchStartY = 0;

    morphShapeContainer.addEventListener('pointerdown', (e) => {
      morphTouchStartX = e.clientX;
      morphTouchStartY = e.clientY;
    });

    morphShapeContainer.addEventListener('pointerup', (e) => {
      const dx = e.clientX - morphTouchStartX;
      const dy = e.clientY - morphTouchStartY;
      if (Math.abs(dx) > 30 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          switchMorphShape(currentShapeIdx + 1);
        } else {
          switchMorphShape(currentShapeIdx - 1);
        }
      }
    });
  }

  const sandbox = document.getElementById('physicsSandbox');
  const domBlocks = document.querySelectorAll('.phys-block');
  const btnMagnetize = document.getElementById('btnMagnetize');
  const btnScatter = document.getElementById('btnScatter');

  function getResponsiveBlockPosition(idx) {
    if (!sandbox) return { x: 40 + idx * 140, y: 50 };
    const w = sandbox.clientWidth;
    const h = sandbox.clientHeight;
    const blockW = domBlocks[idx] ? domBlocks[idx].offsetWidth || 120 : 120;
    const blockH = domBlocks[idx] ? domBlocks[idx].offsetHeight || 70 : 70;

    if (w < 520) {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const gapX = Math.max(10, (w - blockW * 2) / 3);
      const gapY = Math.max(12, (h - blockH * 2) / 3);
      return {
        x: Math.round(gapX + col * (blockW + gapX)),
        y: Math.round(gapY + row * (blockH + gapY))
      };
    } else {
      const gapX = Math.max(16, (w - blockW * 4) / 5);
      const centerY = Math.round((h - blockH) / 2);
      return {
        x: Math.round(gapX + idx * (blockW + gapX)),
        y: centerY
      };
    }
  }

  const blockObjects = [];

  domBlocks.forEach((el, idx) => {
    const pos = getResponsiveBlockPosition(idx);
    const obj = {
      el,
      x: pos.x,
      y: pos.y,
      vx: 0,
      vy: 0,
      isDragging: false,
      dragOffsetX: 0,
      dragOffsetY: 0,
      history: []
    };

    el.style.transform = `translate3d(${obj.x}px, ${obj.y}px, 0)`;

    el.addEventListener('pointerdown', (e) => {
      obj.isDragging = true;
      const rect = el.getBoundingClientRect();
      const sRect = sandbox.getBoundingClientRect();

      obj.dragOffsetX = e.clientX - rect.left;
      obj.dragOffsetY = e.clientY - rect.top;
      obj.vx = 0;
      obj.vy = 0;
      obj.history = [{ x: e.clientX, y: e.clientY, time: performance.now() }];

      el.setPointerCapture(e.pointerId);
    });

    window.addEventListener('pointermove', (e) => {
      if (!obj.isDragging) return;
      const sRect = sandbox.getBoundingClientRect();

      let targetX = e.clientX - sRect.left - obj.dragOffsetX;
      let targetY = e.clientY - sRect.top - obj.dragOffsetY;

      const maxX = sandbox.clientWidth - el.offsetWidth;
      const maxY = sandbox.clientHeight - el.offsetHeight;

      targetX = Math.max(0, Math.min(maxX, targetX));
      targetY = Math.max(0, Math.min(maxY, targetY));

      obj.x = targetX;
      obj.y = targetY;

      obj.history.push({ x: e.clientX, y: e.clientY, time: performance.now() });
      if (obj.history.length > 5) obj.history.shift();

      el.style.transform = `translate3d(${obj.x.toFixed(1)}px, ${obj.y.toFixed(1)}px, 0)`;
    });

    const releaseDrag = () => {
      if (!obj.isDragging) return;
      obj.isDragging = false;

      if (!state.reducedMotion && obj.history.length >= 2) {
        const last = obj.history[obj.history.length - 1];
        const prev = obj.history[0];
        const dt = Math.max(last.time - prev.time, 16);

        const computedVx = ((last.x - prev.x) / dt) * 18;
        const computedVy = ((last.y - prev.y) / dt) * 18;

        obj.vx = Math.max(-28, Math.min(28, computedVx));
        obj.vy = Math.max(-28, Math.min(28, computedVy));
      }
    };

    window.addEventListener('pointerup', releaseDrag);
    window.addEventListener('pointercancel', releaseDrag);

    blockObjects.push(obj);
  });

  window.addEventListener('resize', () => {
    if (!sandbox) return;
    blockObjects.forEach((obj) => {
      const maxX = sandbox.clientWidth - obj.el.offsetWidth;
      const maxY = sandbox.clientHeight - obj.el.offsetHeight;
      obj.x = Math.max(0, Math.min(maxX, obj.x));
      obj.y = Math.max(0, Math.min(maxY, obj.y));
      obj.el.style.transform = `translate3d(${obj.x.toFixed(1)}px, ${obj.y.toFixed(1)}px, 0)`;
    });
  });

  function physicsLoop() {
    if (!sandbox) return;
    const maxXBase = sandbox.clientWidth;
    const maxYBase = sandbox.clientHeight;

    blockObjects.forEach((obj) => {
      if (obj.isDragging) return;

      if (!state.reducedMotion && (Math.abs(obj.vx) > 0.05 || Math.abs(obj.vy) > 0.05)) {
        obj.x += obj.vx * state.speedMultiplier;
        obj.y += obj.vy * state.speedMultiplier;

        const maxX = maxXBase - obj.el.offsetWidth;
        const maxY = maxYBase - obj.el.offsetHeight;

        if (obj.x <= 0) {
          obj.x = 0;
          obj.vx = -obj.vx * 0.72;
        } else if (obj.x >= maxX) {
          obj.x = maxX;
          obj.vx = -obj.vx * 0.72;
        }

        if (obj.y <= 0) {
          obj.y = 0;
          obj.vy = -obj.vy * 0.72;
        } else if (obj.y >= maxY) {
          obj.y = maxY;
          obj.vy = -obj.vy * 0.72;
        }

        obj.vx *= 0.95;
        obj.vy *= 0.95;

        obj.el.style.transform = `translate3d(${obj.x.toFixed(1)}px, ${obj.y.toFixed(1)}px, 0)`;
      }
    });

    requestAnimationFrame(physicsLoop);
  }
  requestAnimationFrame(physicsLoop);

  if (btnMagnetize) {
    btnMagnetize.addEventListener('click', () => {
      blockObjects.forEach((obj, idx) => {
        const targetPos = getResponsiveBlockPosition(idx);
        const startX = obj.x;
        const startY = obj.y;
        obj.vx = 0;
        obj.vy = 0;

        if (state.reducedMotion) {
          obj.x = targetPos.x;
          obj.y = targetPos.y;
          obj.el.style.transform = `translate3d(${obj.x}px, ${obj.y}px, 0)`;
          return;
        }

        const startTime = performance.now();
        const duration = 480 * state.speedMultiplier;

        function tween(now) {
          const elapsed = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);

          obj.x = startX + (targetPos.x - startX) * ease;
          obj.y = startY + (targetPos.y - startY) * ease;

          obj.el.style.transform = `translate3d(${obj.x.toFixed(1)}px, ${obj.y.toFixed(1)}px, 0)`;

          if (progress < 1) {
            requestAnimationFrame(tween);
          } else {
            obj.x = targetPos.x;
            obj.y = targetPos.y;
            obj.el.style.transform = `translate3d(${obj.x}px, ${obj.y}px, 0)`;
          }
        }
        requestAnimationFrame(tween);
      });
    });
  }

  if (btnScatter) {
    btnScatter.addEventListener('click', () => {
      if (state.reducedMotion) return;
      blockObjects.forEach((obj) => {
        obj.vx = (Math.random() - 0.5) * 36;
        obj.vy = (Math.random() - 0.5) * 36;
      });
    });
  }

  const hyperBtn = document.getElementById('hyperBtn');
  const btnStatusText = document.getElementById('btnStatusText');
  let hyperTimeoutA = null;
  let hyperTimeoutB = null;

  if (hyperBtn) {
    hyperBtn.addEventListener('click', () => {
      if (hyperBtn.classList.contains('state-loading') || hyperBtn.classList.contains('state-success')) {
        return;
      }

      hyperBtn.classList.remove('state-idle');
      hyperBtn.classList.add('state-loading');
      if (btnStatusText) {
        btnStatusText.textContent = 'Stan: przetwarzanie zapytania...';
      }

      clearTimeout(hyperTimeoutA);
      clearTimeout(hyperTimeoutB);

      hyperTimeoutA = setTimeout(() => {
        hyperBtn.classList.remove('state-loading');
        hyperBtn.classList.add('state-success');
        if (btnStatusText) {
          btnStatusText.textContent = 'Stan: sukces! Operacja zatwierdzona.';
        }

        hyperTimeoutB = setTimeout(() => {
          hyperBtn.classList.remove('state-success');
          hyperBtn.classList.add('state-idle');
          if (btnStatusText) {
            btnStatusText.textContent = 'Stan: gotowy do kolejnego testu';
          }
        }, 1600 * state.speedMultiplier);
      }, 1200 * state.speedMultiplier);
    });
  }

  const speedChips = document.querySelectorAll('.speed-chip');
  const btnReducedMotion = document.getElementById('btnReducedMotion');
  const reducedMotionText = document.getElementById('reducedMotionText');

  speedChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const speed = parseFloat(chip.getAttribute('data-speed'));
      speedChips.forEach((c) => {
        const isActive = c === chip;
        c.classList.toggle('active', isActive);
        c.setAttribute('aria-pressed', isActive.toString());
      });

      state.speedMultiplier = 1 / speed;
      document.documentElement.style.setProperty('--speed-mult', state.speedMultiplier.toString());
    });
  });

  if (btnReducedMotion) {
    if (state.reducedMotion) {
      document.body.classList.add('reduced-motion-active');
      btnReducedMotion.setAttribute('aria-pressed', 'true');
      if (reducedMotionText) reducedMotionText.textContent = 'RUCH: ZREDUKOWANY';
    }

    btnReducedMotion.addEventListener('click', () => {
      state.reducedMotion = !state.reducedMotion;
      document.body.classList.toggle('reduced-motion-active', state.reducedMotion);
      btnReducedMotion.setAttribute('aria-pressed', state.reducedMotion.toString());
      if (reducedMotionText) {
        reducedMotionText.textContent = `RUCH: ${state.reducedMotion ? 'ZREDUKOWANY' : 'PEŁNY'}`;
      }
    });
  }
});
