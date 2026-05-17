# Update archive recipe cards styling and disable ads temporarily

## Summary

This PR updates the archive recipes listing to match the current `home.twig` design system:
- Adds rounded corners to recipe cards (10px border-radius)
- Temporarily disables the in-grid ads promo block
- Cleans up recipe card meta styling for consistency

## Motivation

The archive recipe cards should align visually with the homepage recipe grid. The current implementation lacks rounded corners and has visual clutter in the meta section. Ads module needs reorganization before re-enabling on archives.

## Changes

### 1. Twig: Disable ads block

File: `views/archive-recipe.twig` (lines ~165–209)

- Wrapped the `{% if loop.index == 3 %}` ads insertion block in comments
- Will be re-enabled in a separate phase after ads strategy finalization
- Recipe grid now displays only recipe cards, no promotional content

### 2. CSS: Add card border-radius

File: `assets/css/archive-recipes.css`

**`.recipe-teaser-card`**:
- Added `border-radius: 10px` (matches `home.recipe-card`)
- Added `overflow: hidden` to ensure image corners respect border-radius

**`.recipe-teaser-card__body`**:
- Changed `padding: 14px` → `padding: 12px` (consistency with home.twig)

**`.recipe-teaser-card__meta`**:
- Removed `border-top: 1px solid var(--c-border)` (cleaner layout)
- Removed `padding-top: 10px` (margin collapse with border removal)
- Simplified spacing — meta now blends seamlessly with card footer

## Validation

### Visual check

1. Open taxonomy archive page (e.g., `/typ-dania/przystawka`).
2. Verify:
   - ✅ Recipe cards have rounded corners (10px on all 4 sides)
   - ✅ No ads block rendered (grid contains only recipe cards)
   - ✅ Meta line at bottom has no horizontal separator
   - ✅ Padding inside card body feels balanced (12px)

### Responsive check

- Desktop (3 columns): All cards rounded
- Tablet (2 columns): Cards still use border-radius correctly
- Mobile (1 column): Cards responsive, corners visible

### Browser check

- Chrome, Firefox, Safari — border-radius support universal
- No fallback needed

## Backward compatibility

- Safe change: only CSS styling and template comment.
- Recipe card markup unchanged (just styling updates).
- Meta still functional, visual only.
- Ads block commented, not deleted — easily restored.

## Risks

- **Low**: Pure styling update + temporary feature disable.
- No data loss, no logic changes.
- Ads removal is temporary and documented in Twig comment.

## Future work

- Re-integrate ads with finalized placement strategy in separate PR
- Consider `loop.index` threshold adjustment if needed (currently 3)
- Align ads visual treatment with updated card styling

## Related issues

- Aligns archive UX with home.twig reference design
- Cleans up temporary ads infrastructure for later refactor

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
