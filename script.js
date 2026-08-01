document.documentElement.classList.add('js');

const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');
toggle?.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});
nav?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
  nav.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
}));

const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

const lightbox = document.getElementById('lightbox');
const lightboxImg = lightbox?.querySelector('img');
document.querySelectorAll('.gallery-item').forEach((item) => item.addEventListener('click', () => {
  if (!lightbox || !lightboxImg) return;
  lightboxImg.src = item.dataset.full || '';
  lightbox.showModal();
}));
lightbox?.querySelector('button')?.addEventListener('click', () => lightbox.close());
lightbox?.addEventListener('click', (event) => {
  if (event.target === lightbox) lightbox.close();
});

// Reveal sections and image groups as they enter the viewport.
const revealTargets = document.querySelectorAll('.reveal, .stagger-group');
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in-view');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px' });
  revealTargets.forEach((target) => revealObserver.observe(target));
} else {
  revealTargets.forEach((target) => target.classList.add('in-view'));
}

// Animate the numeric charter facts once, without altering their labels or symbols.
const factNumbers = document.querySelectorAll('.quick-facts strong');
const animateFact = (element) => {
  const original = element.textContent.trim();
  const match = original.match(/(\d+)/);
  if (!match) return;
  const target = Number(match[1]);
  const prefix = original.slice(0, match.index);
  const suffix = original.slice((match.index || 0) + match[1].length);
  const duration = 850;
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const factsSection = document.querySelector('.quick-facts');
if (factsSection && 'IntersectionObserver' in window) {
  const factObserver = new IntersectionObserver((entries, observer) => {
    if (!entries[0].isIntersecting) return;
    factNumbers.forEach(animateFact);
    observer.disconnect();
  }, { threshold: 0.45 });
  factObserver.observe(factsSection);
}

// Gentle desktop-only parallax on the hero background.
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileView = window.matchMedia('(max-width: 560px)');
let parallaxFrame = 0;
const updateParallax = () => {
  parallaxFrame = 0;
  if (reduceMotion.matches || mobileView.matches) return;
  const shift = Math.min(window.scrollY * 0.11, 55);
  document.documentElement.style.setProperty('--hero-parallax', `${shift}px`);
};
window.addEventListener('scroll', () => {
  if (!parallaxFrame) parallaxFrame = requestAnimationFrame(updateParallax);
}, { passive: true });
updateParallax();

// Use the sound from the active YouTube background video, only after a user click.
const soundButton = document.getElementById('marshSound');
const desktopVideo = document.getElementById('heroVideoDesktop');
const mobileVideo = document.getElementById('heroVideoMobile');
let soundOn = false;
const sendPlayerCommand = (frame, func) => {
  frame?.contentWindow?.postMessage(JSON.stringify({
    event: 'command',
    func,
    args: []
  }), '*');
};
const activeVideo = () => mobileView.matches ? mobileVideo : desktopVideo;
soundButton?.addEventListener('click', () => {
  soundOn = !soundOn;
  sendPlayerCommand(desktopVideo, 'mute');
  sendPlayerCommand(mobileVideo, 'mute');
  if (soundOn) sendPlayerCommand(activeVideo(), 'unMute');
  soundButton.setAttribute('aria-pressed', String(soundOn));
  const label = soundButton.querySelector('.sound-label');
  if (label) label.textContent = soundOn ? 'Mute the Marsh' : 'Experience the Marsh';
});
mobileView.addEventListener?.('change', () => {
  if (!soundOn) return;
  sendPlayerCommand(desktopVideo, 'mute');
  sendPlayerCommand(mobileVideo, 'mute');
  sendPlayerCommand(activeVideo(), 'unMute');
});
