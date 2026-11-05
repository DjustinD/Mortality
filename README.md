# Canadian Mortality Table

A static web page (GitHub Pages ready). The visitor picks a province/territory, sex and age; the page shows a 0–100 table of annual death/survival probabilities and D3.js charts.

**Privacy:** no birthday, location or personal choice is stored in any file, cookie, localStorage or URL. All calculation happens in the browser.

## Files
- `index.html`, `styles.css`, `script.js` – the page (D3 v7 loaded from CDN).
- `withdrawal.html`, `withdrawal.js` – mortality-based RRSP/RRIF withdrawal-rate page.
- `i18n.js` – English-CA / French-CA strings, number formats and the language toggle. The language is carried between pages in the URL hash (`#fr` / `#en`); nothing is stored. To add or change text, edit the `en` and `fr` dictionaries there.
- `fonts/` – Atkinson Hyperlegible (SIL OFL 1.1, licence included).
- `data.json` – annual death probabilities (ages 0–100) per geography and sex, from Statistics Canada life tables 2022/2024.
- `tools/build_data.py` – regenerates `data.json` from the StatCan CSVs (tables 13-10-0114-01 and 13-10-0140-01).
- `mortality_data.csv` – obsolete (old approximation); no longer used, safe to delete before publishing.

## Run locally
`python -m http.server`, then open http://localhost:8000.

## Publish
Push to GitHub, then Settings → Pages → deploy from the main branch.

## Rebuild data
Download `https://www150.statcan.gc.ca/n1/tbl/csv/13100114-eng.zip` and `13100140-eng.zip`, unzip, then
`python tools/build_data.py 13100114.csv 13100140.csv data.json`.

## Limits
Statistics Canada publishes life tables only down to province/territory level (no city/health-region tables). Yukon uses national rates. PEI, NWT and Nunavut come from 5-year age groups converted to annual rates, with ages 90–100 extrapolated.
