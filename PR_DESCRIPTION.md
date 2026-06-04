# PR: Theme UX improvements — add-recipe action, Polish labels, breadcrumbs, copyright

**Branch:** `feature/ui-tidy-quick-actions-copy-breadcrumbs` -> `main`

## Implementation status

| Stage | Status | Description |
|---|---|---|
| Quick action: Dodaj przepis | ✅ Done | Button for admins/editors on all page types |
| Polish characters in .twig | ✅ Done | All missing diacritics fixed in 3 templates |
| Breadcrumbs: remove Blog | ✅ Done | "Blog" link removed from single-recipe breadcrumb |
| Copyright update | ✅ Done | Replaced Feast Design Co. with I.Dyląg Allegro Sp.j. |

---

## 1. Quick action: Dodaj przepis

### What was done

Added "Dodaj przepis" button to the Quick Actions Bar for logged-in users with recipe creation permission (administrators and editors). The button appears on all page types — archive, home, and single recipe — unlike the existing "Edytuj" button which is single-recipe-only.

### Files changed

**`functions.php`**
- Added `go4taste_recipes_theme_get_recipe_add_quick_action()` — checks `g4t_current_user_can_create_recipe()` (falls back to `current_user_can('edit_posts')`), resolves creator page URL, returns `{enabled, url}`
- Added `'recipeAdd'` key to `wp_localize_script` config

**`assets/js/quick-actions-bar.js`**
- Added `var addButton` element declaration
- Added `var hasRecipeAddAction` flag and `var recipeAddConfig` config reader
- Init block: resolves `hasRecipeAddAction`, renders button with plus-icon SVG and `.quick-actions-bar__add-text` label "Dodaj"
- `updateRecipeQuickActionsVisibility()`: added `hasRecipeAddAction` to the `quick-actions-bar--with-recipe-actions` toggle condition

**`assets/css/quick-actions-bar.css`**
- Added `.quick-actions-bar__add-text` to the shared text-label selector list

---

## 2. Polish characters in .twig templates

Fixed all user-visible strings with missing Polish diacritics.

**`views/single-recipe.twig`**
- `Jestes tutaj:` → `Jesteś tutaj:`
- `Calkowity czas` → `Całkowity czas`
- `Skladniki` (zakładka mobilna, nagłówek sekcji, aria-label) → `Składniki`
- `Zrodlo przepisu` → `Źródło przepisu`
- `Skladniki dostepne w naszym sklepie` → `Składniki dostępne w naszym sklepie`
- `aria-label="Udostepnij przepis"` → `aria-label="Udostępnij przepis"`
- `aria-label="Wyslij mailem" title="Wyslij mailem"` → `Wyślij mailem`

**`views/archive-recipe.twig`**
- `Jestes tutaj:` → `Jesteś tutaj:`
- `poziomy trudnosci` → `poziomy trudności`
- `aria-label="Polecane artykuly z bloga"` → `aria-label="Polecane artykuły z bloga"`
- `aria-label="Wybierz artykul"` → `aria-label="Wybierz artykuł"`

**`views/home.twig`**
- `Nowa strona glowna dla migracji przepisow` → `Nowa strona główna dla migracji przepisów`
- `ktory prowadzi uzytkownika` → `który prowadzi użytkownika`
- `Przegladaj przepisy` → `Przeglądaj przepisy`
- `aria-label="Wyrozniony przepis"` → `aria-label="Wyróżniony przepis"`
- `'Wyrozniony przepis'` (fallback string) → `'Wyróżniony przepis'`
- `Przejdz do przepisu` → `Przejdź do przepisu`
- `Brak przepisow` → `Brak przepisów`
- `uzupelnic strone glowna` → `uzupełnić stronę główną`
- `aria-label="Nawigacja stron listy przepisow"` → `aria-label="Nawigacja stron listy przepisów"`

---

## 3. Breadcrumbs: remove "Blog"

**`views/single-recipe.twig`**

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

**`views/partial/site-footer.twig`**

Replaced the Brunch Pro / Feast Design Co. attribution with the correct site owner:

```
Copyright © [year] – I.Dyląg Allegro Sp.j. – Wszystkie prawa zastrzeżone
```

Year remains dynamic (`{{ "now"|date("Y") }}`).
