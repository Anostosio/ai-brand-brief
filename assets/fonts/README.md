# Fonts — local-only production note

Google Fonts runtime requests have already been **removed** from the v1.3 local-only target.

Until self-hosted font files are added, CSS keeps the family names `Manrope` and `Unbounded` with generic `sans-serif` fallbacks. If those families are not installed on the user's device, the browser uses its local fallback font. This may slightly change typography, but it avoids an unnecessary external request and costs nothing.

## License status

Both families are distributed in the Google Fonts upstream repository under the **SIL Open Font License 1.1 (OFL-1.1)**, which permits use, embedding and redistribution subject to the license terms.

Verified upstream license records:

- Manrope: https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt
- Unbounded: https://github.com/google/fonts/blob/main/ofl/unbounded/OFL.txt

Current upstream family directories:

- Manrope: https://github.com/google/fonts/tree/main/ofl/manrope
- Unbounded: https://github.com/google/fonts/tree/main/ofl/unbounded

At the 2026-09-03 review, the Google Fonts upstream directories expose current variable TTF sources rather than ready current WOFF2 files. Do **not** substitute an old WOFF2 from an abandoned/legacy fork merely to restore typography.

## Optional design-parity improvement

Self-hosted fonts are now a **visual-quality improvement, not a privacy or paid-hosting blocker**.

When suitable current assets are prepared:

1. derive/obtain WOFF2 from an official or verifiably current upstream source;
2. retain Latin + Cyrillic coverage needed by EN/RU;
3. record upstream commit/version/date and SHA-256;
4. keep the OFL license notice with redistributed font software;
5. use `@font-face` with `font-display: swap`;
6. preload only genuinely critical assets;
7. smoke-test EN/RU typography;
8. verify no external font request appears in DevTools Network.

Recommended ranges:

- Manrope: 400–700;
- Unbounded: 500–600.

## Provenance record

Complete when local font binaries are eventually added:

| Family | File | Upstream source/version | SHA-256 | License included |
| --- | --- | --- | --- | --- |
| Manrope | not bundled yet | Google Fonts OFL upstream | TODO when bundled | OFL-1.1 upstream verified |
| Unbounded | not bundled yet | Google Fonts OFL upstream | TODO when bundled | OFL-1.1 upstream verified |

The site can be released with local/system fallback fonts while this table remains incomplete, provided runtime network verification confirms `fonts.googleapis.com` and `fonts.gstatic.com` are absent.
