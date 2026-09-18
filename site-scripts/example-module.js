/**
 * Example module — reveal-on-scroll.
 *
 * Copy this file as the starting point for any new module. It demonstrates
 * every convention the project requires:
 *
 *   - IIFE with 'use strict'   nothing leaks to the global scope
 *   - data-* hooks, not classes classes belong to styling; a designer renaming
 *                              a class in Webflow must not break the JS
 *   - early exit               bail immediately when the elements are absent,
 *                              so the module costs nothing on pages without it
 *   - prefers-reduced-motion   never animate against the user's setting
 *   - init(scope) / destroy()  re-runnable, and releases all global state
 *
 * Markup:
 *
 *   <div data-reveal>…</div>
 *   <div data-reveal data-reveal-delay="120">…</div>
 *
 * CSS (in the project stylesheet, gated on .site-js so no-JS visitors always
 * see the content):
 *
 *   .site-js [data-reveal] { opacity: 0; transform: translateY(1.5rem); }
 *   [data-reveal] { transition: opacity 600ms ease, transform 600ms ease; }
 *   [data-reveal].is-revealed { opacity: 1; transform: none; }
 */
(function () {
    'use strict';

    var observer = null;
    var timers = [];

    function destroy() {
        if (observer) {
            observer.disconnect();
            observer = null;
        }
        timers.forEach(clearTimeout);
        timers = [];
    }

    /**
     * @param {Element|Document} [scope] Root to query within.
     */
    function init(scope) {
        destroy();

        var root = scope || document;
        var targets = root.querySelectorAll('[data-reveal]');
        if (!targets.length) return;

        var reveal = function (el) {
            el.classList.add('is-revealed');
        };

        /* Reduced motion, or a browser without IntersectionObserver: show
           everything immediately rather than leaving it pre-hidden forever. */
        if (
            window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
            !('IntersectionObserver' in window)
        ) {
            targets.forEach(reveal);
            return;
        }

        observer = new IntersectionObserver(
            function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;

                    var el = entry.target;
                    var delay = parseInt(el.getAttribute('data-reveal-delay'), 10) || 0;

                    if (delay) {
                        timers.push(setTimeout(function () { reveal(el); }, delay));
                    } else {
                        reveal(el);
                    }

                    observer.unobserve(el);
                });
            },
            { rootMargin: '0px 0px -15% 0px', threshold: 0 }
        );

        targets.forEach(function (el) { observer.observe(el); });
    }

    if (window.SitePage) window.SitePage.register({ init: init, destroy: destroy });
    else init(document);
})();
