// Sticky mobile anchor tabs for single recipe page
(function () {
    var mobileMq = window.matchMedia('(max-width: 640px)');
    var mobileTabs = document.querySelector('.mobile-recipe-tabs');
    if (!mobileTabs) return;
    var ingredientsSection = document.getElementById('sec-ingredients');
    var preparationSection = document.getElementById('sec-preparation');
    var ingredientsBoundary = document.querySelector('.recipe-section--ingredients');
    var buttons = Array.prototype.slice.call(mobileTabs.querySelectorAll('button[data-target]'));
    if (!buttons.length) return;
    var stickyClass = 'is-sticky';
    var visibleClass = 'is-visible';
    var hero = document.querySelector('.recipe-hero');
    var manualActiveUntil = 0;
    var manualActiveTarget = null;

    function isMobile() {
        return mobileMq.matches;
    }

    function updateVisibility() {
        if (!isMobile()) {
            mobileTabs.classList.remove(visibleClass);
            mobileTabs.classList.remove(stickyClass);
            return;
        }

        if (!hero) {
            mobileTabs.classList.add(visibleClass);
            return;
        }

        var heroRect = hero.getBoundingClientRect();
        var showTabs = heroRect.bottom <= 0;
        mobileTabs.classList.toggle(visibleClass, showTabs);
        mobileTabs.classList.toggle(stickyClass, showTabs);
    }

    function setActiveButton(targetId) {
        buttons.forEach(function (button) {
            var isActive = button.getAttribute('data-target') === targetId;
            button.classList.toggle('is-active', isActive);
            button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });
    }

    function updateActiveOnScroll() {
        if (!isMobile() || !mobileTabs.classList.contains(visibleClass)) return;
        if (!ingredientsSection || !preparationSection) return;

        if (manualActiveTarget && Date.now() < manualActiveUntil) {
            setActiveButton(manualActiveTarget);
            return;
        }

        if (manualActiveTarget && Date.now() >= manualActiveUntil) {
            manualActiveTarget = null;
        }

        var navBottom = mobileTabs.getBoundingClientRect().bottom;
        var ingredientsBottom = (ingredientsBoundary || ingredientsSection).getBoundingClientRect().bottom;

        if (ingredientsBottom > (navBottom + 2)) {
            setActiveButton('sec-ingredients');
            return;
        }

        setActiveButton('sec-preparation');
    }

    // Scroll to section on tab click
    mobileTabs.addEventListener('click', function (e) {
        var btn = e.target.closest('button[data-target]');
        if (!btn) return;
        if (!isMobile()) return;

        var targetId = btn.getAttribute('data-target');
        var target = document.getElementById(targetId);
        if (target) {
            manualActiveTarget = targetId;
            manualActiveUntil = Date.now() + 900;
            var offset = mobileTabs.offsetHeight + 24; // add extra spacing below sticky tabs
            var rect = target.getBoundingClientRect();
            var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            var top = rect.top + scrollTop - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
            setActiveButton(targetId);
            updateActiveOnScroll();
        }
    });

    // Sticky behavior tied to hero visibility
    var heroObserver = null;
    if (hero && 'IntersectionObserver' in window) {
        heroObserver = new IntersectionObserver(function (entries) {
            if (!isMobile()) {
                mobileTabs.classList.remove(visibleClass);
                mobileTabs.classList.remove(stickyClass);
                return;
            }

            var showTabs = !entries[0].isIntersecting;
            mobileTabs.classList.toggle(visibleClass, showTabs);
            mobileTabs.classList.toggle(stickyClass, showTabs);
        }, { rootMargin: '-1px 0px 0px 0px', threshold: 0 });
        heroObserver.observe(hero);
    }

    // Show tabs when hero is out of viewport
    updateVisibility();
    updateActiveOnScroll();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('scroll', updateActiveOnScroll, { passive: true });
    window.addEventListener('resize', updateVisibility);
    window.addEventListener('resize', updateActiveOnScroll);
    if (mobileMq.addEventListener) {
        mobileMq.addEventListener('change', updateVisibility);
        mobileMq.addEventListener('change', updateActiveOnScroll);
    } else if (mobileMq.addListener) {
        mobileMq.addListener(updateVisibility);
        mobileMq.addListener(updateActiveOnScroll);
    }
})();
