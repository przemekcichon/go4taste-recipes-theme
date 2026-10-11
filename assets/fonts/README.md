# Fonts

Self-hosted subsets of the fonts the theme used to load from Google Fonts. `@font-face` rules live in `assets/css/fonts.css`.

| file | source (github.com/google/fonts, `main`) | version |
|---|---|---|
| `open-sans-latin.woff2` | `ofl/opensans/OpenSans[wdth,wght].ttf`, instanced `wdth=100`, `wght=400:700` (variable) | 3.003 |
| `fira-sans-condensed-400-latin.woff2` | `ofl/firasanscondensed/FiraSansCondensed-Regular.ttf` | 4.203 |
| `fira-sans-condensed-600-latin.woff2` | `ofl/firasanscondensed/FiraSansCondensed-SemiBold.ttf` | 4.203 |
| `fira-sans-condensed-700-latin.woff2` | `ofl/firasanscondensed/FiraSansCondensed-Bold.ttf` | 4.203 |

License: SIL Open Font License 1.1, no Reserved Font Name (`OFL-*.txt`).

Rebuild with fontTools (`pip install fonttools brotli`):

```sh
fonttools varLib.instancer "OpenSans[wdth,wght].ttf" wdth=100 wght=400:700 -o OpenSans-wght.ttf

U="U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD,U+0100-017F"

pyftsubset OpenSans-wght.ttf --unicodes="$U,U+2190-2192" --layout-features='*' --flavor=woff2 --output-file=open-sans-latin.woff2
pyftsubset FiraSansCondensed-Regular.ttf --unicodes="$U" --layout-features='*' --flavor=woff2 --output-file=fira-sans-condensed-400-latin.woff2
# same for SemiBold (600) and Bold (700)
```

The range is Google Fonts' "latin" subset plus Latin Extended-A (Polish letters), so the browser loads one file per face. Open Sans also covers the arrows ← → used in the UI.

If you change a font file, recompute the fallback metrics (`size-adjust`, `ascent-override`, `descent-override`) in `assets/css/fonts.css`.
