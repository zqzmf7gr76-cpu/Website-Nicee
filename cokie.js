(function () {
    const BANNER_ID = 'nicee-cookie-banner';
    const ACCEPT_ID = 'nicee-accept-btn';
    const DECLINE_ID = 'nicee-decline-btn';
    const CLOSE_ID = 'nicee-close-btn';
    const COOKIE_NAME = 'nicee_cookie_consent';
    const COOKIE_DAYS = 365;

    // Simple cookie helpers
    function setCookie(name, value, days) {
        const expires = days
            ? '; expires=' + new Date(Date.now() + days * 864e5).toUTCString()
            : '';
        document.cookie = name + '=' + encodeURIComponent(value) + expires + '; path=/; SameSite=Lax';
    }

    function getCookie(name) {
        const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.*+?^${}()|[\]\\])/g, '\\$1') + '=([^;]*)'));
        return match ? decodeURIComponent(match[1]) : null;
    }

    // Utility to emit a custom event on document
    function emit(eventName, detail) {
        try {
            document.dispatchEvent(new CustomEvent(eventName, { detail }));
        } catch (e) {
            // older browsers fallback
            const ev = document.createEvent('CustomEvent');
            ev.initCustomEvent(eventName, true, true, detail);
            document.dispatchEvent(ev);
        }
    }

    function showBanner(banner) {
        if (!banner) return;
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-hidden', 'false');
        // trigger CSS transition: remove hidden classes and add visible classes
        banner.classList.remove('translate-y-8', 'opacity-0');
        banner.classList.add('translate-y-0', 'opacity-100');
        // move focus to accept button for accessibility
        const accept = document.getElementById(ACCEPT_ID);
        if (accept) accept.focus();
        emit('nicee-cookie-visible', { visible: true });
    }

    function hideBanner(banner, reason) {
        if (!banner) return;
        banner.setAttribute('aria-hidden', 'true');
        // reverse transition
        banner.classList.add('translate-y-8', 'opacity-0');
        banner.classList.remove('translate-y-0', 'opacity-100');
        // wait for transition then remove from layout
        const duration = 450; // matches CSS transition duration (ms)
        setTimeout(() => {
            if (banner && banner.parentNode) {
                banner.style.display = 'none';
            }
            emit('nicee-cookie-hidden', { reason });
        }, duration);
    }

    function handleAccept(banner) {
        setCookie(COOKIE_NAME, 'accepted', COOKIE_DAYS);
        hideBanner(banner, 'accepted');
        emit('nicee-cookie-consent', { consent: 'accepted' });
    }

    function handleDecline(banner) {
        setCookie(COOKIE_NAME, 'declined', COOKIE_DAYS);
        hideBanner(banner, 'declined');
        emit('nicee-cookie-consent', { consent: 'declined' });
    }

    function handleClose(banner) {
        hideBanner(banner, 'closed');
        emit('nicee-cookie-consent', { consent: 'closed' });
    }

    function init() {
        const banner = document.getElementById(BANNER_ID);
        if (!banner) return;

        // If consent already given or declined, keep hidden
        const existing = getCookie(COOKIE_NAME);
        if (existing === 'accepted' || existing === 'declined') {
            // ensure hidden immediately
            banner.style.display = 'none';
            banner.setAttribute('aria-hidden', 'true');
            return;
        }

        // Hook buttons
        const acceptBtn = document.getElementById(ACCEPT_ID);
        const declineBtn = document.getElementById(DECLINE_ID);
        const closeBtn = document.getElementById(CLOSE_ID);

        if (acceptBtn) acceptBtn.addEventListener('click', () => handleAccept(banner));
        if (declineBtn) declineBtn.addEventListener('click', () => handleDecline(banner));
        if (closeBtn) closeBtn.addEventListener('click', () => handleClose(banner));

        // Close on Escape
        function onKey(e) {
            if (e.key === 'Escape') handleClose(banner);
        }
        document.addEventListener('keydown', onKey);

        // Show banner after a tiny delay to allow initial render (so transitions run)
        setTimeout(() => showBanner(banner), 50);

        // Clean up when hidden permanently (optional)
        document.addEventListener('nicee-cookie-hidden', () => {
            document.removeEventListener('keydown', onKey);
        }, { once: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
