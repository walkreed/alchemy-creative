/**
 * Video reel — autoplay background video that opens full screen on click.
 *
 * The background <video> autoplays muted and looping in markup; this module
 * only owns the full-screen launch, which needs a native <dialog>.
 *
 * Markup:
 *
 *   <div class="video-reel">
 *     <video class="video-reel_video" autoplay muted loop playsinline></video>
 *     <button class="video-reel_trigger" data-reel-open="showreel">…</button>
 *   </div>
 *   <dialog class="video-reel_modal" data-reel="showreel">
 *     <button data-reel-close>…</button>
 *     <video class="video-reel_modal-video" controls playsinline></video>
 *   </dialog>
 *
 * The dialog's video is deliberately NOT autoplay: it starts when the dialog
 * opens and pauses when it closes, so audio never plays behind a closed modal.
 */
(function () {
    'use strict';

    var bound = [];

    function init(scope) {
        var triggers = scope.querySelectorAll('[data-reel-open]');
        if (!triggers.length) return;

        Array.prototype.forEach.call(triggers, function (trigger) {
            var name = trigger.getAttribute('data-reel-open');
            var dialog = scope.querySelector('[data-reel="' + name + '"]');
            if (!dialog || typeof dialog.showModal !== 'function') return;

            var video = dialog.querySelector('video');
            var closer = dialog.querySelector('[data-reel-close]');

            /* play() resolves asynchronously. If the modal is closed before it
               settles, a pause() issued in between is overridden when the play
               promise lands — and audio keeps running behind a closed dialog.
               So hold the promise and pause only once it has settled. */
            var playing = null;

            function open() {
                dialog.showModal();
                if (!video) return;
                video.currentTime = 0;
                playing = video.play();
                if (playing && playing.catch) playing.catch(function () {});
            }
            function stop() {
                if (!video) return;
                if (playing && playing.then) {
                    playing.then(function () { video.pause(); }, function () {});
                } else {
                    video.pause();
                }
            }
            function closeFromButton() {
                dialog.close();
            }
            function closeOnBackdrop(event) {
                if (event.target === dialog) dialog.close();
            }

            trigger.addEventListener('click', open);
            dialog.addEventListener('close', stop);
            dialog.addEventListener('click', closeOnBackdrop);
            if (closer) closer.addEventListener('click', closeFromButton);

            bound.push({
                trigger: trigger, dialog: dialog, closer: closer,
                open: open, stop: stop,
                closeFromButton: closeFromButton, closeOnBackdrop: closeOnBackdrop
            });
        });
    }

    function destroy() {
        bound.forEach(function (b) {
            b.trigger.removeEventListener('click', b.open);
            b.dialog.removeEventListener('close', b.stop);
            b.dialog.removeEventListener('click', b.closeOnBackdrop);
            if (b.closer) b.closer.removeEventListener('click', b.closeFromButton);
            if (b.dialog.open) b.dialog.close();
        });
        bound = [];
    }

    if (window.SitePage) window.SitePage.register({ init: init, destroy: destroy });
}());
