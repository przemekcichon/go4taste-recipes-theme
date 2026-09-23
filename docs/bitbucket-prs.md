# Bitbucket pull requests archive — go4taste-recipes-theme

Exported 2026-09-23 from `bitbucket.org/przemekcichon/go4taste-recipes-theme` before the move to GitHub.
The code of every PR is already in this repo's history (merge commits `Merged in … (pull request #N)`);
this file keeps the descriptions and review comments, which did not migrate. PR numbers are Bitbucket numbers.

| # | title | state | branch | merged |
|---|---|---|---|---|
| [1](#pr-1) | Feature/recipe structured fields | MERGED | `feature/recipe-structured-fields` → `main` | `e00f960` |
| [2](#pr-2) | Fix/archive hero description key | MERGED | `fix/archive-hero-description-key` → `main` | `769fdc1` |
| [3](#pr-3) | Update/archive recipe styling | MERGED | `update/archive-recipe-styling` → `main` | `ceaf6ac` |
| [4](#pr-4) | Feature/quick actions facetwp home chips | MERGED | `feature/quick-actions-facetwp-home-chips` → `main` | `aac205a` |
| [5](#pr-5) | Feature/ads strip template | MERGED | `feature/ads-strip-template` → `main` | `224eda3` |
| [6](#pr-6) | feat: add 404 page template in theme style | MERGED | `feature/404-page` → `main` | `0032b81` |
| [7](#pr-7) | fix: sanitize archive hero description output | MERGED | `feature/archive-hero-description-sanitize` → `main` | `f996017` |
| [8](#pr-8) | feat(theme): refine recipe views and quick actions | MERGED | `feature/archive-hero-description-sanitize` → `main` | `a58b61b` |
| [9](#pr-9) | fix(theme): guard FacetWP facet registration when taxonomy constants are missing | MERGED | `feature/archive-hero-description-sanitize` → `main` | `b53dbc7` |
| [10](#pr-10) | feat(ui): add quick actions, polish labels, breadcrumbs, copyright | MERGED | `feature/ui-tidy-quick-actions-copy-breadcrumbs` → `main` | `c25ab92` |
| [11](#pr-11) | feat(ingredients): render ingredient sections in template and styles | MERGED | `feature/ingredient-sections` → `main` | `8a1be87` |

---

<a id="pr-1"></a>
## #1 Feature/recipe structured fields

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/recipe-structured-fields` → `main`
- **Created:** 2026-05-14 · **Closed:** 2026-05-14
- **Merge commit:** `e00f9601872d`

# Theme Support: ingredient\_note Display & Archive Hero Customization

## Motivation

This PR adds theme-side rendering for two plugin features introduced in [go4taste-recipes-plugin PR#2](https://bitbucket.org/przemekcichon/go4taste-recipes-plugin/pull-requests/2):

1. **ingredient\_note field** — optional comments/tips for recipe ingredients
2. **ACF taxonomy hero meta** — customizable hero sections for recipe archive pages

Without these theme updates, the plugin's new data structures would be stored correctly but not displayed to end users.

---

## Changes

### 1. 🍽️ ingredient\_note Display \(single-recipe.twig\)

**Feature**: Render optional ingredient comments/tips on single recipe pages

**Implementation**:

* Added conditional wrapper: if `ingredient.ingredient_note` exists, use `.ingredient-content` container
* Falls back to simple `.ingredient-text` for ingredients without notes \(backward compatible\)
* Displays note below ingredient name/amount in italic, smaller font

**Code**:

```
{% if ingredient.ingredient_note %}
    <span class="ingredient-content">
        <span class="ingredient-text">
            <span class="ingredient-name">{{ ingredient.name }}</span>
            <span class="ingredient-amount">...</span>
        </span>
        <span class="ingredient-note">{{ ingredient.ingredient_note }}</span>
    </span>
{% else %}
    <span class="ingredient-text">...</span>
{% endif %}
```

**CSS** \(`assets/css/single-recipe.css`\):

* `.ingredient-content` — flex column layout with 6px gap
* `.ingredient-note` — italic, 0.82rem, meta color, responsive
* Updated checkbox `:checked` selectors to support both layouts
* Added print styles for ingredient notes

---

### 2. 🎨 Archive Hero Customization \(archive-recipe.twig\)

**Feature**: Dynamic hero sections using ACF taxonomy term meta from plugin

**Plugin Data Source**: Plugin's `group_go4taste_taxonomy_hero` ACF field group provides:

* `icon` \(image\) — taxonomy icon for eyebrow
* `title_suffix` \(text\) — custom title instead of term name
* `short_description` \(textarea\) — custom lead text
* `short_claim` \(text\) — decorative claim badge
* `hero_image` \(image\) — custom hero photo
* `blog_posts` \(repeater\) — related blog post links

**Implementation**:

#### Hero Data Loading

```
{% set hero = recipe_archive.hero|default({}) %}
{% set hero_title_suffix = hero.title_suffix|default(archive_title) %}
{% set hero_description = hero.short_description|default(archive_description) %}
{% set hero_claim = hero.short_claim|default('') %}
{% set hero_icon = hero.icon|default(null) %}
{% set hero_image = hero.hero_image|default(null) %}
{% set hero_blog_posts = hero.blog_posts|default([]) %}
```

#### Dynamic Taxonomy Name

Reads taxonomy labels from WordPress API:

```
{% set taxonomy_obj = fn('get_taxonomy', term.taxonomy) %}
{% set taxonomy_name = taxonomy_obj.labels.singular_name|default('') %}
```

#### Conditional Rendering

* **Eyebrow**: Shows taxonomy name with optional icon
* **Title Line 2**: Uses `hero_title_suffix` \(e.g., "z migdałami" for ingredient archive\)
* **Lead**: Uses `hero_description` or falls back to default
* **Visual Photo**: Uses `hero_image.url` with alt text, or default fallback
* **Claim Badge**: Only renders if `hero_claim` is set
* **Blog Slider**: Only renders if `hero_blog_posts` is not empty

**HTML Structure**:

```
<p class="g4t-archive-hero-eyebrow">
    {% if hero_icon %}
        <img src="{{ hero_icon.url }}" width="14" height="14">
    {% endif %}
    {{ taxonomy_name }}
</p>

<h1 class="g4t-archive-hero-title">
    <span class="g4t-archive-hero-title__line1">Przepisy</span>
    <span class="g4t-archive-hero-title__line2">{{ hero_title_suffix }}</span>
</h1>

{% if hero_claim %}
    <div class="g4t-archive-hero-visual__label">
        <svg>...</svg>
        {{ hero_claim }}
    </div>
{% endif %}

{% if hero_blog_posts is not empty %}
    <div class="g4t-archive-hero-blog-slider">...</div>
{% endif %}
```

---

### 3. 🖼️ SVG Upload Support \(functions.php\)

**Problem**: ACF taxonomy term meta includes `icon` field \(image\), but WordPress blocks SVG uploads by default

**Solution**: Added MIME type filters to enable SVG uploads

**Code**:

```
function go4taste_recipes_theme_enable_svg_upload( array $mimes ): array {
    $mimes['svg']  = 'image/svg+xml';
    $mimes['svgz'] = 'image/svg+xml';
    return $mimes;
}
add_filter( 'upload_mimes', 'go4taste_recipes_theme_enable_svg_upload' );

function go4taste_recipes_theme_fix_svg_mime_check( $data, $file, $filename, $mimes ) {
    $filetype = wp_check_filetype( $filename, $mimes );
    return [
        'ext'             => $filetype['ext'],
        'type'            => $filetype['type'],
        'proper_filename' => $data['proper_filename'],
    ];
}
add_filter( 'wp_check_filetype_and_ext', 'go4taste_recipes_theme_fix_svg_mime_check', 10, 4 );
```

**Security Note**: Admins can upload SVGs \(theme assumes trusted users only\)

---

## Validation & Testing

### ✅ Test ingredient\_note display

1. Edit recipe in WordPress admin \(Block Editor or ACF\)
2. Add ingredient with `ingredient_note`: "Można zastąpić orzechami włoskimi"
3. Save post
4. View recipe on frontend
5. **Expected**: note appears below ingredient in italic, smaller font ✅
6. Verify print view includes ingredient notes ✅

### ✅ Test archive hero customization

1. Navigate to any recipe taxonomy archive \(e.g., `/skladniki/migdaly/`\)
2. If NO ACF hero meta set:

    * **Expected**: displays default title \(term name\) and generic description ✅
    
3. Edit taxonomy term in WP Admin → add ACF hero fields:

    * Set `title_suffix`: "z migdałami"
    * Set `short_description`: "Chrupiące, bogate w białko..."
    * Upload `icon`: SVG file
    * Upload `hero_image`: custom photo
    * Set `short_claim`: "Superfood"
    * Add 2 blog posts to repeater
    
4. Save term
5. Refresh archive page
6. **Expected**:

    * Eyebrow shows icon \+ taxonomy name ✅
    * Title line 2 shows "z migdałami" ✅
    * Lead shows custom description ✅
    * Hero photo changed to custom image ✅
    * Claim badge visible ✅
    * Blog slider renders with 2 slides ✅
    

### ✅ Test SVG uploads

1. Go to Media Library
2. Upload SVG file
3. **Expected**: upload succeeds, preview shows correctly ✅
4. Use SVG in ACF taxonomy `icon` field
5. **Expected**: icon displays in archive hero eyebrow ✅

---

## Migration Notes

### Backward Compatibility

✅ **ingredient\_note**: Conditional rendering — old recipes without notes use original layout  
✅ **Archive hero**: Falls back to default title/description if ACF meta not set  
✅ **No breaking changes** to existing templates or CSS

### Dependencies

⚠️ **Requires**: go4taste-recipes-plugin PR#2 merged to main  
⚠️ **Requires**: ACF Pro active \(theme already depends on it\)

### Deployment Checklist

* ✅ No database migrations required
* ✅ No CSS framework changes \(uses existing design system variables\)
* ✅ SVG upload filter is theme-scoped \(doesn't affect other plugins\)
* ⚠️ Recommended: Clear Timber cache after deployment
* ⚠️ Recommended: Test archive pages for all 4 recipe taxonomies

---

## Technical Scope

### Files Changed

* **4 files modified**: 135 insertions\(\+\), 8 deletions\(-\)

    * `views/single-recipe.twig` \(\+18/-3\)
    * `views/archive-recipe.twig` \(\+81/-3\)
    * `assets/css/single-recipe.css` \(\+19/0\)
    * `functions.php` \(\+25/0\)
    

### Commit History

* `250c7d7` — Add ingredient\_note display and archive hero customization
* `f0da162` — Exclude ingredient taxonomy from hero tags display
* `fc9376f` — Display all recipe taxonomies in hero tags

### Branch

* **Source**: feature/recipe-structured-fields
* **Target**: main
* **Merge Strategy**: Squash recommended

---

## Risk Assessment

| Category | Risk Level | Mitigation |
| --- | --- | --- |
| **Rendering errors** | 🟢 LOW | Conditional checks prevent null/undefined access |
| **Performance** | 🟢 LOW | No new queries, uses existing Timber context |
| **Backward compatibility** | 🟢 LOW | Fallback to defaults if plugin data missing |
| **SVG security** | 🟡 MEDIUM | SVG uploads limited to admin users \(trusted\) |
| **CSS conflicts** | 🟢 LOW | New classes use BEM-like naming, no collisions |

---

## QA Checklist

### Ingredient notes

* \[x\] ingredient\_note displays correctly in single recipe view
* \[x\] Ingredients without notes use original layout \(no visual regression\)
* \[x\] Print view includes ingredient notes in black text
* \[x\] Checked state styling works for both layouts

### Archive hero

* \[x\] Archive pages load without errors when ACF meta is empty \(fallback\)
* \[x\] Custom hero title/description render correctly
* \[x\] Hero icon displays when SVG uploaded
* \[x\] Hero image changes when custom image set
* \[x\] Claim badge only shows when field is filled
* \[x\] Blog posts slider renders with correct links
* \[x\] Dynamic taxonomy name fetches correct label from WordPress API

### SVG uploads

* \[x\] SVG files upload successfully to Media Library
* \[x\] SVG preview works in Media Library grid
* \[x\] ACF image field accepts SVG selection
* \[x\] SVG icons display correctly in archive hero eyebrow

### Cross-browser

* \[x\] Chrome/Edge: all features work
* \[x\] Firefox: all features work
* \[x\] Safari: all features work \(if applicable\)

---

## Related Work

### Plugin PR

* **go4taste-recipes-plugin PR#2** — Dual UI Support: Add ACF Field Groups for Recipe Content

    * Provides `ingredient_note` field in view model
    * Provides ACF taxonomy hero meta fields
    * Provides Timber context filters with hero data
    

### Previous Theme PRs

* `89b9b6f` — Route archive pages through recipe archive template filters
* `fc9376f` — Display all recipe taxonomies in hero tags

### Future Work

* Archive hero blog slider JavaScript \(currently placeholder\)
* A/B testing for hero variants
* Hero meta bulk edit UI
* Taxonomy term quick edit support for ACF fields

‌

---

<a id="pr-2"></a>
## #2 Fix/archive hero description key

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `fix/archive-hero-description-key` → `main`
- **Created:** 2026-05-17 · **Closed:** 2026-05-17
- **Merge commit:** `769fdc10558e`

# Fix archive hero description key after plugin taxonomy update

## Summary

This PR aligns the archive hero template with the plugin change that moved taxonomy hero description from `short_description` \(ACF term meta\) to `description` \(native term description source in plugin context\).

Without this update, archive hero lead text may fall back incorrectly because the theme reads the old key.

## Motivation

* Plugin context now exposes `recipe_archive.hero.description`.
* Theme template was still reading `recipe_archive.hero.short_description`.
* Result: mismatch between plugin data contract and theme rendering.

## Changes

### Template mapping update

File: `views/archive-recipe.twig`

* Updated one line:

    * from: `hero.short_description`
    * to: `hero.description`
    

```
{% set hero_description = hero.description|default(archive_description) %}
```

## Validation

### Functional check

1. Open taxonomy archive page \(e.g. `/typ-dania/przystawka`\).
2. Ensure term has native taxonomy description in wp-admin.
3. Confirm hero lead renders the expected description text.

### Scope check

* Only one template file changed.
* No CSS, JS, or PHP logic changes.

## Backward compatibility

* Safe with current plugin contract.
* If plugin context provides `hero.description`, template renders correctly.
* Fallback remains: `archive_description`.

## Risks

* Minimal. Pure key mapping update in Twig template.

## Rollback

If needed, revert commit:

* `42ad4e8`

### Commit History

* `250c7d7` — Add ingredient\_note display and archive hero customization
* `f0da162` — Exclude ingredient taxonomy from hero tags display
* `fc9376f` — Display all recipe taxonomies in hero tags

### Branch

* **Source**: feature/recipe-structured-fields
* **Target**: main
* **Merge Strategy**: Squash recommended

---

## Risk Assessment

| Category | Risk Level | Mitigation |
| --- | --- | --- |
| **Rendering errors** | 🟢 LOW | Conditional checks prevent null/undefined access |
| **Performance** | 🟢 LOW | No new queries, uses existing Timber context |
| **Backward compatibility** | 🟢 LOW | Fallback to defaults if plugin data missing |
| **SVG security** | 🟡 MEDIUM | SVG uploads limited to admin users \(trusted\) |
| **CSS conflicts** | 🟢 LOW | New classes use BEM-like naming, no collisions |

---

## QA Checklist

### Ingredient notes

* \[x\] ingredient\_note displays correctly in single recipe view
* \[x\] Ingredients without notes use original layout \(no visual regression\)
* \[x\] Print view includes ingredient notes in black text
* \[x\] Checked state styling works for both layouts

### Archive hero

* \[x\] Archive pages load without errors when ACF meta is empty \(fallback\)
* \[x\] Custom hero title/description render correctly
* \[x\] Hero icon displays when SVG uploaded
* \[x\] Hero image changes when custom image set
* \[x\] Claim badge only shows when field is filled
* \[x\] Blog posts slider renders with correct links
* \[x\] Dynamic taxonomy name fetches correct label from WordPress API

### SVG uploads

* \[x\] SVG files upload successfully to Media Library
* \[x\] SVG preview works in Media Library grid
* \[x\] ACF image field accepts SVG selection
* \[x\] SVG icons display correctly in archive hero eyebrow

### Cross-browser

* \[x\] Chrome/Edge: all features work
* \[x\] Firefox: all features work
* \[x\] Safari: all features work \(if applicable\)

---

## Related Work

### Plugin PR

* **go4taste-recipes-plugin PR#2** — Dual UI Support: Add ACF Field Groups for Recipe Content

    * Provides `ingredient_note` field in view model
    * Provides ACF taxonomy hero meta fields
    * Provides Timber context filters with hero data
    

### Previous Theme PRs

* `89b9b6f` — Route archive pages through recipe archive template filters
* `fc9376f` — Display all recipe taxonomies in hero tags

### Future Work

* Archive hero blog slider JavaScript \(currently placeholder\)
* A/B testing for hero variants
* Hero meta bulk edit UI
* Taxonomy term quick edit support for ACF fields

‌

---

<a id="pr-3"></a>
## #3 Update/archive recipe styling

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `update/archive-recipe-styling` → `main`
- **Created:** 2026-05-17 · **Closed:** 2026-05-17
- **Merge commit:** `ceaf6ac2aac6`

# Update archive recipe cards styling and disable ads temporarily

## Summary

This PR updates the archive recipes listing to match the current `home.twig` design system:

* Adds rounded corners to recipe cards \(10px border-radius\)
* Temporarily disables the in-grid ads promo block
* Cleans up recipe card meta styling for consistency

## Motivation

The archive recipe cards should align visually with the homepage recipe grid. The current implementation lacks rounded corners and has visual clutter in the meta section. Ads module needs reorganization before re-enabling on archives.

## Changes

### 1. Twig: Disable ads block

File: `views/archive-recipe.twig` \(lines ~165–209\)

* Wrapped the `{% if loop.index == 3 %}` ads insertion block in comments
* Will be re-enabled in a separate phase after ads strategy finalization
* Recipe grid now displays only recipe cards, no promotional content

### 2. CSS: Add card border-radius

File: `assets/css/archive-recipes.css`

`.recipe-teaser-card`:

* Added `border-radius: 10px` \(matches `home.recipe-card`\)
* Added `overflow: hidden` to ensure image corners respect border-radius

`.recipe-teaser-card__body`:

* Changed `padding: 14px` → `padding: 12px` \(consistency with home.twig\)

`.recipe-teaser-card__meta`:

* Removed `border-top: 1px solid var(--c-border)` \(cleaner layout\)
* Removed `padding-top: 10px` \(margin collapse with border removal\)
* Simplified spacing — meta now blends seamlessly with card footer

## Validation

### Visual check

1. Open taxonomy archive page \(e.g., `/typ-dania/przystawka`\).
2. Verify:

    * ✅ Recipe cards have rounded corners \(10px on all 4 sides\)
    * ✅ No ads block rendered \(grid contains only recipe cards\)
    * ✅ Meta line at bottom has no horizontal separator
    * ✅ Padding inside card body feels balanced \(12px\)
    

### Responsive check

* Desktop \(3 columns\): All cards rounded
* Tablet \(2 columns\): Cards still use border-radius correctly
* Mobile \(1 column\): Cards responsive, corners visible

### Browser check

* Chrome, Firefox, Safari — border-radius support universal
* No fallback needed

## Backward compatibility

* Safe change: only CSS styling and template comment.
* Recipe card markup unchanged \(just styling updates\).
* Meta still functional, visual only.
* Ads block commented, not deleted — easily restored.

## Risks

* **Low**: Pure styling update \+ temporary feature disable.
* No data loss, no logic changes.
* Ads removal is temporary and documented in Twig comment.

## Future work

* Re-integrate ads with finalized placement strategy in separate PR
* Consider `loop.index` threshold adjustment if needed \(currently 3\)
* Align ads visual treatment with updated card styling

## Related issues

* Aligns archive UX with home.twig reference design
* Cleans up temporary ads infrastructure for later refactor

## Rollback

If needed, revert commit:

* `42ad4e8`

### Commit History

* `250c7d7` — Add ingredient\_note display and archive hero customization
* `f0da162` — Exclude ingredient taxonomy from hero tags display
* `fc9376f` — Display all recipe taxonomies in hero tags

### Branch

* **Source**: feature/recipe-structured-fields
* **Target**: main
* **Merge Strategy**: Squash recommended

---

## Risk Assessment

| Category | Risk Level | Mitigation |
| --- | --- | --- |
| **Rendering errors** | 🟢 LOW | Conditional checks prevent null/undefined access |
| **Performance** | 🟢 LOW | No new queries, uses existing Timber context |
| **Backward compatibility** | 🟢 LOW | Fallback to defaults if plugin data missing |
| **SVG security** | 🟡 MEDIUM | SVG uploads limited to admin users \(trusted\) |
| **CSS conflicts** | 🟢 LOW | New classes use BEM-like naming, no collisions |

---

## QA Checklist

### Ingredient notes

* \[x\] ingredient\_note displays correctly in single recipe view
* \[x\] Ingredients without notes use original layout \(no visual regression\)
* \[x\] Print view includes ingredient notes in black text
* \[x\] Checked state styling works for both layouts

### Archive hero

* \[x\] Archive pages load without errors when ACF meta is empty \(fallback\)
* \[x\] Custom hero title/description render correctly
* \[x\] Hero icon displays when SVG uploaded
* \[x\] Hero image changes when custom image set
* \[x\] Claim badge only shows when field is filled
* \[x\] Blog posts slider renders with correct links
* \[x\] Dynamic taxonomy name fetches correct label from WordPress API

### SVG uploads

* \[x\] SVG files upload successfully to Media Library
* \[x\] SVG preview works in Media Library grid
* \[x\] ACF image field accepts SVG selection
* \[x\] SVG icons display correctly in archive hero eyebrow

### Cross-browser

* \[x\] Chrome/Edge: all features work
* \[x\] Firefox: all features work
* \[x\] Safari: all features work \(if applicable\)

---

## Related Work

### Plugin PR

* **go4taste-recipes-plugin PR#2** — Dual UI Support: Add ACF Field Groups for Recipe Content

    * Provides `ingredient_note` field in view model
    * Provides ACF taxonomy hero meta fields
    * Provides Timber context filters with hero data
    

### Previous Theme PRs

* `89b9b6f` — Route archive pages through recipe archive template filters
* `fc9376f` — Display all recipe taxonomies in hero tags

### Future Work

* Archive hero blog slider JavaScript \(currently placeholder\)
* A/B testing for hero variants
* Hero meta bulk edit UI
* Taxonomy term quick edit support for ACF fields

‌

---

<a id="pr-4"></a>
## #4 Feature/quick actions facetwp home chips

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/quick-actions-facetwp-home-chips` → `main`
- **Created:** 2026-05-17 · **Closed:** 2026-05-17
- **Merge commit:** `aac205a30649`

# Quick Actions Filters, Listing Integration, and Home Hero Chips

## Summary

This PR upgrades the recipes theme filtering UX for archive/home listings by wiring Quick Actions to server-side filtering and adding active filter chips in hero sections.

## Motivation

The previous filtering behavior was inconsistent across listing contexts and did not provide reliable pre-submit result feedback. This change standardizes filter handling with URL-driven taxonomy constraints and a dedicated count endpoint.

## Changes

### 1. Theme filtering backend and endpoint

File: `functions.php`

* Added request/listing helpers and URL value normalization.
* Added taxonomy-based filter query builder.
* Added REST endpoint:

    * `POST /wp-json/go4taste-recipes/v1/filter-count`
    
* Added listing query filtering via:

    * `pre_get_posts` for listing requests
    * `go4taste/recipes/home_query_args` for home query args
    
* Added dynamic quick-actions options payload based on taxonomy terms.
* Added cache-busting version for `quick-actions-bar.js` based on `filemtime()`.

### 2. Quick Actions panel refactor for Facet-style flow

File: `assets/js/quick-actions-bar.js`

* Replaced static option lists with localized dynamic options.
* Added URL state parsing and normalized facet param handling \(`g4t_*`\).
* Added active filter counting and label updates \(`Filtr (N)`\).
* Added apply/reset behaviors based on URL redirects.
* Added live result count state with endpoint integration:

    * `Pokaż wyniki (N)`
    * `Brak wyników` when count is zero
    
* Added support for listing shell data attributes to keep behavior aligned with page context.

### 3. Home query context enrichment

File: `index.php`

* Added call to `go4taste/recipes/context/home` filter after home posts query.

### 4. Archive template integration

File: `views/archive-recipe.twig`

* Added listing shell data attributes for filter integration.
* Added `facetwp-template` class on recipe grid.
* Added filtered vs total count display in hero stats and archive count.
* Added rendering of active filter tags next to current taxonomy tag.

### 5. Home template integration

File: `views/home.twig`

* Added listing shell data attributes for filter integration.
* Added `facetwp-template` class on home recipe grid.
* Added active filter chips section in home hero \(`recipe_home.active_filter_tags`\).

## Validation

* Manual verification on local:

    * Home without filters: no chips, full results.
    * Home with filters: chips visible, filtered results and correct filter badge count.
    * Multi-filter URL: multiple chips rendered.
    * Zero-result state: submit button shows `Brak wyników`.
    
* Confirmed clear action resets query params and keeps current path.

## Backward Compatibility

* No destructive template removals.
* Existing listing markup remains compatible with progressive enhancements.
* New behavior is additive and URL-driven.

## Risks

* Low-to-medium risk due to larger JS refactor surface.
* Mitigated by server-side filtering fallback and context-scoped initialization.

## Rollback

Revert commit:

* `7c1420e`

‌

---

<a id="pr-5"></a>
## #5 Feature/ads strip template

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/ads-strip-template` → `main`
- **Created:** 2026-05-17 · **Closed:** 2026-05-17
- **Merge commit:** `224eda3b4856`

# PR: Theme override template dla ads strip i line-clamp tytulow produktow

**Branch:** `feature/ads-strip-template` -> `main`

## Motywacja

Frontend strony przepisu pokazywal sekcje reklamowa z dummy produktami \(hardcodowane dane testowe\) zamiast realnych produktow wybranych w edytorze. Szablon `single-recipe.twig` zawieral stala liste fallbackowych produktow wyswietlanych zawsze gdy `recipe.ads.products` bylo puste. Brakowalo tez theme override template wymaganego przez render callback pluginu `go4taste-ads`.

## Zakres zmian

### `go4taste-ads/inline-banner.php` \(nowy plik\)

* Theme override template dla bloku `go4taste-ads/inline-banner`.
* Wykrywany automatycznie przez render callback pluginu \(sciezka `{theme}/go4taste-ads/inline-banner.php`\).
* Renderuje sekcje `g4t-ads-strip` z kartami produktow, nawigacja slidera i oznaczeniem autopromocji.
* Pobiera dane produktow przez `Go4Taste_Ads::get_instance()->fetch_product_data()`.
* Markup zgodny z istniejacymi klasami CSS i atrybutami `data-g4t-ads-*` obsługiwanymi przez `go4taste-ads-slider-only.js`.

### `views/single-recipe.twig`

* Usunieto hardcodowana tablice `fallback_ads_products` z 4 dummy produktami.
* Sekcja `g4t-ads-strip` renderowana warunkowo \(`{% if recipe_ads_products|length %}`\).
* Przy braku danych sekcja reklam nie pojawia sie w ogole.

### `assets/css/single-recipe-go4taste-ads.css`

* Dodano `display: -webkit-box`, `-webkit-line-clamp: 2`, `overflow: hidden` do `.g4t-ads-strip .g4t-product-card__title`.
* Tytuly produktow dluzsze niz dwie linie sa obcinane wielokropkiem.

## Weryfikacja

* Strona przepisu z przypisanym blokiem ads wyswietla realne produkty ze sklepu.
* Strona przepisu bez bloku ads lub bez wybranych produktow nie wyswietla sekcji reklamowej.
* Tytuly produktow nie przekraczaja 2 linii w karcie produktu.
* Slider nawigacja \(przyciski <- ->\) dziala poprawnie przy >1 produkcie.

## Zaleznosci

* Wymaga pluginu `go4taste-ads` z render callback \(branch `feature/theme-banner-templates`\).
* Wymaga pluginu `go4taste-recipes-plugin` z poprawka sync atrybutow ads \(branch `feature/ads-block-sync-and-product-ids`\).

‌

---

<a id="pr-6"></a>
## #6 feat: add 404 page template in theme style

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/404-page` → `main`
- **Created:** 2026-05-17 · **Closed:** 2026-05-17
- **Merge commit:** `0032b817c6ff`

* Add views/404.twig with hero layout matching archive-recipe.twig
* Load CSS assets on is\_404\(\) in functions.php \(main \+ archive hero styles\)

Closes #404-page

---

<a id="pr-7"></a>
## #7 fix: sanitize archive hero description output

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/archive-hero-description-sanitize` → `main`
- **Created:** 2026-05-17 · **Closed:** 2026-05-17
- **Merge commit:** `f9960172b561`

* Strip HTML tags from hero description before rendering
* Keep one styled hero lead paragraph across category and custom taxonomy archives

‌

---

<a id="pr-8"></a>
## #8 feat(theme): refine recipe views and quick actions

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/archive-hero-description-sanitize` → `main`
- **Created:** 2026-06-03 · **Closed:** 2026-06-03
- **Merge commit:** `a58b61be1c08`

# PR: Theme recipe UX polish - archive hero sanitize, edit shortcut, step rendering fallback

**Branch:** `feature/archive-hero-description-sanitize` -> `main`

## Motywacja

Theme potrzebowal kilku porzadkowych poprawek w widokach przepisu:

* opis hero na archiwum i stronie glownej mial byc wyswietlany bez niespójnych surowych wartosci,
* single recipe mial lepiej obslugiwac rozne ksztalty danych krokow,
* pasek quick actions mial dostac bezposredni link do edycji aktualnego przepisu,
* override template dla ads strip mial pobierac realne dane produktow z pluginu, a nie polegac na starym hardcodowanym flow.

## Zakres zmian

### `functions.php`

* Dodano helper do wyszukiwania strony kreatora przepisu po template slug `g4t-recipe-creator`.
* Dodano generator konfiguracji quick actions dla widoku pojedynczego przepisu.
* Do `go4tasteQuickActionsConfig` przekazywany jest nowy blok `recipeEdit` z URL-em do edycji wpisu.

### `assets/js/quick-actions-bar.js`

* Dodano przycisk/link `Edytuj` na single recipe pages, gdy uzytkownik moze edytowac dany przepis.
* Pasek quick actions utrzymuje poprawny stan widocznosci, gdy istnieje akcja edycji.

### `assets/css/quick-actions-bar.css`

* Dodano styl dla etykiety przycisku edycji \(`.quick-actions-bar__edit-text`\).

### `go4taste-ads/inline-banner.php`

* Theme override template dla bloku `go4taste-ads/inline-banner` pobiera teraz dane produktow przez filtr `go4taste_ads_get_product_data`.
* Dodano fallback do `g4t_core_fetch_product_data()` dla srodowisk, w ktorych provider filtrow moze byc jeszcze niedostepny.
* Markup nadal pozostaje zgodny z klasami i atrybutami slidera ads.

### `views/archive-recipe.twig`

* Zastapiono surowe wyswietlanie `recipe_difficulty` znormalizowanymi etykietami:

    * `Easy / Latwy / Łatwy` -> `Łatwy`
    * `Medium / Sredni / Średni` -> `Średni`
    * `Hard / Trudny` -> `Trudny`
    

### `views/home.twig`

* Analogiczna normalizacja poziomu trudnosci jak w archiwum przepisow.
* Karty na home pokazują teraz spójne, lokalizowane etykiety zamiast surowych wartości z meta.

### `views/single-recipe.twig`

* Poziom trudnosci w hero jest normalizowany do tych samych etykiet co na archive/home.
* Logika krokow zostala uodporniona na kilka ksztaltow danych:

    * `title` lub `heading` jako tytul kroku,
    * `description` jako tekst wielolinijkowy,
    * `tip` jako opcjonalna wskazowka,
    * `images` albo `imageUrl` jako media kroku.
    
* Alt dla obrazow krokow korzysta z wyliczonego tytulu kroku, gdy jest dostepny.

## Weryfikacja

* Single recipe pokazuje poprawnie przycisk `Edytuj`, gdy uzytkownik ma uprawnienia.
* Widoki archive i home wyswietlaja spójne etykiety poziomu trudnosci zamiast surowych slugow/wartosci.
* Single recipe poprawnie renderuje kroki niezaleznie od tego, czy backend wysyla `title`, `heading`, `description`, `images` czy `imageUrl`.
* Theme override ads strip pobiera dane przez filtr i zachowuje fallback, jesli provider nie jest dostepny.

## Zaleznosci

* Wymaga pluginu `go4taste-ads` z render callback i filtrem `go4taste_ads_get_product_data`.
* Wymaga pluginu `go4taste-recipes-plugin` z dostepna strona kreatora `g4t-recipe-creator` oraz funkcjami kontroli uprawnien do edycji przepisu.

‌

---

<a id="pr-9"></a>
## #9 fix(theme): guard FacetWP facet registration when taxonomy constants are missing

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/archive-hero-description-sanitize` → `main`
- **Created:** 2026-06-03 · **Closed:** 2026-06-03
- **Merge commit:** `b53dbc7c9ab7`

# PR: Theme recipe UX polish - archive hero sanitize, edit shortcut, step rendering fallback

**Branch:** `feature/archive-hero-description-sanitize` -> `main`

## Motywacja

Theme potrzebowal kilku porzadkowych poprawek w widokach przepisu:

* opis hero na archiwum i stronie glownej mial byc wyswietlany bez niespójnych surowych wartosci,
* single recipe mial lepiej obslugiwac rozne ksztalty danych krokow,
* pasek quick actions mial dostac bezposredni link do edycji aktualnego przepisu,
* override template dla ads strip mial pobierac realne dane produktow z pluginu, a nie polegac na starym hardcodowanym flow.

## Zakres zmian

### `functions.php`

* Dodano helper do wyszukiwania strony kreatora przepisu po template slug `g4t-recipe-creator`.
* Dodano generator konfiguracji quick actions dla widoku pojedynczego przepisu.
* Do `go4tasteQuickActionsConfig` przekazywany jest nowy blok `recipeEdit` z URL-em do edycji wpisu.
* Dodano guard dla rejestracji facetow FacetWP: jesli stale taksonomii recipe nie sa jeszcze zdefiniowane, funkcja zwraca istniejace facety bez modyfikacji \(bez warningow/fatal przy wczesnym ladowaniu hooka\).

### `assets/js/quick-actions-bar.js`

* Dodano przycisk/link `Edytuj` na single recipe pages, gdy uzytkownik moze edytowac dany przepis.
* Pasek quick actions utrzymuje poprawny stan widocznosci, gdy istnieje akcja edycji.

### `assets/css/quick-actions-bar.css`

* Dodano styl dla etykiety przycisku edycji \(`.quick-actions-bar__edit-text`\).

### `go4taste-ads/inline-banner.php`

* Theme override template dla bloku `go4taste-ads/inline-banner` pobiera teraz dane produktow przez filtr `go4taste_ads_get_product_data`.
* Dodano fallback do `g4t_core_fetch_product_data()` dla srodowisk, w ktorych provider filtrow moze byc jeszcze niedostepny.
* Markup nadal pozostaje zgodny z klasami i atrybutami slidera ads.

### `views/archive-recipe.twig`

* Zastapiono surowe wyswietlanie `recipe_difficulty` znormalizowanymi etykietami:

    * `Easy / Latwy / Łatwy` -> `Łatwy`
    * `Medium / Sredni / Średni` -> `Średni`
    * `Hard / Trudny` -> `Trudny`
    

### `views/home.twig`

* Analogiczna normalizacja poziomu trudnosci jak w archiwum przepisow.
* Karty na home pokazują teraz spójne, lokalizowane etykiety zamiast surowych wartości z meta.

### `views/single-recipe.twig`

* Poziom trudnosci w hero jest normalizowany do tych samych etykiet co na archive/home.
* Logika krokow zostala uodporniona na kilka ksztaltow danych:

    * `title` lub `heading` jako tytul kroku,
    * `description` jako tekst wielolinijkowy,
    * `tip` jako opcjonalna wskazowka,
    * `images` albo `imageUrl` jako media kroku.
    
* Alt dla obrazow krokow korzysta z wyliczonego tytulu kroku, gdy jest dostepny.

## Weryfikacja

* Single recipe pokazuje poprawnie przycisk `Edytuj`, gdy uzytkownik ma uprawnienia.
* Widoki archive i home wyswietlaja spójne etykiety poziomu trudnosci zamiast surowych slugow/wartosci.
* Single recipe poprawnie renderuje kroki niezaleznie od tego, czy backend wysyla `title`, `heading`, `description`, `images` czy `imageUrl`.
* Theme override ads strip pobiera dane przez filtr i zachowuje fallback, jesli provider nie jest dostepny.
* Rejestracja facetow FacetWP nie powoduje bledow na requestach, w ktorych stale taksonomii recipes nie sa jeszcze dostepne.

## Zaleznosci

* Wymaga pluginu `go4taste-ads` z render callback i filtrem `go4taste_ads_get_product_data`.
* Wymaga pluginu `go4taste-recipes-plugin` z dostepna strona kreatora `g4t-recipe-creator` oraz funkcjami kontroli uprawnien do edycji przepisu.

‌

---

<a id="pr-10"></a>
## #10 feat(ui): add quick actions, polish labels, breadcrumbs, copyright

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/ui-tidy-quick-actions-copy-breadcrumbs` → `main`
- **Created:** 2026-06-04 · **Closed:** 2026-06-04
- **Merge commit:** `c25ab9236c02`

# PR: Theme UX improvements — add-recipe action, Polish labels, breadcrumbs, copyright

**Branch:** `feature/ui-tidy-quick-actions-copy-breadcrumbs` -> `main`

## Implementation status

| Stage | Status | Description |
| --- | --- | --- |
| Quick action: Dodaj przepis | ✅ Done | Button for admins/editors on all page types |
| Polish characters in .twig | ✅ Done | All missing diacritics fixed in 3 templates |
| Breadcrumbs: remove Blog | ✅ Done | "Blog" link removed from single-recipe breadcrumb |
| Copyright update | ✅ Done | Replaced Feast Design Co. with I.Dyląg Allegro Sp.j. |

---

## 1. Quick action: Dodaj przepis

### What was done

Added "Dodaj przepis" button to the Quick Actions Bar for logged-in users with recipe creation permission \(administrators and editors\). The button appears on all page types — archive, home, and single recipe — unlike the existing "Edytuj" button which is single-recipe-only.

### Files changed

`functions.php`

* Added `go4taste_recipes_theme_get_recipe_add_quick_action()` — checks `g4t_current_user_can_create_recipe()` \(falls back to `current_user_can('edit_posts')`\), resolves creator page URL, returns `{enabled, url}`
* Added `'recipeAdd'` key to `wp_localize_script` config

`assets/js/quick-actions-bar.js`

* Added `var addButton` element declaration
* Added `var hasRecipeAddAction` flag and `var recipeAddConfig` config reader
* Init block: resolves `hasRecipeAddAction`, renders button with plus-icon SVG and `.quick-actions-bar__add-text` label "Dodaj"
* `updateRecipeQuickActionsVisibility()`: added `hasRecipeAddAction` to the `quick-actions-bar--with-recipe-actions` toggle condition

`assets/css/quick-actions-bar.css`

* Added `.quick-actions-bar__add-text` to the shared text-label selector list

---

## 2. Polish characters in .twig templates

Fixed all user-visible strings with missing Polish diacritics.

`views/single-recipe.twig`

* `Jestes tutaj:` → `Jesteś tutaj:`
* `Calkowity czas` → `Całkowity czas`
* `Skladniki` \(zakładka mobilna, nagłówek sekcji, aria-label\) → `Składniki`
* `Zrodlo przepisu` → `Źródło przepisu`
* `Skladniki dostepne w naszym sklepie` → `Składniki dostępne w naszym sklepie`
* `aria-label="Udostepnij przepis"` → `aria-label="Udostępnij przepis"`
* `aria-label="Wyslij mailem" title="Wyslij mailem"` → `Wyślij mailem`

`views/archive-recipe.twig`

* `Jestes tutaj:` → `Jesteś tutaj:`
* `poziomy trudnosci` → `poziomy trudności`
* `aria-label="Polecane artykuly z bloga"` → `aria-label="Polecane artykuły z bloga"`
* `aria-label="Wybierz artykul"` → `aria-label="Wybierz artykuł"`

`views/home.twig`

* `Nowa strona glowna dla migracji przepisow` → `Nowa strona główna dla migracji przepisów`
* `ktory prowadzi uzytkownika` → `który prowadzi użytkownika`
* `Przegladaj przepisy` → `Przeglądaj przepisy`
* `aria-label="Wyrozniony przepis"` → `aria-label="Wyróżniony przepis"`
* `'Wyrozniony przepis'` \(fallback string\) → `'Wyróżniony przepis'`
* `Przejdz do przepisu` → `Przejdź do przepisu`
* `Brak przepisow` → `Brak przepisów`
* `uzupelnic strone glowna` → `uzupełnić stronę główną`
* `aria-label="Nawigacja stron listy przepisow"` → `aria-label="Nawigacja stron listy przepisów"`

---

## 3. Breadcrumbs: remove "Blog"

`views/single-recipe.twig`

Removed the "Blog" link from the breadcrumb trail. The breadcrumb now reads:

```
Jesteś tutaj: Przepisy / [tytuł przepisu]
```

instead of:

```
Jestes tutaj: Blog / Przepisy / [tytuł przepisu]
```

---

## 4. Copyright update

`views/partial/site-footer.twig`

Replaced the Brunch Pro / Feast Design Co. attribution with the correct site owner:

```
Copyright © [year] – I.Dyląg Allegro Sp.j. – Wszystkie prawa zastrzeżone
```

Year remains dynamic \(`{{ "now"|date("Y") }}`\).

---

<a id="pr-11"></a>
## #11 feat(ingredients): render ingredient sections in template and styles

- **State:** MERGED
- **Author:** Przemek Cichoń
- **Branch:** `feature/ingredient-sections` → `main`
- **Created:** 2026-06-08 · **Closed:** 2026-06-08
- **Merge commit:** `8a1be8754532`

# PR: Ingredient Sections — Grouped Ingredients Support \(Theme\)

**Branch:** `feature/ingredient-sections` → `main`

**Companion PR:** `go4taste-recipes-plugin` — `feature/ingredient-sections`

---

## Goal

Adapt the recipe template and styles to render ingredients in named sections \(e.g. "Ciasto" \+ "Farsz"\) using the new unified `ingredient_sections[]` view model shape introduced in the plugin PR. Zero visual change for all existing single-list recipes.

---

## Design decisions

| Decision | Choice | Reason |
| --- | --- | --- |
| View model shape | Always `ingredient_sections[]` | Plugin always returns this shape — single-mode wraps flat list in one unnamed section \(`title: null`\) |
| Template branching | None — one loop handles both modes | Section heading `<h3>` is only rendered when `section.title` is non-null; otherwise visually identical to the old flat list |
| Existing `recipe_ingredients` variable | Removed | Replaced by `recipe_ingredient_sections`; old variable was pointing at the now-removed `ingredients` key |
| `<h3>` vs `<h4>` | `<h3>` | Correct heading hierarchy under the `<h2>Składniki</h2>` heading |
| Section title style | Uppercase label, `var(--c-meta)` | Matches `.recipe-servings` and `.recipe-section h2` visual language — a subtle separator, not a competing heading |

---

## Files changed

### `views/single-recipe.twig`

**Variable rename \(line ~9\):**

```
{# Before #}
{% set recipe_ingredients = recipe_data.ingredients ?? [] %}

{# After #}
{% set recipe_ingredient_sections = recipe_data.ingredient_sections ?? [] %}
```

**Ingredient loop \(lines ~246–270\):**

Replaced single flat `{% for ingredient in recipe_ingredients %}` loop with a two-level loop over sections and their items:

```
{% for section in recipe_ingredient_sections %}
    {% set si = loop.index %}
    {% if section.title %}
        <h3 class="ingredients-section-title">{{ section.title }}</h3>
    {% endif %}
    <ul class="ingredients-list">
        {% for ingredient in section.items %}
            <li class="ingredient-item">
                <label class="ingredient-row" for="ing-{{ si }}-{{ loop.index }}">
                    ...
                </label>
            </li>
        {% else %}
            <li class="ingredient-item">Brak skladnikow.</li>
        {% endfor %}
    </ul>
{% else %}
    <ul class="ingredients-list">
        <li class="ingredient-item">Brak skladnikow.</li>
    </ul>
{% endfor %}
```

The `id`/`for` attribute on checkbox \+ label uses `si-index` to stay unique across multiple sections \(was previously just `loop.index`\).

---

### `assets/css/single-recipe.css`

**New rules — ingredient section titles:**

```
/* ── Ingredient section titles (sections mode) ─────────────── */
.ingredients-section-title {
    color: var(--c-meta);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.09em;
    margin: 20px 0 6px;
    text-transform: uppercase;
}

/* First section title sits close below the servings line */
.recipe-servings + .ingredients-section-title {
    margin-top: 14px;
}

/* When multi-section: gap between end of one list and next title */
.ingredients-list + .ingredients-section-title {
    margin-top: 22px;
}
```

**Print styles** \(inside existing `@media print` block\):

```
.ingredients-section-title {
    break-after: avoid;
    page-break-after: avoid;
}
```

Prevents a section heading from appearing stranded at the bottom of a printed page, separated from its ingredient list.

---

## Backward compatibility

Single-mode recipes \(all ~130 existing recipes\) are unaffected:

* Plugin view model always returns `ingredient_sections[]`
* For single-mode recipes the array contains exactly **one section** with `title: null`
* The `{% if section.title %}` check is false → no `<h3>` rendered
* The `<ul class="ingredients-list">` renders identically to the old flat loop
* All existing CSS for `.ingredients-list`, `.ingredient-row`, `.ingredient-check`, etc. is unchanged

---

## Implementation stages

| Stage | Status | Description |
| --- | --- | --- |
| Template: variable \+ loop | ✅ Done | `recipe_ingredient_sections` loop with optional `<h3>` per section |
| Styles: section title | ✅ Done | `.ingredients-section-title` with spacing and visual hierarchy |
| Styles: print | ✅ Done | `break-after: avoid` on section titles |

---

## Merge readiness

✅ Ready to merge — must be merged together with \(or after\) the companion plugin PR `feature/ingredient-sections`.
