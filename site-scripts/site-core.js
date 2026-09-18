/* site-core.js — generated bundle from: page-init example-module nav-dropdown. Do not edit directly; edit the source modules and run ./build.sh. */

/* ==== page-init.js ==== */
/**
 * Page module registry and lifecycle.
 *
 * MUST be the first module in the bundle — it defines `window.SitePage`, which
 * every other module registers against at parse time.
 *
 * Why a registry at all: on a Webflow site the modules are delivered as one
 * bundle in the footer, and some content (CMS-injected markup, a modal's
 * contents, a page swapped in by an SPA transition layer) appears after first
 * paint. A module that ran once against `document` on load would never see it.
 * Registering an init/destroy pair means the whole set can be re-run against a
 * new scope with one call.
 *
 * Module contract:
 *
 *   window.SitePage.register({ init(scope), destroy() })
 *
 *     init(scope)  Run once on first load (scope = document) and again on every
 *                  SitePage.reinit(newScope). ALWAYS query within `scope`, never
 *                  `document`, or a re-init will bind the wrong elements.
 *     destroy()    Optional. Called before a re-init. Release everything global:
 *                  window/document listeners, requestAnimationFrame loops,
 *                  IntersectionObservers, GSAP tweens and ScrollTriggers,
 *                  WebGL contexts. A module that leaks here will double-bind.
 *
 * Modules must also work standalone (loaded on their own, without this file),
 * so each one ends with the fallback:
 *
 *   if (window.SitePage) window.SitePage.register({ init, destroy });
 *   else init(document);
 */
(function () {
    'use strict';

    /* JS-enabled flag. Lets CSS pre-hide elements that a script is about to
       animate in, without hiding them for no-JS visitors. Pair any such rule
       with a bounded animation fallback so the content still appears if the
       bundle is slow or fails. */
    document.documentElement.classList.add('site-js');

    var mods = [];
    var booted = false;

    function run(mod, method, scope) {
        if (typeof mod[method] !== 'function') return;
        try {
            mod[method](scope);
        } catch (e) {
            console.error('[site] ' + method + ' failed', e);
        }
    }

    var SitePage = {
        /**
         * Register a module. Safe to call before or after first paint — a module
         * registered late is initialised immediately against the document.
         * @param {{init?: function(Element|Document): void, destroy?: function(): void}} mod
         */
        register: function (mod) {
            if (!mod) return;
            mods.push(mod);
            if (booted) run(mod, 'init', document);
        },

        /**
         * Initialise every registered module against a scope.
         * @param {Element|Document} [scope] Defaults to `document`.
         */
        initAll: function (scope) {
            var root = scope || document;
            booted = true;
            mods.forEach(function (m) { run(m, 'init', root); });
        },

        /** Tear down every registered module. */
        destroyAll: function () {
            mods.forEach(function (m) { run(m, 'destroy'); });
        },

        /**
         * Tear down and re-initialise against a new scope. Call this after
         * injecting markup — a CMS load-more, a modal opening, an SPA page swap.
         * @param {Element|Document} [scope]
         */
        reinit: function (scope) {
            SitePage.destroyAll();
            SitePage.initAll(scope);
        },
    };

    window.SitePage = SitePage;

    /* First-load boot. The bundle is loaded before </body>, so the DOM is
       usually already parsed — but guard for `defer`/async delivery anyway. */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            SitePage.initAll(document);
        }, { once: true });
    } else {
        SitePage.initAll(document);
    }
})();

/* ==== example-module.js ==== */
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

/* ==== nav-dropdown.js ==== */
/**
 * Nav dropdown — toggles the "Our Work" panel in the global nav.
 *
 * Markup:
 *
 *   <button data-nav-toggle="our-work" aria-expanded="false"
 *           aria-controls="nav-panel-our-work">…</button>
 *   <div data-nav-panel="our-work" id="nav-panel-our-work" hidden>…</div>
 *
 * The toggle value and the panel value must match. Multiple pairs on one
 * page are supported; opening one closes the others.
 *
 * Closes on Escape and on a click outside the nav. Focus returns to the
 * toggle when Escape closes it, so keyboard users are not stranded.
 */
(function () {
    'use strict';

    var pairs = [];
    var onDocClick = null;
    var onDocKey = null;

    function setOpen(pair, open) {
        pair.toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (open) pair.panel.removeAttribute('hidden');
        else pair.panel.setAttribute('hidden', '');
    }

    function closeAll(except) {
        pairs.forEach(function (pair) {
            if (pair !== except) setOpen(pair, false);
        });
    }

    function destroy() {
        pairs.forEach(function (pair) {
            pair.toggle.removeEventListener('click', pair.handler);
        });
        pairs = [];

        if (onDocClick) {
            document.removeEventListener('click', onDocClick);
            onDocClick = null;
        }
        if (onDocKey) {
            document.removeEventListener('keydown', onDocKey);
            onDocKey = null;
        }
    }

    /**
     * @param {Element|Document} [scope] Root to query within.
     */
    function init(scope) {
        destroy();

        var root = scope || document;
        var toggles = root.querySelectorAll('[data-nav-toggle]');
        if (!toggles.length) return;

        Array.prototype.forEach.call(toggles, function (toggle) {
            var name = toggle.getAttribute('data-nav-toggle');
            var panel = root.querySelector('[data-nav-panel="' + name + '"]');
            if (!panel) return;

            var pair = { toggle: toggle, panel: panel, handler: null };

            pair.handler = function (event) {
                event.preventDefault();
                var open = toggle.getAttribute('aria-expanded') === 'true';
                closeAll(pair);
                setOpen(pair, !open);
            };

            toggle.addEventListener('click', pair.handler);
            setOpen(pair, false);
            pairs.push(pair);
        });

        if (!pairs.length) return;

        onDocClick = function (event) {
            var inside = pairs.some(function (pair) {
                return pair.toggle.contains(event.target) || pair.panel.contains(event.target);
            });
            if (!inside) closeAll(null);
        };

        onDocKey = function (event) {
            if (event.key !== 'Escape') return;
            var open = pairs.filter(function (pair) {
                return pair.toggle.getAttribute('aria-expanded') === 'true';
            });
            if (!open.length) return;
            closeAll(null);
            open[0].toggle.focus();
        };

        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onDocKey);
    }

    if (window.SitePage) window.SitePage.register({ init: init, destroy: destroy });
    else init(document);
})();
