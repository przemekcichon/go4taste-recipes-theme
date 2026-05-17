# Quick Actions Filters, Listing Integration, and Home Hero Chips

## Summary

This PR upgrades the recipes theme filtering UX for archive/home listings by wiring Quick Actions to server-side filtering and adding active filter chips in hero sections.

## Motivation

The previous filtering behavior was inconsistent across listing contexts and did not provide reliable pre-submit result feedback. This change standardizes filter handling with URL-driven taxonomy constraints and a dedicated count endpoint.

## Changes

### 1. Theme filtering backend and endpoint

File: `functions.php`

- Added request/listing helpers and URL value normalization.
- Added taxonomy-based filter query builder.
- Added REST endpoint:
  - `POST /wp-json/go4taste-recipes/v1/filter-count`
- Added listing query filtering via:
  - `pre_get_posts` for listing requests
  - `go4taste/recipes/home_query_args` for home query args
- Added dynamic quick-actions options payload based on taxonomy terms.
- Added cache-busting version for `quick-actions-bar.js` based on `filemtime()`.

### 2. Quick Actions panel refactor for Facet-style flow

File: `assets/js/quick-actions-bar.js`

- Replaced static option lists with localized dynamic options.
- Added URL state parsing and normalized facet param handling (`g4t_*`).
- Added active filter counting and label updates (`Filtr (N)`).
- Added apply/reset behaviors based on URL redirects.
- Added live result count state with endpoint integration:
  - `Pokaż wyniki (N)`
  - `Brak wyników` when count is zero
- Added support for listing shell data attributes to keep behavior aligned with page context.

### 3. Home query context enrichment

File: `index.php`

- Added call to `go4taste/recipes/context/home` filter after home posts query.

### 4. Archive template integration

File: `views/archive-recipe.twig`

- Added listing shell data attributes for filter integration.
- Added `facetwp-template` class on recipe grid.
- Added filtered vs total count display in hero stats and archive count.
- Added rendering of active filter tags next to current taxonomy tag.

### 5. Home template integration

File: `views/home.twig`

- Added listing shell data attributes for filter integration.
- Added `facetwp-template` class on home recipe grid.
- Added active filter chips section in home hero (`recipe_home.active_filter_tags`).

## Validation

- Manual verification on local:
  - Home without filters: no chips, full results.
  - Home with filters: chips visible, filtered results and correct filter badge count.
  - Multi-filter URL: multiple chips rendered.
  - Zero-result state: submit button shows `Brak wyników`.
- Confirmed clear action resets query params and keeps current path.

## Backward Compatibility

- No destructive template removals.
- Existing listing markup remains compatible with progressive enhancements.
- New behavior is additive and URL-driven.

## Risks

- Low-to-medium risk due to larger JS refactor surface.
- Mitigated by server-side filtering fallback and context-scoped initialization.

## Rollback

Revert commit:

- `7c1420e`
