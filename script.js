const year = document.getElementById('year');
const INITIAL_LOAD_MS = 1200;
const TRANSITION_LOAD_MS = 420;
const TRANSITION_FLAG_KEY = 'ql-transition-nav';
const TRANSITION_TARGET_KEY = 'ql-transition-target';
let isNavigating = false;

if (year) {
  year.textContent = new Date().getFullYear();
}

function showTransitionLoader() {
  let loadingScreen = document.getElementById('loadingScreen');
  if (!loadingScreen) {
    loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading-screen';
    loadingScreen.id = 'loadingScreen';
    loadingScreen.innerHTML = `
      <div class="loading-logo">
        <img src="assets/logo/logo.png" alt="Loading" />
      </div>
    `;
    document.body.appendChild(loadingScreen);
  }
  loadingScreen.classList.remove('hidden');
}

function hideLoaderImmediately() {
  const loadingScreen = document.getElementById('loadingScreen');
  if (loadingScreen) {
    loadingScreen.classList.add('hidden');
  }
  isNavigating = false;
}

function shouldHandleTransition(event, link) {
  if (isNavigating || event.defaultPrevented) return false;
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
  if (link.target && link.target !== '_self') return false;

  const href = link.getAttribute('href');
  if (!href || href.startsWith('#')) return false;

  return true;
}

// Hide loading screen after page loads
document.addEventListener('DOMContentLoaded', () => {
  const loadingScreen = document.getElementById('loadingScreen');
  let fromTransitionNav = false;
  let transitionTarget = '';
  try {
    fromTransitionNav = window.sessionStorage.getItem(TRANSITION_FLAG_KEY) === '1';
    transitionTarget = window.sessionStorage.getItem(TRANSITION_TARGET_KEY) || '';
    if (fromTransitionNav) {
      window.sessionStorage.removeItem(TRANSITION_FLAG_KEY);
    }
    if (transitionTarget) {
      window.sessionStorage.removeItem(TRANSITION_TARGET_KEY);
    }
  } catch {
    fromTransitionNav = false;
    transitionTarget = '';
  }

  if (loadingScreen) {
    if (fromTransitionNav) {
      loadingScreen.classList.add('hidden');
    } else {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, INITIAL_LOAD_MS);
    }
  }

  if (transitionTarget && (window.location.pathname.endsWith('/index.html') || window.location.pathname === '/' || window.location.pathname === '')) {
    const targetEl = document.getElementById(transitionTarget);
    if (targetEl) {
      requestAnimationFrame(() => {
        targetEl.scrollIntoView({ block: 'start', behavior: 'auto' });
      });

      window.addEventListener('pageshow', (event) => {
        const navEntry = performance.getEntriesByType('navigation')[0];
        const isHistoryRestore = event.persisted || (navEntry && navEntry.type === 'back_forward');
        if (isHistoryRestore) {
          hideLoaderImmediately();
        }
      });

      window.addEventListener('pagehide', () => {
        hideLoaderImmediately();
      });
    }
  }

  const transitionLinks = document.querySelectorAll('.section-link, .back-button');
  transitionLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      if (!shouldHandleTransition(event, link)) return;
      event.preventDefault();
      isNavigating = true;
      showTransitionLoader();
      const href = link.getAttribute('href') || '';
      const hashIndex = href.indexOf('#');
      try {
        window.sessionStorage.setItem(TRANSITION_FLAG_KEY, '1');
        if (hashIndex !== -1 && hashIndex + 1 < href.length) {
          window.sessionStorage.setItem(TRANSITION_TARGET_KEY, href.slice(hashIndex + 1));
        } else {
          window.sessionStorage.removeItem(TRANSITION_TARGET_KEY);
        }
      } catch {}
      window.setTimeout(() => {
        window.location.href = href || link.href;
      }, TRANSITION_LOAD_MS);
    });
  });
});

const navLinks = document.querySelectorAll('.site-nav a');
navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

// Scrollspy: update active nav link while scrolling
(function () {
  const sections = Array.from(document.querySelectorAll('main section[id], footer[id]'));
  if (!sections.length) return; // nothing to track on this page

  let ticking = false;

  function updateActiveNav() {
    const header = document.querySelector('.site-header');
    const headerOffset = header ? header.offsetHeight + 24 : 24;
    const markerY = window.scrollY + headerOffset;
    const atPageBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    const contactEl = document.getElementById('contact');
    let currentId = null;

    if (contactEl) {
      const contactRect = contactEl.getBoundingClientRect();
      const footerVisible = contactRect.top < window.innerHeight && contactRect.bottom > 0;
      const nearContact = window.scrollY + window.innerHeight >= contactEl.offsetTop + 40;
      const hashIsContact = window.location.hash === '#contact';
      if (footerVisible || nearContact || (hashIsContact && atPageBottom)) {
        currentId = 'contact';
      }
    }

    if (!currentId) {
      for (const sec of sections) {
        if (markerY >= sec.offsetTop) {
          currentId = sec.id;
        } else {
          break;
        }
      }
    }

    if (atPageBottom && sections.length) {
      currentId = sections[sections.length - 1].id;
    }

    if (currentId) {
      navLinks.forEach((item) => {
        const href = item.getAttribute('href') || '';
        if (href === `#${currentId}`) item.classList.add('active');
        else item.classList.remove('active');
      });
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateActiveNav);
    }
  }, { passive: true });

  window.addEventListener('resize', updateActiveNav);
  // run once to set initial state
  updateActiveNav();
})();

/* cursor orb disabled for cleaner UX */

const tiltCards = document.querySelectorAll('.tilt-card');

function resetTilt(card) {
  card.style.setProperty('--rx', '0deg');
  card.style.setProperty('--ry', '0deg');
  card.style.setProperty('--ty', '0px');
}

tiltCards.forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    if (window.innerWidth < 800) return;

    const rect = card.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const ry = (px - 0.5) * 8;
    const rx = (0.5 - py) * 8;

    card.style.setProperty('--rx', `${rx}deg`);
    card.style.setProperty('--ry', `${ry}deg`);
    card.style.setProperty('--ty', '-4px');
  });

  card.addEventListener('pointerleave', () => resetTilt(card));
});

/* Simple lightweight lightbox for gallery pages */
(function () {
  const images = document.querySelectorAll('.gallery-img');
  if (!images.length) return;

  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-hidden', 'true');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'lightbox-close';
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '×';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'lightbox-nav prev';
  prevBtn.setAttribute('aria-label', 'Previous');
  prevBtn.innerHTML = '‹';

  const nextBtn = document.createElement('button');
  nextBtn.className = 'lightbox-nav next';
  nextBtn.setAttribute('aria-label', 'Next');
  nextBtn.innerHTML = '›';

  const overlayImg = document.createElement('img');

  overlay.appendChild(closeBtn);
  overlay.appendChild(prevBtn);
  overlay.appendChild(nextBtn);
  overlay.appendChild(overlayImg);
  document.body.appendChild(overlay);

  let current = -1;

  function showIndex(i) {
    if (i < 0) i = images.length - 1;
    if (i >= images.length) i = 0;
    current = i;
    const src = images[current].src || images[current].getAttribute('data-src');
    overlayImg.src = src;
    overlayImg.alt = images[current].alt || '';
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    overlayImg.src = '';
    current = -1;
  }

  images.forEach((img, idx) => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', (e) => {
      e.preventDefault();
      showIndex(idx);
    });
  });

  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
  });

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showIndex(current - 1);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showIndex(current + 1);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  window.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') showIndex(current - 1);
    if (e.key === 'ArrowRight') showIndex(current + 1);
  });

  // touch: swipe support (simple)
  let startX = null;
  overlayImg.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });
  overlayImg.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const endX = (e.changedTouches && e.changedTouches[0].clientX) || null;
    if (endX !== null) {
      const dx = endX - startX;
      if (Math.abs(dx) > 40) {
        if (dx > 0) showIndex(current - 1);
        else showIndex(current + 1);
      }
    }
    startX = null;
  });
})();
