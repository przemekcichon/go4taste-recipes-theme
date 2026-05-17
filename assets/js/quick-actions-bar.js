(function () {
    "use strict";

    /* Quick Actions Bar host and base controls */
    var quickActionsBarHost = document.createElement("div");
    var toggleButton = document.createElement("button");
    var toggleModeLabel = document.createElement("span");
    var toggleMoonIcon = document.createElement("span");
    var toggleSunIcon = document.createElement("span");
    var filterButton = document.createElement("button");
    var printButton = document.createElement("button");
    var shareButton = document.createElement("button");
    var sharePanel = document.createElement("div");
    var shareMailButton = document.createElement("button");
    var shareFacebookButton = document.createElement("button");

    /* Filter panel controls */
    var panel = document.createElement("div");
    var panelForm = document.createElement("form");
    var resetButton = document.createElement("button");
    var applyButton = document.createElement("button");

    var storageKey = "g4t-theme-mode";
    var recipeActionsBreakpoint = 980;
    var cardData = [];
    var initialArchiveCountText = null;
    var hasArchiveGrid = false;
    var hasSingleRecipePage = false;
    var showRecipeQuickActions = false;
    var lastScrollY = 0;
    var scrollDeltaThreshold = 10;
    var topRevealOffset = 24;
    var filterState = {
        mealType: [],
        prepTime: [],
        features: {
            glutenFree: false,
            withNuts: false
        },
        ingredients: []
    };

    var MEAL_TYPE_OPTIONS = [
        { value: "breakfast", label: "Śniadanie" },
        { value: "main", label: "Danie główne" },
        { value: "dessert", label: "Deser" },
        { value: "drink", label: "Napój" }
    ];

    var TIME_OPTIONS = [
        { value: "up-to-15", label: "do 15 min" },
        { value: "16-30", label: "16-30 min" },
        { value: "31-60", label: "31-60 min" },
        { value: "over-60", label: "pow. 60 min" }
    ];

    var FEATURE_OPTIONS = [
        { value: "glutenFree", label: "Bez glutenu" },
        { value: "withNuts", label: "Dania z orzechami" }
    ];

    var INGREDIENT_OPTIONS = [
        { value: "pistacje", label: "Pistacje" },
        { value: "orzechy-wloskie", label: "Orzechy włoskie" },
        { value: "orzechy-nerkowca", label: "Orzechy nerkowca" },
        { value: "migdal", label: "Migdał" },
        { value: "sezam", label: "Sezam" },
        { value: "slonecznik", label: "Słonecznik" },
        { value: "dynia", label: "Pestki dyni" },
        { value: "chia", label: "Nasiona chia" },
        { value: "siemie-lniane", label: "Siemię lniane" },
        { value: "kurczak", label: "Kurczak" },
        { value: "wolowina", label: "Wołowina" },
        { value: "indyk", label: "Indyk" },
        { value: "losos", label: "Łosoś" },
        { value: "krewetki", label: "Krewetki" },
        { value: "tofu", label: "Tofu" },
        { value: "ciecierzyca", label: "Ciecierzyca" },
        { value: "soczewica", label: "Soczewica" },
        { value: "fasola", label: "Fasola" },
        { value: "komosa", label: "Komosa ryżowa" },
        { value: "ryz", label: "Ryż" },
        { value: "makaron", label: "Makaron" },
        { value: "ziemniaki", label: "Ziemniaki" },
        { value: "bataty", label: "Bataty" },
        { value: "brokuly", label: "Brokuły" },
        { value: "szpinak", label: "Szpinak" },
        { value: "papryka", label: "Papryka" },
        { value: "pomidor", label: "Pomidor" },
        { value: "awokado", label: "Awokado" },
        { value: "kokos", label: "Kokos" },
        { value: "jogurt", label: "Jogurt" },
        { value: "miod", label: "Miód" },
        { value: "czekolada", label: "Czekolada" },
        { value: "owoce", label: "Owoce" }
    ];

    function pageSupportsQuickActionsBar() {
        return Boolean(
            document.querySelector(".recipe-hero") ||
            document.querySelector(".g4t-archive-hero-shell") ||
            document.querySelector(".home-hero")
        );
    }

    /* Theme mode logic */
    function setMode(mode) {
        var isLight = mode === "light";
        document.body.classList.toggle("theme-light", isLight);
        document.body.classList.toggle("theme-dark", !isLight);
        toggleButton.setAttribute("aria-label", isLight ? "Tryb: jasny – przełącz na ciemny" : "Tryb: ciemny – przełącz na jasny");
        toggleButton.setAttribute("data-mode", isLight ? "light" : "dark");

        try {
            window.localStorage.setItem(storageKey, isLight ? "light" : "dark");
        } catch (error) {
        }
    }

    function getInitialMode() {
        try {
            var stored = window.localStorage.getItem(storageKey);
            if (stored === "light" || stored === "dark") {
                return stored;
            }
        } catch (error) {
        }

        return document.body.classList.contains("theme-light") ? "light" : "dark";
    }

    function getRecipeShareTitle() {
        var titleNode = document.querySelector("#recipe-title") || document.querySelector(".recipe-hero h1") || document.querySelector("h1");
        return titleNode ? titleNode.textContent.trim() : document.title;
    }

    function getShareData() {
        var shareUrl = window.location.href;
        var shareTitle = getRecipeShareTitle();
        var shareText = "Sprawdź ten przepis";

        return {
            url: shareUrl,
            title: shareTitle,
            text: shareText,
            mailHref: "mailto:?subject=" + encodeURIComponent(shareTitle) + "&body=" + encodeURIComponent(shareText + ": " + shareUrl),
            facebookHref: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(shareUrl)
        };
    }

    function closeSharePanel(shouldFocusTrigger) {
        if (!hasSingleRecipePage) {
            return;
        }

        quickActionsBarHost.classList.remove("is-share-open");
        shareButton.setAttribute("aria-expanded", "false");
        sharePanel.setAttribute("aria-hidden", "true");

        if (shouldFocusTrigger) {
            shareButton.focus();
        }
    }

    function openSharePanel() {
        if (!hasSingleRecipePage || shareButton.hidden) {
            return;
        }

        quickActionsBarHost.classList.add("is-share-open");
        shareButton.setAttribute("aria-expanded", "true");
        sharePanel.setAttribute("aria-hidden", "false");
    }

    function toggleSharePanel() {
        if (quickActionsBarHost.classList.contains("is-share-open")) {
            closeSharePanel(true);
            return;
        }

        openSharePanel();
    }

    function handleShareByMail() {
        var shareData = getShareData();
        closeSharePanel(true);
        window.location.href = shareData.mailHref;
    }

    function handleShareOnFacebook() {
        var shareData = getShareData();
        closeSharePanel(true);
        window.open(shareData.facebookHref, "_blank", "noopener,noreferrer");
    }

    function setupSharePanel() {
        sharePanel.className = "quick-actions-share-panel";
        sharePanel.id = "quick-actions-share-panel";
        sharePanel.setAttribute("role", "region");
        sharePanel.setAttribute("aria-label", "Opcje udostępniania");
        sharePanel.setAttribute("aria-hidden", "true");

        shareMailButton.type = "button";
        shareMailButton.className = "quick-actions-share-panel__action";
        shareMailButton.innerHTML = "<span class='quick-actions-share-panel__icon' aria-hidden='true'><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M4 5h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z'/><path d='m22 7-10 7L2 7'/></svg></span><span class='quick-actions-share-panel__label'>Wyślij mailem</span>";
        shareMailButton.addEventListener("click", handleShareByMail);

        shareFacebookButton.type = "button";
        shareFacebookButton.className = "quick-actions-share-panel__action";
        shareFacebookButton.innerHTML = "<span class='quick-actions-share-panel__icon' aria-hidden='true'><svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='currentColor'><path d='M14 8h3V4h-3c-3 0-5 2-5 5v3H6v4h3v4h4v-4h3.2l.8-4H13V9c0-.7.3-1 1-1z'/></svg></span><span class='quick-actions-share-panel__label'>Udostępnij na Facebooku</span>";
        shareFacebookButton.addEventListener("click", handleShareOnFacebook);

        sharePanel.appendChild(shareMailButton);
        sharePanel.appendChild(shareFacebookButton);
        quickActionsBarHost.appendChild(sharePanel);
    }

    function updateRecipeQuickActionsVisibility() {
        var activeElement = document.activeElement;

        if (!hasSingleRecipePage) {
            return;
        }

        showRecipeQuickActions = (window.matchMedia && window.matchMedia("(max-width: " + recipeActionsBreakpoint + "px)").matches)
            || window.innerWidth <= recipeActionsBreakpoint;

        quickActionsBarHost.classList.toggle("quick-actions-bar--with-recipe-actions", showRecipeQuickActions);
        printButton.hidden = !showRecipeQuickActions;
        shareButton.hidden = !showRecipeQuickActions;

        if (!showRecipeQuickActions) {
            closeSharePanel(false);

            if (printButton.contains(activeElement) || shareButton.contains(activeElement) || sharePanel.contains(activeElement)) {
                toggleButton.focus();
            }
        }
    }

    function setQuickActionsBarHidden(isHidden) {
        quickActionsBarHost.classList.toggle("quick-actions-bar--hidden", isHidden);
    }

    function handleQuickActionsBarScroll() {
        var currentScrollY = Math.max(window.scrollY || window.pageYOffset || 0, 0);
        var scrollDelta = currentScrollY - lastScrollY;

        if (Math.abs(scrollDelta) < scrollDeltaThreshold) {
            return;
        }

        if (quickActionsBarHost.classList.contains("is-filter-open") || quickActionsBarHost.classList.contains("is-share-open")) {
            setQuickActionsBarHidden(false);
            lastScrollY = currentScrollY;
            return;
        }

        if (currentScrollY <= topRevealOffset) {
            setQuickActionsBarHidden(false);
            lastScrollY = currentScrollY;
            return;
        }

        if (scrollDelta > 0) {
            if (!quickActionsBarHost.contains(document.activeElement)) {
                setQuickActionsBarHidden(true);
            }
        } else {
            setQuickActionsBarHidden(false);
        }

        lastScrollY = currentScrollY;
    }

    /* Recipe card filter data extraction */
    function getRecipeCards() {
        var allCards = Array.prototype.slice.call(document.querySelectorAll(".recipe-archive-grid .recipe-teaser-card"));
        return allCards.filter(function (card) {
            return !card.classList.contains("recipe-teaser-card--ad");
        });
    }

    function parsePrepTime(card) {
        var timeNode = card.querySelector(".recipe-teaser-card__meta span");
        if (!timeNode) {
            return 0;
        }

        var match = timeNode.textContent.match(/\d+/);
        return match ? Number(match[0]) : 0;
    }

    function inferMealType(text) {
        if (/koktajl|napoj|smoothie/.test(text)) {
            return "drink";
        }
        if (/ciast|deser|czekolad/.test(text)) {
            return "dessert";
        }
        if (/curry|obiad|danie glowne|danie głowne|kurczak/.test(text)) {
            return "main";
        }
        if (/sniadan|śniadan|granol|owsiank|jaglank|tost/.test(text)) {
            return "breakfast";
        }

        return "main";
    }

    function getIngredients(text) {
        var found = [];

        INGREDIENT_OPTIONS.forEach(function (option) {
            if (new RegExp(option.value.replace(/-/g, "[-\\s]?"), "i").test(text)) {
                found.push(option.value);
            }
        });

        return found;
    }

    function isLikelyGlutenFree(text) {
        if (/bez glutenu|gluten free/.test(text)) {
            return true;
        }

        return !/ciast|tost|granol|owsiank|makaron|chleb/.test(text);
    }

    function extractCardData() {
        cardData = getRecipeCards().map(function (card) {
            var title = (card.querySelector("h3") ? card.querySelector("h3").textContent : "").toLowerCase();
            var description = (card.querySelector("p") ? card.querySelector("p").textContent : "").toLowerCase();
            var searchableText = (title + " " + description).replace(/\s+/g, " ").trim();

            return {
                card: card,
                mealType: inferMealType(searchableText),
                prepTime: parsePrepTime(card),
                features: {
                    glutenFree: isLikelyGlutenFree(searchableText),
                    withNuts: /orzech|pistac|migdal|pestk/.test(searchableText)
                },
                ingredients: getIngredients(searchableText)
            };
        });
    }

    function matchesTimeFilter(timeValue, prepTime) {
        if (timeValue === "up-to-15") {
            return prepTime <= 15;
        }
        if (timeValue === "16-30") {
            return prepTime >= 16 && prepTime <= 30;
        }
        if (timeValue === "31-60") {
            return prepTime >= 31 && prepTime <= 60;
        }

        return prepTime > 60;
    }

    function renderCount(visibleCount) {
        var countNode = document.querySelector(".archive-results__count");
        if (!countNode) {
            return;
        }

        // Keep server-rendered total when no local filters are active.
        if (countActiveFilters() === 0 && initialArchiveCountText !== null) {
            countNode.textContent = initialArchiveCountText;
            return;
        }

        countNode.textContent = visibleCount + " przepisów";
    }

    function getMatchingCount() {
        var visibleCount = 0;

        cardData.forEach(function (item) {
            var matchesMealType = filterState.mealType.length === 0 || filterState.mealType.indexOf(item.mealType) !== -1;
            var matchesTime = filterState.prepTime.length === 0 || filterState.prepTime.some(function (timeValue) {
                return matchesTimeFilter(timeValue, item.prepTime);
            });
            var matchesFeatures = (!filterState.features.glutenFree || item.features.glutenFree)
                && (!filterState.features.withNuts || item.features.withNuts);

            var matchesIngredients = filterState.ingredients.length === 0
                || filterState.ingredients.some(function (ingredient) {
                    return item.ingredients.indexOf(ingredient) !== -1;
                });

            if (matchesMealType && matchesTime && matchesFeatures && matchesIngredients) {
                visibleCount += 1;
            }
        });

        return visibleCount;
    }

    function updateApplyButtonState() {
        var matchingCount = getMatchingCount();

        if (matchingCount === 0) {
            applyButton.disabled = true;
            applyButton.textContent = "Brak wyników";
            return;
        }

        applyButton.disabled = false;
        applyButton.textContent = "Pokaż wyniki (" + matchingCount + ")";
    }

    function countActiveFilters() {
        var featureCount = 0;

        if (filterState.features.glutenFree) {
            featureCount += 1;
        }
        if (filterState.features.withNuts) {
            featureCount += 1;
        }

        return filterState.mealType.length
            + filterState.prepTime.length
            + filterState.ingredients.length
            + featureCount;
    }

    function updateFilterButtonState() {
        var activeCount = countActiveFilters();
        var labelNode = filterButton.querySelector(".quick-actions-bar__filter-text");

        if (!labelNode) {
            return;
        }

        labelNode.textContent = activeCount > 0 ? "Filtr (" + activeCount + ")" : "Filtr";
    }

    function applyFilters() {
        var visibleCount = getMatchingCount();

        cardData.forEach(function (item) {
            var matchesMealType = filterState.mealType.length === 0 || filterState.mealType.indexOf(item.mealType) !== -1;
            var matchesTime = filterState.prepTime.length === 0 || filterState.prepTime.some(function (timeValue) {
                return matchesTimeFilter(timeValue, item.prepTime);
            });
            var matchesFeatures = (!filterState.features.glutenFree || item.features.glutenFree)
                && (!filterState.features.withNuts || item.features.withNuts);

            var matchesIngredients = filterState.ingredients.length === 0
                || filterState.ingredients.some(function (ingredient) {
                    return item.ingredients.indexOf(ingredient) !== -1;
                });

            var shouldShow = matchesMealType && matchesTime && matchesFeatures && matchesIngredients;
            item.card.hidden = !shouldShow;

        });

        renderCount(visibleCount);
        updateApplyButtonState();
        updateFilterButtonState();
    }

    function closeFilterPanel() {
        quickActionsBarHost.classList.remove("is-filter-open");
        filterButton.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
        if (hasArchiveGrid && document.body.contains(filterButton)) {
            filterButton.focus();
        }
    }

    function openFilterPanel() {
        quickActionsBarHost.classList.add("is-filter-open");
        filterButton.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
    }

    function resetFilters() {
        filterState.mealType = [];
        filterState.prepTime = [];
        filterState.features.glutenFree = false;
        filterState.features.withNuts = false;
        filterState.ingredients = [];

        panelForm.reset();

        applyFilters();
        updateApplyButtonState();
    }

    /* Filter panel builder */
    function makeOptionGroup(config) {
        var group = document.createElement("fieldset");
        var legend = document.createElement("legend");
        var list = document.createElement("ul");
        var showMoreButton = document.createElement("button");
        var maxVisible = 3;
        var isExpanded = false;

        group.className = "quick-actions-filter-group";
        legend.className = "quick-actions-filter-group__label";
        legend.textContent = config.label;
        list.className = "quick-actions-filter-list";

        function updateListVisibility() {
            var rows = list.querySelectorAll(".quick-actions-filter-row");
            rows.forEach(function (row, index) {
                row.hidden = !isExpanded && index >= maxVisible;
            });

            if (config.options.length <= maxVisible) {
                showMoreButton.hidden = true;
                return;
            }

            showMoreButton.hidden = false;
            showMoreButton.textContent = isExpanded ? "Pokaż mniej" : "Pokaż więcej";
            showMoreButton.setAttribute("aria-expanded", isExpanded ? "true" : "false");
        }

        config.options.forEach(function (option) {
            var row = document.createElement("li");
            var label = document.createElement("label");
            var text = document.createElement("span");
            var input = document.createElement("input");

            row.className = "quick-actions-filter-row";
            label.className = "quick-actions-filter-option";
            text.className = "quick-actions-filter-option__text";
            text.textContent = option.label;
            input.className = "quick-actions-filter-option__check";
            input.type = "checkbox";
            input.value = option.value;

            if (option.value === config.defaultValue) {
                input.checked = true;
            }

            input.addEventListener("change", function () {
                if (config.multiple) {
                    config.onChange(option.value, input.checked);
                    updateApplyButtonState();
                    return;
                }

                list.querySelectorAll(".quick-actions-filter-option__check").forEach(function (checkbox) {
                    checkbox.checked = false;
                });
                input.checked = true;
                config.onChange(option.value, true);
                updateApplyButtonState();
            });

            label.appendChild(text);
            label.appendChild(input);
            row.appendChild(label);
            list.appendChild(row);
        });

        showMoreButton.type = "button";
        showMoreButton.className = "quick-actions-filter-group__more";
        showMoreButton.setAttribute("aria-expanded", "false");
        showMoreButton.addEventListener("click", function () {
            isExpanded = !isExpanded;
            updateListVisibility();
        });

        updateListVisibility();

        group.appendChild(legend);
        group.appendChild(list);
        group.appendChild(showMoreButton);
        return group;
    }

    function buildFilterPanel() {
        var panelHeader = document.createElement("div");
        var panelTitle = document.createElement("p");
        var panelCloseButton = document.createElement("button");

        panel.className = "quick-actions-filter-panel";
        panel.id = "quick-actions-filter-panel";
        panel.setAttribute("role", "region");
        panel.setAttribute("aria-label", "Panel filtrów");
        panel.setAttribute("aria-hidden", "true");
        panelForm.className = "quick-actions-filter-panel__form";

        panelHeader.className = "quick-actions-filter-panel__header";
        panelTitle.className = "quick-actions-filter-panel__title";
        panelTitle.textContent = "Filtry";
        panelCloseButton.type = "button";
        panelCloseButton.className = "quick-actions-filter-panel__close";
        panelCloseButton.setAttribute("aria-label", "Zamknij panel filtrów");
        panelCloseButton.innerHTML = "&times;";
        panelCloseButton.addEventListener("click", function () {
            closeFilterPanel();
        });

        panelHeader.appendChild(panelTitle);
        panelHeader.appendChild(panelCloseButton);

        panelForm.appendChild(makeOptionGroup({
            label: "Typ dania",
            options: MEAL_TYPE_OPTIONS,
            multiple: true,
            onChange: function (value, checked) {
                if (checked && filterState.mealType.indexOf(value) === -1) {
                    filterState.mealType.push(value);
                }
                if (!checked) {
                    filterState.mealType = filterState.mealType.filter(function (entry) {
                        return entry !== value;
                    });
                }
            }
        }));

        panelForm.appendChild(makeOptionGroup({
            label: "Czas przygotowania",
            options: TIME_OPTIONS,
            multiple: true,
            onChange: function (value, checked) {
                if (checked && filterState.prepTime.indexOf(value) === -1) {
                    filterState.prepTime.push(value);
                }
                if (!checked) {
                    filterState.prepTime = filterState.prepTime.filter(function (entry) {
                        return entry !== value;
                    });
                }
            }
        }));

        panelForm.appendChild(makeOptionGroup({
            label: "Cechy",
            options: FEATURE_OPTIONS,
            multiple: true,
            onChange: function (value, checked) {
                filterState.features[value] = checked;
            }
        }));

        panelForm.appendChild(makeOptionGroup({
            label: "Składniki",
            options: INGREDIENT_OPTIONS,
            multiple: true,
            onChange: function (value, checked) {
                if (checked && filterState.ingredients.indexOf(value) === -1) {
                    filterState.ingredients.push(value);
                }
                if (!checked) {
                    filterState.ingredients = filterState.ingredients.filter(function (entry) {
                        return entry !== value;
                    });
                }
            }
        }));

        resetButton.type = "button";
        resetButton.className = "quick-actions-filter-panel__action quick-actions-filter-panel__action--ghost";
        resetButton.textContent = "Wyczyść";

        applyButton.type = "submit";
        applyButton.className = "quick-actions-filter-panel__action quick-actions-filter-panel__action--primary";
        applyButton.textContent = "Pokaż wyniki";

        panelForm.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilters();
            closeFilterPanel();
        });

        resetButton.addEventListener("click", function () {
            resetFilters();
        });

        var actionRow = document.createElement("div");
        actionRow.className = "quick-actions-filter-panel__actions";
        actionRow.appendChild(resetButton);
        actionRow.appendChild(applyButton);

        panelForm.appendChild(actionRow);
        panel.appendChild(panelHeader);
        panel.appendChild(panelForm);
        quickActionsBarHost.appendChild(panel);
        updateApplyButtonState();

        filterButton.addEventListener("click", function () {
            if (quickActionsBarHost.classList.contains("is-filter-open")) {
                closeFilterPanel();
                return;
            }

            openFilterPanel();
        });

        document.addEventListener("click", function (event) {
            if (!quickActionsBarHost.contains(event.target)) {
                closeFilterPanel();
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                closeFilterPanel();
            }
        });
    }

    if (!pageSupportsQuickActionsBar()) {
        return;
    }

    quickActionsBarHost.className = "quick-actions-bar";
    toggleModeLabel.className = "quick-actions-bar__mode-text";
    toggleModeLabel.textContent = "Tryb";
    toggleMoonIcon.className = "quick-actions-bar__mode-icon quick-actions-bar__mode-icon--moon";
    toggleMoonIcon.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M21 12.79A9 9 0 1 1 11.21 3c.5 0 .99.04 1.47.11A7 7 0 0 0 21 12.79z'/></svg>";
    toggleSunIcon.className = "quick-actions-bar__mode-icon quick-actions-bar__mode-icon--sun";
    toggleSunIcon.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='12' cy='12' r='4'/><path d='M12 2v2'/><path d='M12 20v2'/><path d='M4.93 4.93l1.41 1.41'/><path d='M17.66 17.66l1.41 1.41'/><path d='M2 12h2'/><path d='M20 12h2'/><path d='M4.93 19.07l1.41-1.41'/><path d='M17.66 6.34l1.41-1.41'/></svg>";
    toggleButton.className = "quick-actions-bar__button quick-actions-bar__button--theme-switch";
    toggleButton.type = "button";
    hasArchiveGrid = Boolean(document.querySelector(".recipe-archive-grid"));
    hasSingleRecipePage = !hasArchiveGrid && Boolean(document.querySelector(".recipe-main"));
    showRecipeQuickActions = false;

    if (hasArchiveGrid) {
        quickActionsBarHost.classList.add("quick-actions-bar--with-filters");
    }

    toggleButton.appendChild(toggleMoonIcon);
    toggleButton.appendChild(toggleSunIcon);
    toggleButton.appendChild(toggleModeLabel);
    quickActionsBarHost.appendChild(toggleButton);

    if (hasArchiveGrid) {
        filterButton.className = "quick-actions-bar__button quick-actions-bar__button--filter";
        filterButton.type = "button";
        filterButton.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><path d='M4 6h6'/><path d='M14 6h6'/><circle cx='11' cy='6' r='2'/><path d='M4 12h10'/><path d='M18 12h2'/><circle cx='15' cy='12' r='2'/><path d='M4 18h2'/><path d='M10 18h10'/><circle cx='7' cy='18' r='2'/></svg><span class='quick-actions-bar__filter-text'>Filtr</span>";
        filterButton.setAttribute("aria-controls", "quick-actions-filter-panel");
        filterButton.setAttribute("aria-expanded", "false");
        quickActionsBarHost.appendChild(filterButton);
    }

    if (hasSingleRecipePage) {
        printButton.className = "quick-actions-bar__button quick-actions-bar__button--recipe-action quick-actions-bar__button--print";
        printButton.type = "button";
        printButton.setAttribute("aria-label", "Drukuj przepis");
        printButton.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><polyline points='6 9 6 2 18 2 18 9'/><path d='M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2'/><rect x='6' y='14' width='12' height='8'/></svg><span class='quick-actions-bar__print-text'>Drukuj</span>";

        shareButton.className = "quick-actions-bar__button quick-actions-bar__button--recipe-action quick-actions-bar__button--share";
        shareButton.type = "button";
        shareButton.setAttribute("aria-label", "Udostępnij przepis");
        shareButton.setAttribute("aria-controls", "quick-actions-share-panel");
        shareButton.setAttribute("aria-expanded", "false");
        shareButton.innerHTML = "<svg xmlns='http://www.w3.org/2000/svg' width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'><circle cx='18' cy='5' r='3'/><circle cx='6' cy='12' r='3'/><circle cx='18' cy='19' r='3'/><line x1='8.59' y1='13.51' x2='15.42' y2='17.49'/><line x1='15.41' y1='6.51' x2='8.59' y2='10.49'/></svg><span class='quick-actions-bar__share-text'>Udostępnij</span>";

        quickActionsBarHost.appendChild(printButton);
        quickActionsBarHost.appendChild(shareButton);
        setupSharePanel();
    }

    document.body.appendChild(quickActionsBarHost);
    lastScrollY = Math.max(window.scrollY || window.pageYOffset || 0, 0);
    window.addEventListener("scroll", handleQuickActionsBarScroll, { passive: true });

    toggleButton.addEventListener("click", function () {
        setMode(document.body.classList.contains("theme-light") ? "dark" : "light");
    });

    if (hasSingleRecipePage) {
        printButton.addEventListener("click", function () {
            window.print();
        });

        shareButton.addEventListener("click", function () {
            toggleSharePanel();
        });

        document.addEventListener("click", function (event) {
            if (!quickActionsBarHost.contains(event.target)) {
                closeSharePanel(false);
            }
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") {
                if (quickActionsBarHost.classList.contains("is-share-open")) {
                    closeSharePanel(true);
                }
            }
        });

        updateRecipeQuickActionsVisibility();
        window.addEventListener("resize", updateRecipeQuickActionsVisibility);
    }

    if (hasArchiveGrid) {
        var initialCountNode = document.querySelector(".archive-results__count");
        if (initialCountNode) {
            initialArchiveCountText = initialCountNode.textContent.trim();
        }

        extractCardData();
        buildFilterPanel();
        applyFilters();
    }

    setMode(getInitialMode());
})();















