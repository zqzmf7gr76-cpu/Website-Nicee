document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuClose = document.getElementById('mobile-menu-close');
  const isOpen = () => mobileMenu && !mobileMenu.classList.contains('hidden');
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('hidden');
    mobileMenu.classList.add('block');
    document.documentElement.style.overflow = 'hidden';
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
  }
  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('hidden');
    mobileMenu.classList.remove('block');
    document.documentElement.style.overflow = '';
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  }

  if (menuToggle) {
    menuToggle.setAttribute('role', 'button');
    if (!menuToggle.hasAttribute('aria-expanded')) menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.addEventListener('click', (e) => { e.stopPropagation(); isOpen() ? closeMenu() : openMenu(); });
  }

  if (menuClose) menuClose.addEventListener('click', (e) => { e.stopPropagation(); closeMenu(); });
  if (mobileMenu) {
    mobileMenu.addEventListener('click', (e) => {
      const target = e.target;
      if (target && (target.tagName === 'A' || target.closest('a'))) closeMenu();
    });
  }
  document.addEventListener('click', (e) => {
    if (!mobileMenu) return;
    const target = e.target;
    if (isOpen() && target !== menuToggle && !mobileMenu.contains(target)) closeMenu();
  });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closeMenu(); });
  if (mobileMenu && !mobileMenu.hasAttribute('aria-hidden')) {
    mobileMenu.setAttribute('aria-hidden', mobileMenu.classList.contains('hidden') ? 'true' : 'false');
    const observer = new MutationObserver(() => {
      mobileMenu.setAttribute('aria-hidden', mobileMenu.classList.contains('hidden') ? 'true' : 'false');
    });
    observer.observe(mobileMenu, { attributes: true, attributeFilter: ['class'] });
  }

  // =========================
  // AUDIO PLAYER
  // =========================
  const player = document.getElementById('radioPlayer');
  const FALLBACK_STREAM = "http://stream.radiojar.com/t0x7dyqmsuhvv";

  if (!player) {
    console.warn('index.js: Δεν βρέθηκε <audio id="radioPlayer">.');
  } else {
    // Αν δεν υπάρχει source, βάλε fallback
    if (!player.currentSrc && !player.querySelector('source[src]')) {
      player.src = FALLBACK_STREAM;
      player.preload = 'auto';
      player.crossOrigin = 'anonymous';
    }

    const listenButtons = Array.from(document.querySelectorAll('.listen-button-toggle'));
    listenButtons.forEach((btn) => {
      const icon = btn.querySelector('i');
      btn.setAttribute('aria-pressed', 'false');

      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        if (!icon) return;

        // toggle play/pause
        if (!player.paused && !player.ended) {
          player.pause();
          icon.classList.remove('fa-pause');
          icon.classList.add('fa-play');
          btn.setAttribute('aria-pressed', 'false');

          // επαναφορά άλλων κουμπιών
          listenButtons.forEach((b) => {
            if (b !== btn) {
              const ic = b.querySelector('i');
              if (ic) { ic.classList.remove('fa-pause'); ic.classList.add('fa-play'); }
              b.setAttribute('aria-pressed', 'false');
            }
          });
          return;
        }

        // Προσπάθησε να παίξεις
        try {
          await player.play();
          icon.classList.remove('fa-play', 'fa-circle-play');
          icon.classList.add('fa-pause');
          btn.setAttribute('aria-pressed', 'true');

          listenButtons.forEach((b) => {
            if (b !== btn) {
              const ic = b.querySelector('i');
              if (ic) { ic.classList.remove('fa-pause'); ic.classList.add('fa-play'); }
              b.setAttribute('aria-pressed', 'false');
            }
          });
        } catch (err) {
          console.error('Play failed:', err);
          alert('Ο browser μπλόκαρε την αναπαραγωγή — πάτησε ξανά το κουμπί.');
        }
      });
    });

    const resetButtons = () => {
      listenButtons.forEach((btn) => {
        const ic = btn.querySelector('i');
        if (ic) { ic.classList.remove('fa-pause'); ic.classList.add('fa-play'); }
        btn.setAttribute('aria-pressed', 'false');
      });
    };
    player.addEventListener('pause', resetButtons);
    player.addEventListener('ended', resetButtons);
    player.addEventListener('error', resetButtons);
  }
  if (window.AOS) {
  AOS.init({
    duration: 800, 
    once: true,    
  });
} else {
  console.warn('AOS δεν φορτώθηκε. Έλεγξε ότι έχεις προσθέσει το AOS.js.');
}

});

 function pause() {
  alert("Τα τραγουδια τέθηκαν σε πάυση. Θα  είμαστε μαζί σας σύντομα!");
}
