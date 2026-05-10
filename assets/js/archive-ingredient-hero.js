(function () {
    "use strict";

    var archiveHeroBlogSlider = document.querySelector("[data-g4t-archive-hero-blog-slider]");
    if (archiveHeroBlogSlider) {
        var archiveHeroViewport = archiveHeroBlogSlider.querySelector(".g4t-archive-hero-visual__blog-viewport");
        var archiveHeroTrack = archiveHeroBlogSlider.querySelector(".g4t-archive-hero-visual__blog-track");
        var archiveHeroSlides = archiveHeroTrack ? archiveHeroTrack.querySelectorAll(".g4t-archive-hero-visual__blog-slide") : [];
        var archiveHeroDotsHost = archiveHeroBlogSlider.querySelector(".g4t-archive-hero-visual__blog-dots");
        var archiveHeroCurrentIndex = 0;

        if (archiveHeroViewport && archiveHeroTrack && archiveHeroDotsHost && archiveHeroSlides.length > 0) {
            function setArchiveHeroActiveDot() {
                var dots = archiveHeroDotsHost.querySelectorAll(".g4t-ads-hero__dot");
                dots.forEach(function (dot, index) {
                    var isActive = index === archiveHeroCurrentIndex;
                    dot.classList.toggle("is-active", isActive);
                    dot.setAttribute("aria-pressed", isActive ? "true" : "false");
                });
            }

            function renderArchiveHeroSlider() {
                archiveHeroTrack.style.transform = "translate3d(" + -(archiveHeroCurrentIndex * 100) + "%, 0, 0)";
                setArchiveHeroActiveDot();
            }

            function goToArchiveHeroSlide(index) {
                if (index < 0) {
                    archiveHeroCurrentIndex = archiveHeroSlides.length - 1;
                } else if (index >= archiveHeroSlides.length) {
                    archiveHeroCurrentIndex = 0;
                } else {
                    archiveHeroCurrentIndex = index;
                }
                renderArchiveHeroSlider();
            }

            archiveHeroSlides.forEach(function (_, index) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.className = "g4t-ads-hero__dot";
                dot.setAttribute("aria-label", "Poka\u017C artyku\u0142 " + (index + 1));
                dot.setAttribute("aria-pressed", "false");
                dot.addEventListener("click", function () {
                    goToArchiveHeroSlide(index);
                });
                archiveHeroDotsHost.appendChild(dot);
            });

            archiveHeroDotsHost.hidden = archiveHeroSlides.length <= 1;

            archiveHeroViewport.addEventListener("keydown", function (event) {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    goToArchiveHeroSlide(archiveHeroCurrentIndex - 1);
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    goToArchiveHeroSlide(archiveHeroCurrentIndex + 1);
                }
            });

            renderArchiveHeroSlider();
        }
    }

    var hero = document.querySelector("[data-g4t-ads-hero]");
    if (hero) {
        var viewport = hero.querySelector(".g4t-ads-hero__viewport");
        var track = hero.querySelector(".g4t-ads-hero__track");
        var slides = track ? track.querySelectorAll(".g4t-product-card") : [];
        var dotsHost = hero.querySelector(".g4t-ads-hero__dots");
        var currentIndex = 0;

        if (viewport && track && dotsHost && slides.length > 0) {
            function setActiveDot() {
                var dots = dotsHost.querySelectorAll(".g4t-ads-hero__dot");
                dots.forEach(function (dot, index) {
                    var isActive = index === currentIndex;
                    dot.classList.toggle("is-active", isActive);
                    dot.setAttribute("aria-pressed", isActive ? "true" : "false");
                });
            }

            function render() {
                track.style.transform = "translate3d(" + -(currentIndex * 100) + "%, 0, 0)";
                setActiveDot();
            }

            function goTo(index) {
                if (index < 0) {
                    currentIndex = slides.length - 1;
                } else if (index >= slides.length) {
                    currentIndex = 0;
                } else {
                    currentIndex = index;
                }
                render();
            }

            slides.forEach(function (_, index) {
                var dot = document.createElement("button");
                dot.type = "button";
                dot.className = "g4t-ads-hero__dot";
                dot.setAttribute("aria-label", "Poka\u017C produkt " + (index + 1));
                dot.setAttribute("aria-pressed", "false");
                dot.addEventListener("click", function () {
                    goTo(index);
                });
                dotsHost.appendChild(dot);
            });

            viewport.addEventListener("keydown", function (event) {
                if (event.key === "ArrowLeft") {
                    event.preventDefault();
                    goTo(currentIndex - 1);
                }

                if (event.key === "ArrowRight") {
                    event.preventDefault();
                    goTo(currentIndex + 1);
                }
            });

            // Drag (mouse + touch) support
            var dragStartX = 0;
            var dragStartY = 0;
            var isDragging = false;
            var DRAG_THRESHOLD = 40;

            function onDragStart(x, y) {
                dragStartX = x;
                dragStartY = y;
                isDragging = true;
                track.style.transition = "none";
            }

            function onDragEnd(x) {
                if (!isDragging) { return; }
                isDragging = false;
                track.style.transition = "";
                var delta = dragStartX - x;
                if (Math.abs(delta) >= DRAG_THRESHOLD) {
                    goTo(delta > 0 ? currentIndex + 1 : currentIndex - 1);
                } else {
                    render();
                }
            }

            viewport.addEventListener("mousedown", function (event) {
                onDragStart(event.clientX, event.clientY);
            });

            viewport.addEventListener("mousemove", function (event) {
                if (!isDragging) { return; }
                event.preventDefault();
            });

            viewport.addEventListener("mouseup", function (event) {
                onDragEnd(event.clientX);
            });

            viewport.addEventListener("mouseleave", function (event) {
                if (isDragging) { onDragEnd(event.clientX); }
            });

            viewport.addEventListener("touchstart", function (event) {
                var t = event.touches[0];
                onDragStart(t.clientX, t.clientY);
            }, { passive: true });

            viewport.addEventListener("touchend", function (event) {
                var t = event.changedTouches[0];
                onDragEnd(t.clientX);
            });

            viewport.addEventListener("dragstart", function (event) {
                event.preventDefault();
            });

            render();
        }
    }

    var randomArticle = document.querySelector("[data-random-article]");
    if (randomArticle) {
        var articleItems = randomArticle.querySelectorAll(".ingredient-related__item");
        if (articleItems.length > 1) {
            articleItems.forEach(function (item) {
                item.classList.remove("is-active");
            });

            var index = Math.floor(Math.random() * articleItems.length);
            articleItems[index].classList.add("is-active");
        }
    }
})();
