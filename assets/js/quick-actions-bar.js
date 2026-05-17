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
    var hasArchiveGrid = false;
    var hasRecipeListingShell = false;
    var facetwpListingEnabled = false;
    var hasSingleRecipePage = false;
    var showRecipeQuickActions = false;
    var lastScrollY = 0;
    var scrollDeltaThreshold = 10;
    var topRevealOffset = 24;
    var facetwpCountRequestToken = 0;
    var recipeListingState = {
        enabled: false,
        baseUrl: "",
        currentUrl: "",
        prefix: "g4t_"
    };
    var filterState = {
        mealType: [],
        prepTime: [],
        features: [],
        ingredients: []
    };

    var FACET_PARAM_KEYS = {
        mealType: "meal_type",
        prepTime: "prep_time",
        feature: "feature",
        ingredients: "ingredients"
    };

    var quickActionsConfig = window.go4tasteQuickActionsConfig || {};
    var dynamicOptions = quickActionsConfig.options || {};

    var DEFAULT_MEAL_TYPE_OPTIONS = [];
    var DEFAULT_TIME_OPTIONS = [];
    var DEFAULT_FEATURE_OPTIONS = [];
    var DEFAULT_INGREDIENT_OPTIONS = [];

    function normalizeOptionList(candidate, fallback) {
        if (!Array.isArray(candidate) || candidate.length === 0) {
            return fallback;
        }

        var normalized = candidate.map(function (option) {
            if (!option || typeof option.value !== "string" || typeof option.label !== "string") {
                return null;
            }

            return {
                value: option.value,
                label: option.label
            };
        }).filter(function (option) {
            return option !== null;
        });

        return normalized.length > 0 ? normalized : fallback;
    }

    var MEAL_TYPE_OPTIONS = normalizeOptionList(dynamicOptions.mealType, DEFAULT_MEAL_TYPE_OPTIONS);
    var TIME_OPTIONS = normalizeOptionList(dynamicOptions.prepTime, DEFAULT_TIME_OPTIONS);
    var FEATURE_OPTIONS = normalizeOptionList(dynamicOptions.feature, DEFAULT_FEATURE_OPTIONS);
    var INGREDIENT_OPTIONS = normalizeOptionList(dynamicOptions.ingredients, DEFAULT_INGREDIENT_OPTIONS);

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

    function getRecipeListingShell() {
        return document.querySelector(".recipe-listing-shell");
    }

    function syncRecipeListingState() {
        recipeListingState = {
            enabled: false,
            baseUrl: window.location.href,
            currentUrl: window.location.href,
            prefix: "g4t_"
        };

        var listingShell = getRecipeListingShell();
        hasRecipeListingShell = Boolean(listingShell);

        if (!listingShell) {
            return;
        }

        recipeListingState.enabled = listingShell.dataset.facetwpEnabled === "true";
        recipeListingState.baseUrl = listingShell.dataset.baseUrl || window.location.href;
        recipeListingState.currentUrl = listingShell.dataset.currentUrl || window.location.href;
        recipeListingState.prefix = listingShell.dataset.facetwpPrefix || "g4t_";
    }

    function getFacetParamName(facetKey) {
        return recipeListingState.prefix + FACET_PARAM_KEYS[facetKey];
    }

    function splitQueryValues(rawValue) {
        if (typeof rawValue !== "string" || rawValue === "") {
            return [];
        }

        return rawValue.split(",").map(function (value) {
            return value.trim();
        }).filter(function (value) {
            return value !== "";
        });
    }

    function parseFilterStateFromUrl() {
        var params = new URLSearchParams(window.location.search);

        filterState.mealType = splitQueryValues(params.get(getFacetParamName("mealType")));
        filterState.prepTime = splitQueryValues(params.get(getFacetParamName("prepTime")));
        filterState.features = splitQueryValues(params.get(getFacetParamName("feature")));

        if (filterState.features.length === 0) {
            if (params.has(recipeListingState.prefix + "gluten_free")) {
                filterState.features.push("gluten-free");
            }

            if (params.has(recipeListingState.prefix + "with_nuts")) {
                filterState.features.push("with-nuts");
            }
        }

        filterState.ingredients = splitQueryValues(params.get(getFacetParamName("ingredients")));
    }

    function buildFacetSelections() {
        var facets = {};
        var groups = panel.querySelectorAll(".quick-actions-filter-group");

        if (!groups.length) {
            if (filterState.mealType.length > 0) {
                facets[getFacetParamName("mealType")] = filterState.mealType.slice();
            }

            if (filterState.prepTime.length > 0) {
                facets[getFacetParamName("prepTime")] = filterState.prepTime.slice();
            }

            if (filterState.features.length > 0) {
                facets[getFacetParamName("feature")] = filterState.features.slice();
            }

            if (filterState.ingredients.length > 0) {
                facets[getFacetParamName("ingredients")] = filterState.ingredients.slice();
            }

            return facets;
        }

        groups.forEach(function (group) {
            var facetKey = group.dataset.facetKey || "";
            var checkedValues = Array.from(group.querySelectorAll(".quick-actions-filter-option__check:checked")).map(function (input) {
                return input.value;
            });

            if (!facetKey || checkedValues.length === 0) {
                return;
            }

            facets[getFacetParamName(facetKey)] = checkedValues;
        });

        return facets;
    }

    function buildFacetQueryParams() {
        var params = new URLSearchParams();
        var facets = buildFacetSelections();

        Object.keys(facets).forEach(function (facetName) {
            if (!facets[facetName] || !facets[facetName].length) {
                return;
            }

            params.set(facetName, facets[facetName].join(","));
        });

        return params;
    }

    function buildFacetRefreshPayload() {
        var facetSelections = buildFacetSelections();
        var queryParams = buildFacetQueryParams();
        var requestUrl = getListingRequestUrl();

        if (queryParams.toString()) {
            requestUrl += (requestUrl.indexOf("?") === -1 ? "?" : "&") + queryParams.toString();
        }

        return {
            action: "facetwp_refresh",
            data: {
                facets: facetSelections,
                template: "wp",
                http_params: {
                    get: Object.keys(facetSelections).reduce(function (carry, facetName) {
                        carry[facetName] = facetSelections[facetName].join(",");
                        return carry;
                    }, {}),
                    uri: requestUrl
                },
                extras: {
                    counts: true
                },
                frozen_facets: {},
                soft_refresh: 0,
                is_bfcache: 0,
                first_load: 0,
                paged: 1
            }
        };
    }
        function getListingRequestUrl() {
            var sourceUrl = recipeListingState.currentUrl || recipeListingState.baseUrl || window.location.href;

            try {
                return new URL(sourceUrl, window.location.href).pathname;
            } catch (error) {
                return window.location.pathname;
            }
        }


    function countActiveFilters() {
        return filterState.mealType.length
            + filterState.prepTime.length
            + filterState.ingredients.length
            + filterState.features.length;
    }

    function updateFilterButtonState() {
        var activeCount = countActiveFilters();
        var labelNode = filterButton.querySelector(".quick-actions-bar__filter-text");

        if (!labelNode) {
            return;
        }

        labelNode.textContent = activeCount > 0 ? "Filtr (" + activeCount + ")" : "Filtr";
    }

    function buildFacetRedirectUrl() {
        var queryParams = buildFacetQueryParams();
        var targetUrl = getListingRequestUrl();

        if (queryParams.toString()) {
            targetUrl += (targetUrl.indexOf("?") === -1 ? "?" : "&") + queryParams.toString();
        }

        return targetUrl;
    }

    function updateApplyButtonLabel(totalRows) {
        if (!applyButton) {
            return;
        }

        if (typeof totalRows === "number" && totalRows >= 0) {
            if (totalRows === 0) {
                applyButton.textContent = "Brak wyników";
                applyButton.disabled = true;
                return;
            }

            applyButton.disabled = false;
            applyButton.textContent = "Pokaż wyniki (" + totalRows + ")";
            return;
        }

        applyButton.disabled = false;
        applyButton.textContent = "Pokaż wyniki";
    }

    function handleApplyFilters() {
        closeFilterPanel();
        window.location.href = buildFacetRedirectUrl();
    }

    function closeFilterPanel() {
        quickActionsBarHost.classList.remove("is-filter-open");
        filterButton.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
        if ((hasArchiveGrid || hasRecipeListingShell) && document.body.contains(filterButton)) {
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
        filterState.features = [];
        filterState.ingredients = [];

        panelForm.reset();

        closeFilterPanel();
        window.location.href = window.location.pathname;
    }

    function updateApplyButtonState() {
        if (!facetwpListingEnabled || !applyButton) {
            return;
        }

        var requestToken = ++facetwpCountRequestToken;
        var payload = {
            facets: buildFacetSelections()
        };

        applyButton.disabled = false;
        updateApplyButtonLabel(null);

        window.fetch("/wp-json/go4taste-recipes/v1/filter-count", {
            method: "POST",
            credentials: "same-origin",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }).then(function (response) {
            if (!response.ok) {
                throw new Error("Result count request failed: " + response.status);
            }

            return response.json();
        }).then(function (responseData) {
            if (requestToken !== facetwpCountRequestToken) {
                return;
            }

            var totalRows = responseData && typeof responseData.total_rows === "number" ? responseData.total_rows : null;
            updateApplyButtonLabel(totalRows);
        }).catch(function () {
            if (requestToken !== facetwpCountRequestToken) {
                return;
            }

            updateApplyButtonLabel(null);
        });
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
        group.dataset.facetKey = config.facetKey || "";
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

            if (typeof config.isSelected === "function" ? config.isSelected(option.value) : option.value === config.defaultValue) {
                input.checked = true;
            }

            input.addEventListener("change", function () {
                if (config.multiple) {
                    config.onChange(option.value, input.checked);
                    updateFilterButtonState();
                    updateApplyButtonState();
                    return;
                }

                list.querySelectorAll(".quick-actions-filter-option__check").forEach(function (checkbox) {
                    checkbox.checked = false;
                });
                input.checked = true;
                config.onChange(option.value, true);
                updateFilterButtonState();
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
        if (!facetwpListingEnabled) {
            return;
        }

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
            facetKey: "mealType",
            label: "Typ dania",
            options: MEAL_TYPE_OPTIONS,
            multiple: true,
            isSelected: function (value) {
                return filterState.mealType.indexOf(value) !== -1;
            },
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
            facetKey: "prepTime",
            label: "Czas przygotowania",
            options: TIME_OPTIONS,
            multiple: true,
            isSelected: function (value) {
                return filterState.prepTime.indexOf(value) !== -1;
            },
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
            facetKey: "feature",
            label: "Cechy",
            options: FEATURE_OPTIONS,
            multiple: true,
            isSelected: function (value) {
                return filterState.features.indexOf(value) !== -1;
            },
            onChange: function (value, checked) {
                if (checked && filterState.features.indexOf(value) === -1) {
                    filterState.features.push(value);
                }

                if (!checked) {
                    filterState.features = filterState.features.filter(function (entry) {
                        return entry !== value;
                    });
                }
            }
        }));

        panelForm.appendChild(makeOptionGroup({
            facetKey: "ingredients",
            label: "Składniki",
            options: INGREDIENT_OPTIONS,
            multiple: true,
            isSelected: function (value) {
                return filterState.ingredients.indexOf(value) !== -1;
            },
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
            handleApplyFilters();
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
        updateFilterButtonState();
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

    syncRecipeListingState();
    facetwpListingEnabled = hasRecipeListingShell && recipeListingState.enabled;

    if (hasArchiveGrid || facetwpListingEnabled) {
        quickActionsBarHost.classList.add("quick-actions-bar--with-filters");
    }

    if (facetwpListingEnabled) {
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

    if (facetwpListingEnabled) {
        parseFilterStateFromUrl();
        buildFilterPanel();
        updateFilterButtonState();
        updateApplyButtonState();
        window.setTimeout(updateApplyButtonState, 0);
    }

    setMode(getInitialMode());
})();















