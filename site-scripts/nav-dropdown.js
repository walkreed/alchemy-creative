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
