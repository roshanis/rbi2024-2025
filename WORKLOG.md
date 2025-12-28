# Work Log

## 2025-12-27 18:20:51 CST
- Refreshed global theme palette, background gradients, typography variables, and added hero/surface utilities plus reveal animations. (rbi-stats/src/app/globals.css)
- Updated root layout to use Fraunces/Source Sans 3/IBM Plex Mono fonts, new background shell, and refined footer styling. (rbi-stats/src/app/layout.tsx)
- Restyled navbar to match the new dark glass header treatment and typography. (rbi-stats/src/components/Navbar.tsx)
- Rebuilt the dashboard hero, highlights, category cards, and national benchmarks; added custom icons and helper components; uses slugify for map navigation. (rbi-stats/src/app/page.tsx)
- Skill installs: frontend-design installed from anthropics/skills; curated skill "ux" not found in the curated list. (~/.codex/skills)

## 2025-12-27 19:10:47 CST
- Extended the refreshed visual system across map, compare, category, and state pages with surface-card styling, insight panels, and exportable charts. (rbi-stats/src/app/map/page.tsx, rbi-stats/src/app/compare/page.tsx, rbi-stats/src/app/categories/*.tsx, rbi-stats/src/app/states/[slug]/page.tsx)
- Updated shared UI components (data tables, export buttons, chart tooltips, and exportable chart wrappers) to match the new theme and improve empty states. (rbi-stats/src/components/ui/DataTable.tsx, rbi-stats/src/components/ui/ExportButton.tsx, rbi-stats/src/components/charts/*.tsx, rbi-stats/src/components/IndiaMap.tsx)
- Added a PDF-to-JSON data pipeline with extraction/build scripts, manifest config, and documentation. (rbi-stats/scripts/*, rbi-stats/DATA_PIPELINE.md, rbi-stats/README.md)

## 2025-12-27 19:27:03 CST
- Added PDF downloader and validation scripts plus updated pipeline docs for RBI bot-protection notes. (rbi-stats/scripts/download_pdfs.py, rbi-stats/scripts/validate_pdfs.py, rbi-stats/DATA_PIPELINE.md)
- Captured active/next tasks in a repo-level task checklist. (TASKS.md)

## 2025-12-27 23:05:01 CST
- Parsed RBI table PDFs in `pdfs/` and regenerated the GDP, banking, exports, and tourism JSON datasets. (rbi-stats/scripts/build_rbi_datasets.py, rbi-stats/src/data/*.json)
- Improved PDF parsing robustness with multi-page year headers, name normalization, and duplicate-state aggregation for merged UTs. (rbi-stats/scripts/build_rbi_datasets.py)
- Updated pipeline docs to include the direct RBI dataset builder. (rbi-stats/DATA_PIPELINE.md)

## 2025-12-27 23:08:09 CST
- Filtered compare-state selection to only show states with complete datasets and surfaced the available count. (rbi-stats/src/app/compare/page.tsx)

## 2025-12-27 23:18:07 CST
- Added data-year and missing-state footnotes to compare and category pages for better context. (rbi-stats/src/app/compare/page.tsx, rbi-stats/src/app/categories/*.tsx)

## 2025-12-27 23:23:08 CST
- Switched the India map to use a locally hosted GeoJSON to avoid remote fetch failures. (rbi-stats/src/components/IndiaMap.tsx, rbi-stats/public/india-states.json)
