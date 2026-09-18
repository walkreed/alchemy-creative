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
