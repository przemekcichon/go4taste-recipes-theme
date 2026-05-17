# Fix archive hero description key after plugin taxonomy update

## Summary

This PR aligns the archive hero template with the plugin change that moved taxonomy hero description from `short_description` (ACF term meta) to `description` (native term description source in plugin context).

Without this update, archive hero lead text may fall back incorrectly because the theme reads the old key.

## Motivation

- Plugin context now exposes `recipe_archive.hero.description`.
- Theme template was still reading `recipe_archive.hero.short_description`.
- Result: mismatch between plugin data contract and theme rendering.

## Changes

### Template mapping update

File: `views/archive-recipe.twig`

- Updated one line:
  - from: `hero.short_description`
  - to: `hero.description`

```twig
{% set hero_description = hero.description|default(archive_description) %}
```

## Validation

### Functional check

1. Open taxonomy archive page (e.g. `/typ-dania/przystawka`).
2. Ensure term has native taxonomy description in wp-admin.
3. Confirm hero lead renders the expected description text.

### Scope check

- Only one template file changed.
- No CSS, JS, or PHP logic changes.

## Backward compatibility

- Safe with current plugin contract.
- If plugin context provides `hero.description`, template renders correctly.
- Fallback remains: `archive_description`.

## Risks

- Minimal. Pure key mapping update in Twig template.

## Rollback

If needed, revert commit:

- `42ad4e8`

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
