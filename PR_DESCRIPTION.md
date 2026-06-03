# PR: Theme recipe UX polish - archive hero sanitize, edit shortcut, step rendering fallback

**Branch:** `feature/archive-hero-description-sanitize` -> `main`

## Motywacja

Theme potrzebowal kilku porzadkowych poprawek w widokach przepisu:

- opis hero na archiwum i stronie glownej mial byc wyswietlany bez niespójnych surowych wartosci,
- single recipe mial lepiej obslugiwac rozne ksztalty danych krokow,
- pasek quick actions mial dostac bezposredni link do edycji aktualnego przepisu,
- override template dla ads strip mial pobierac realne dane produktow z pluginu, a nie polegac na starym hardcodowanym flow.

## Zakres zmian

### `functions.php`
- Dodano helper do wyszukiwania strony kreatora przepisu po template slug `g4t-recipe-creator`.
- Dodano generator konfiguracji quick actions dla widoku pojedynczego przepisu.
- Do `go4tasteQuickActionsConfig` przekazywany jest nowy blok `recipeEdit` z URL-em do edycji wpisu.
- Dodano guard dla rejestracji facetow FacetWP: jesli stale taksonomii recipe nie sa jeszcze zdefiniowane, funkcja zwraca istniejace facety bez modyfikacji (bez warningow/fatal przy wczesnym ladowaniu hooka).

### `assets/js/quick-actions-bar.js`
- Dodano przycisk/link `Edytuj` na single recipe pages, gdy uzytkownik moze edytowac dany przepis.
- Pasek quick actions utrzymuje poprawny stan widocznosci, gdy istnieje akcja edycji.

### `assets/css/quick-actions-bar.css`
- Dodano styl dla etykiety przycisku edycji (`.quick-actions-bar__edit-text`).

### `go4taste-ads/inline-banner.php`
- Theme override template dla bloku `go4taste-ads/inline-banner` pobiera teraz dane produktow przez filtr `go4taste_ads_get_product_data`.
- Dodano fallback do `g4t_core_fetch_product_data()` dla srodowisk, w ktorych provider filtrow moze byc jeszcze niedostepny.
- Markup nadal pozostaje zgodny z klasami i atrybutami slidera ads.

### `views/archive-recipe.twig`
- Zastapiono surowe wyswietlanie `recipe_difficulty` znormalizowanymi etykietami:
	- `Easy / Latwy / Łatwy` -> `Łatwy`
	- `Medium / Sredni / Średni` -> `Średni`
	- `Hard / Trudny` -> `Trudny`

### `views/home.twig`
- Analogiczna normalizacja poziomu trudnosci jak w archiwum przepisow.
- Karty na home pokazują teraz spójne, lokalizowane etykiety zamiast surowych wartości z meta.

### `views/single-recipe.twig`
- Poziom trudnosci w hero jest normalizowany do tych samych etykiet co na archive/home.
- Logika krokow zostala uodporniona na kilka ksztaltow danych:
	- `title` lub `heading` jako tytul kroku,
	- `description` jako tekst wielolinijkowy,
	- `tip` jako opcjonalna wskazowka,
	- `images` albo `imageUrl` jako media kroku.
- Alt dla obrazow krokow korzysta z wyliczonego tytulu kroku, gdy jest dostepny.

## Weryfikacja

- Single recipe pokazuje poprawnie przycisk `Edytuj`, gdy uzytkownik ma uprawnienia.
- Widoki archive i home wyswietlaja spójne etykiety poziomu trudnosci zamiast surowych slugow/wartosci.
- Single recipe poprawnie renderuje kroki niezaleznie od tego, czy backend wysyla `title`, `heading`, `description`, `images` czy `imageUrl`.
- Theme override ads strip pobiera dane przez filtr i zachowuje fallback, jesli provider nie jest dostepny.
- Rejestracja facetow FacetWP nie powoduje bledow na requestach, w ktorych stale taksonomii recipes nie sa jeszcze dostepne.

## Zaleznosci

- Wymaga pluginu `go4taste-ads` z render callback i filtrem `go4taste_ads_get_product_data`.
- Wymaga pluginu `go4taste-recipes-plugin` z dostepna strona kreatora `g4t-recipe-creator` oraz funkcjami kontroli uprawnien do edycji przepisu.
