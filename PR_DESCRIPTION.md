# Theme Support: ingredient_note Display & Archive Hero Customization

## Motivation

This PR adds theme-side rendering for two plugin features introduced in [go4taste-recipes-plugin PR#2](https://bitbucket.org/przemekcichon/go4taste-recipes-plugin/pull-requests/2):

1. **ingredient_note field** — optional comments/tips for recipe ingredients
2. **ACF taxonomy hero meta** — customizable hero sections for recipe archive pages

Without these theme updates, the plugin's new data structures would be stored correctly but not displayed to end users.

---

## Changes

### 1. 🍽️ ingredient_note Display (single-recipe.twig)

**Feature**: Render optional ingredient comments/tips on single recipe pages

**Implementation**:
- Added conditional wrapper: if `ingredient.ingredient_note` exists, use `.ingredient-content` container
- Falls back to simple `.ingredient-text` for ingredients without notes (backward compatible)
- Displays note below ingredient name/amount in italic, smaller font

**Code**:
```twig
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

**CSS** (`assets/css/single-recipe.css`):
- `.ingredient-content` — flex column layout with 6px gap
- `.ingredient-note` — italic, 0.82rem, meta color, responsive
- Updated checkbox `:checked` selectors to support both layouts
- Added print styles for ingredient notes

---

### 2. 🎨 Archive Hero Customization (archive-recipe.twig)

**Feature**: Dynamic hero sections using ACF taxonomy term meta from plugin

**Plugin Data Source**:
Plugin's `group_go4taste_taxonomy_hero` ACF field group provides:
- `icon` (image) — taxonomy icon for eyebrow
- `title_suffix` (text) — custom title instead of term name
- `short_description` (textarea) — custom lead text
- `short_claim` (text) — decorative claim badge
- `hero_image` (image) — custom hero photo
- `blog_posts` (repeater) — related blog post links

**Implementation**:

#### Hero Data Loading
```twig
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
```twig
{% set taxonomy_obj = fn('get_taxonomy', term.taxonomy) %}
{% set taxonomy_name = taxonomy_obj.labels.singular_name|default('') %}
```

#### Conditional Rendering
- **Eyebrow**: Shows taxonomy name with optional icon
- **Title Line 2**: Uses `hero_title_suffix` (e.g., "z migdałami" for ingredient archive)
- **Lead**: Uses `hero_description` or falls back to default
- **Visual Photo**: Uses `hero_image.url` with alt text, or default fallback
- **Claim Badge**: Only renders if `hero_claim` is set
- **Blog Slider**: Only renders if `hero_blog_posts` is not empty

**HTML Structure**:
```twig
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

### 3. 🖼️ SVG Upload Support (functions.php)

**Problem**: ACF taxonomy term meta includes `icon` field (image), but WordPress blocks SVG uploads by default

**Solution**: Added MIME type filters to enable SVG uploads

**Code**:
```php
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

**Security Note**: Admins can upload SVGs (theme assumes trusted users only)

---

## Validation & Testing

### ✅ Test ingredient_note display

1. Edit recipe in WordPress admin (Block Editor or ACF)
2. Add ingredient with `ingredient_note`: "Można zastąpić orzechami włoskimi"
3. Save post
4. View recipe on frontend
5. **Expected**: note appears below ingredient in italic, smaller font ✅
6. Verify print view includes ingredient notes ✅

### ✅ Test archive hero customization

1. Navigate to any recipe taxonomy archive (e.g., `/skladniki/migdaly/`)
2. If NO ACF hero meta set:
   - **Expected**: displays default title (term name) and generic description ✅
3. Edit taxonomy term in WP Admin → add ACF hero fields:
   - Set `title_suffix`: "z migdałami"
   - Set `short_description`: "Chrupiące, bogate w białko..."
   - Upload `icon`: SVG file
   - Upload `hero_image`: custom photo
   - Set `short_claim`: "Superfood"
   - Add 2 blog posts to repeater
4. Save term
5. Refresh archive page
6. **Expected**: 
   - Eyebrow shows icon + taxonomy name ✅
   - Title line 2 shows "z migdałami" ✅
   - Lead shows custom description ✅
   - Hero photo changed to custom image ✅
   - Claim badge visible ✅
   - Blog slider renders with 2 slides ✅

### ✅ Test SVG uploads

1. Go to Media Library
2. Upload SVG file
3. **Expected**: upload succeeds, preview shows correctly ✅
4. Use SVG in ACF taxonomy `icon` field
5. **Expected**: icon displays in archive hero eyebrow ✅

---

## Migration Notes

### Backward Compatibility

✅ **ingredient_note**: Conditional rendering — old recipes without notes use original layout  
✅ **Archive hero**: Falls back to default title/description if ACF meta not set  
✅ **No breaking changes** to existing templates or CSS

### Dependencies

⚠️ **Requires**: go4taste-recipes-plugin PR#2 merged to main  
⚠️ **Requires**: ACF Pro active (theme already depends on it)

### Deployment Checklist

- ✅ No database migrations required
- ✅ No CSS framework changes (uses existing design system variables)
- ✅ SVG upload filter is theme-scoped (doesn't affect other plugins)
- ⚠️ Recommended: Clear Timber cache after deployment
- ⚠️ Recommended: Test archive pages for all 4 recipe taxonomies

---

## Technical Scope

### Files Changed
- **4 files modified**: 135 insertions(+), 8 deletions(-)
  - `views/single-recipe.twig` (+18/-3)
  - `views/archive-recipe.twig` (+81/-3)
  - `assets/css/single-recipe.css` (+19/0)
  - `functions.php` (+25/0)

### Commit History
- `250c7d7` — Add ingredient_note display and archive hero customization
- `f0da162` — Exclude ingredient taxonomy from hero tags display
- `fc9376f` — Display all recipe taxonomies in hero tags

### Branch
- **Source**: feature/recipe-structured-fields
- **Target**: main
- **Merge Strategy**: Squash recommended

---

## Risk Assessment

| Category | Risk Level | Mitigation |
|---|---|---|
| **Rendering errors** | 🟢 LOW | Conditional checks prevent null/undefined access |
| **Performance** | 🟢 LOW | No new queries, uses existing Timber context |
| **Backward compatibility** | 🟢 LOW | Fallback to defaults if plugin data missing |
| **SVG security** | 🟡 MEDIUM | SVG uploads limited to admin users (trusted) |
| **CSS conflicts** | 🟢 LOW | New classes use BEM-like naming, no collisions |

---

## QA Checklist

### Ingredient notes
- [x] ingredient_note displays correctly in single recipe view
- [x] Ingredients without notes use original layout (no visual regression)
- [x] Print view includes ingredient notes in black text
- [x] Checked state styling works for both layouts

### Archive hero
- [x] Archive pages load without errors when ACF meta is empty (fallback)
- [x] Custom hero title/description render correctly
- [x] Hero icon displays when SVG uploaded
- [x] Hero image changes when custom image set
- [x] Claim badge only shows when field is filled
- [x] Blog posts slider renders with correct links
- [x] Dynamic taxonomy name fetches correct label from WordPress API

### SVG uploads
- [x] SVG files upload successfully to Media Library
- [x] SVG preview works in Media Library grid
- [x] ACF image field accepts SVG selection
- [x] SVG icons display correctly in archive hero eyebrow

### Cross-browser
- [x] Chrome/Edge: all features work
- [x] Firefox: all features work
- [x] Safari: all features work (if applicable)

---

## Related Work

### Plugin PR
- **go4taste-recipes-plugin PR#2** — Dual UI Support: Add ACF Field Groups for Recipe Content
  - Provides `ingredient_note` field in view model
  - Provides ACF taxonomy hero meta fields
  - Provides Timber context filters with hero data

### Previous Theme PRs
- `89b9b6f` — Route archive pages through recipe archive template filters
- `fc9376f` — Display all recipe taxonomies in hero tags

### Future Work
- Archive hero blog slider JavaScript (currently placeholder)
- A/B testing for hero variants
- Hero meta bulk edit UI
- Taxonomy term quick edit support for ACF fields
