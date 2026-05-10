(function () {
    "use strict";

    var optionalSections = document.querySelectorAll("[data-optional-section]");
    optionalSections.forEach(function (section) {
        var content = section.querySelector("[data-optional-content]");
        if (!content) {
            return;
        }

        if (content.textContent.trim() === "") {
            section.hidden = true;
        }
    });

    var sections = document.querySelectorAll("[data-g4t-ads]");
    sections.forEach(function (section) {
        var viewport = section.querySelector("[data-g4t-ads-viewport]");
        var track = section.querySelector("[data-g4t-ads-track]");
        var prev = section.querySelector("[data-g4t-ads-prev]");
        var next = section.querySelector("[data-g4t-ads-next]");

        if (!viewport || !track) {
            return;
        }

        var currentIndex = 0;
        var navGroup = section.querySelector(".g4t-ads-strip__nav-group");
        var overflowTolerance = 2;

        function setButtonState(button, disabled) {
            if (!button) {
                return;
            }

            button.disabled = disabled;
            button.setAttribute("aria-disabled", disabled ? "true" : "false");
        }

        function updateNav() {
            var maxIndex = getMaxIndex();
            var hasOverflow = maxIndex > 0;

            if (navGroup) {
                navGroup.hidden = !hasOverflow;
            }

            if (!hasOverflow) {
                currentIndex = 0;
                track.style.transform = "translate3d(0px, 0, 0)";
                setButtonState(prev, true);
                setButtonState(next, true);
                return;
            }

            setButtonState(prev, currentIndex <= 0);
            setButtonState(next, currentIndex >= maxIndex);
        }

        function getGap() {
            var styles = window.getComputedStyle(track);
            var gap = parseFloat(styles.columnGap || styles.gap || "0");
            return Number.isNaN(gap) ? 0 : gap;
        }

        function getStep() {
            var card = track.querySelector(".g4t-product-card");
            if (!card) {
                return viewport.clientWidth;
            }

            return card.getBoundingClientRect().width + getGap();
        }

        function getHiddenWidth() {
            return track.scrollWidth - viewport.clientWidth;
        }

        function getMaxIndex() {
            var hiddenWidth = getHiddenWidth();
            if (hiddenWidth <= overflowTolerance) {
                return 0;
            }

            return Math.ceil(hiddenWidth / getStep());
        }

        function clampIndex() {
            var maxIndex = getMaxIndex();
            if (currentIndex < 0) {
                currentIndex = 0;
            }
            if (currentIndex > maxIndex) {
                currentIndex = maxIndex;
            }
        }

        function render() {
            track.style.transform = "translate3d(" + -(currentIndex * getStep()) + "px, 0, 0)";
            updateNav();
        }

        function goPrev() {
            currentIndex -= 1;
            clampIndex();
            render();
        }

        function goNext() {
            currentIndex += 1;
            clampIndex();
            render();
        }

        if (prev) {
            prev.addEventListener("click", goPrev);
        }

        if (next) {
            next.addEventListener("click", goNext);
        }

        viewport.addEventListener("keydown", function (event) {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                goPrev();
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                goNext();
            }
        });

        window.addEventListener("resize", function () {
            clampIndex();
            render();
        });

        render();
        window.addEventListener('load', function () { clampIndex(); render(); });
    });
})();
