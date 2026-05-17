# PR: Theme override template dla ads strip i line-clamp tytulow produktow

**Branch:** `feature/ads-strip-template` -> `main`

## Motywacja

Frontend strony przepisu pokazywal sekcje reklamowa z dummy produktami (hardcodowane dane testowe) zamiast realnych produktow wybranych w edytorze. Szablon `single-recipe.twig` zawieral stala liste fallbackowych produktow wyswietlanych zawsze gdy `recipe.ads.products` bylo puste. Brakowalo tez theme override template wymaganego przez render callback pluginu `go4taste-ads`.

## Zakres zmian

### `go4taste-ads/inline-banner.php` (nowy plik)
- Theme override template dla bloku `go4taste-ads/inline-banner`.
- Wykrywany automatycznie przez render callback pluginu (sciezka `{theme}/go4taste-ads/inline-banner.php`).
- Renderuje sekcje `g4t-ads-strip` z kartami produktow, nawigacja slidera i oznaczeniem autopromocji.
- Pobiera dane produktow przez `Go4Taste_Ads::get_instance()->fetch_product_data()`.
- Markup zgodny z istniejacymi klasami CSS i atrybutami `data-g4t-ads-*` obsługiwanymi przez `go4taste-ads-slider-only.js`.

### `views/single-recipe.twig`
- Usunieto hardcodowana tablice `fallback_ads_products` z 4 dummy produktami.
- Sekcja `g4t-ads-strip` renderowana warunkowo (`{% if recipe_ads_products|length %}`).
- Przy braku danych sekcja reklam nie pojawia sie w ogole.

### `assets/css/single-recipe-go4taste-ads.css`
- Dodano `display: -webkit-box`, `-webkit-line-clamp: 2`, `overflow: hidden` do `.g4t-ads-strip .g4t-product-card__title`.
- Tytuly produktow dluzsze niz dwie linie sa obcinane wielokropkiem.

## Weryfikacja

- Strona przepisu z przypisanym blokiem ads wyswietla realne produkty ze sklepu.
- Strona przepisu bez bloku ads lub bez wybranych produktow nie wyswietla sekcji reklamowej.
- Tytuly produktow nie przekraczaja 2 linii w karcie produktu.
- Slider nawigacja (przyciski <- ->) dziala poprawnie przy >1 produkcie.

## Zaleznosci

- Wymaga pluginu `go4taste-ads` z render callback (branch `feature/theme-banner-templates`).
- Wymaga pluginu `go4taste-recipes-plugin` z poprawka sync atrybutow ads (branch `feature/ads-block-sync-and-product-ids`).
