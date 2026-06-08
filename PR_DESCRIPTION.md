# PR: Ingredient Sections — Grouped Ingredients Support (Theme)

**Branch:** `feature/ingredient-sections` → `main`

**Companion PR:** `go4taste-recipes-plugin` — `feature/ingredient-sections`

---

## Goal

Adapt the recipe template and styles to render ingredients in named sections (e.g. "Ciasto" + "Farsz") using the new unified `ingredient_sections[]` view model shape introduced in the plugin PR. Zero visual change for all existing single-list recipes.

---

## Design decisions

| Decision | Choice | Reason |
|---|---|---|
| View model shape | Always `ingredient_sections[]` | Plugin always returns this shape — single-mode wraps flat list in one unnamed section (`title: null`) |
| Template branching | None — one loop handles both modes | Section heading `<h3>` is only rendered when `section.title` is non-null; otherwise visually identical to the old flat list |
| Existing `recipe_ingredients` variable | Removed | Replaced by `recipe_ingredient_sections`; old variable was pointing at the now-removed `ingredients` key |
| `<h3>` vs `<h4>` | `<h3>` | Correct heading hierarchy under the `<h2>Składniki</h2>` heading |
| Section title style | Uppercase label, `var(--c-meta)` | Matches `.recipe-servings` and `.recipe-section h2` visual language — a subtle separator, not a competing heading |

---

## Files changed

### `views/single-recipe.twig`

**Variable rename (line ~9):**
```twig
{# Before #}
{% set recipe_ingredients = recipe_data.ingredients ?? [] %}

{# After #}
{% set recipe_ingredient_sections = recipe_data.ingredient_sections ?? [] %}
```

**Ingredient loop (lines ~246–270):**

Replaced single flat `{% for ingredient in recipe_ingredients %}` loop with a two-level loop over sections and their items:

```twig
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

The `id`/`for` attribute on checkbox + label uses `si-index` to stay unique across multiple sections (was previously just `loop.index`).

---

### `assets/css/single-recipe.css`

**New rules — ingredient section titles:**

```css
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

**Print styles** (inside existing `@media print` block):

```css
.ingredients-section-title {
    break-after: avoid;
    page-break-after: avoid;
}
```

Prevents a section heading from appearing stranded at the bottom of a printed page, separated from its ingredient list.

---

## Backward compatibility

Single-mode recipes (all ~130 existing recipes) are unaffected:

- Plugin view model always returns `ingredient_sections[]`
- For single-mode recipes the array contains exactly **one section** with `title: null`
- The `{% if section.title %}` check is false → no `<h3>` rendered
- The `<ul class="ingredients-list">` renders identically to the old flat loop
- All existing CSS for `.ingredients-list`, `.ingredient-row`, `.ingredient-check`, etc. is unchanged

---

## Implementation stages

| Stage | Status | Description |
|---|---|---|
| Template: variable + loop | ✅ Done | `recipe_ingredient_sections` loop with optional `<h3>` per section |
| Styles: section title | ✅ Done | `.ingredients-section-title` with spacing and visual hierarchy |
| Styles: print | ✅ Done | `break-after: avoid` on section titles |

---

## Merge readiness

✅ Ready to merge — must be merged together with (or after) the companion plugin PR `feature/ingredient-sections`.
