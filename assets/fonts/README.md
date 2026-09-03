# Self-hosted fonts — production cutover note

Brand Brief Studio currently uses **Manrope** and **Unbounded** through Google Fonts. The migration removes that runtime dependency before the Russian production cutover.

## License status

Both families are distributed by Google Fonts under the **SIL Open Font License 1.1 (OFL-1.1)**, which permits use, embedding and redistribution subject to the license conditions.

Verified upstream license records:

- Manrope: https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt
- Unbounded: https://github.com/google/fonts/blob/main/ofl/unbounded/OFL.txt

Upstream family directories:

- Manrope: https://github.com/google/fonts/tree/main/ofl/manrope
- Unbounded: https://github.com/google/fonts/tree/main/ofl/unbounded

## Required production assets

Use official/upstream-derived current builds matching the Google Fonts versions used by the site. Prefer WOFF2 and keep only the scripts/weights genuinely required by EN/RU:

- Manrope: 400, 500, 600, 700 (or an equivalent current variable WOFF2 covering 400–700);
- Unbounded: 500, 600 (or an equivalent current variable WOFF2 covering 500–600);
- Latin + Cyrillic coverage is required for the bilingual interface.

Do **not** substitute an old webfont build merely because a `.woff2` file is available in an abandoned/legacy upstream fork; it may not match the current Google Fonts family data or Cyrillic coverage.

## Why binaries are not committed in this migration PR

The repository tools used for this privacy migration are text-oriented. Rather than generating or copying opaque font binaries from an unverified mirror, the migration leaves font files as an explicit cutover artifact. This preserves provenance and makes the license/source decision reviewable.

## Cutover steps

1. Obtain current WOFF2 assets from an official or verifiably upstream-derived distribution.
2. Record source URL, upstream version/commit/date and file hashes below.
3. Add the OFL 1.1 license notice(s) alongside the distributed font software.
4. Add `@font-face` rules with `font-display: swap`.
5. Preload only a font that is actually critical to first render; do not preload every weight/subset.
6. Remove all `fonts.googleapis.com` / `fonts.gstatic.com` links and preconnects from:
   - `index.html`
   - `ru/index.html`
   - `privacy/index.html`
   - `ru/privacy/index.html`
7. Remove Google Fonts origins from the final CSP.
8. Run EN and RU visual regression/smoke checks.
9. Verify DevTools Network shows no Google Fonts request.

## Production provenance record

Complete this table before merging the migration PR:

| Family | File | Upstream source/version | SHA-256 | License included |
| --- | --- | --- | --- | --- |
| Manrope | TODO | TODO | TODO | TODO |
| Unbounded | TODO | TODO | TODO | TODO |

Until this record and the local assets are complete, **Google Fonts removal remains a production merge blocker**.
