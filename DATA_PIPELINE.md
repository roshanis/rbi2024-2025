# Data Pipeline

This pipeline extracts tables from RBI PDFs and turns them into the JSON files used by the app.

## Setup

- Create a virtual environment (optional but recommended).
- Install requirements from `scripts/requirements.txt`.

Example:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
```

## Step 1: Configure the manifest

Open `scripts/manifest.json` and set:

- `pdf` to the correct PDF file for each dataset.
- `page_start` and `page_end` to the pages where the table appears.
- `columns` to match the header names in the extracted CSV.
- `csv` to the cleaned CSV you want to use when building JSON.

## (Optional) Download the PDFs

If you only have a list of URLs, use the downloader:

```bash
python scripts/download_pdfs.py --list ../pdf.txt --output-dir ../data/raw
```

The script verifies the `%PDF` signature and skips non-PDF responses.
If RBI returns an HTML bot challenge instead of a PDF, download the files manually in a browser and place them in the directory you reference in the manifest.

You can validate the PDFs with:

```bash
python scripts/validate_pdfs.py --dir ../data/raw
```

## Step 2: Extract raw tables

```bash
python scripts/extract_tables.py --manifest scripts/manifest.json --output-dir scripts/outputs
```

This writes one CSV per detected table into `scripts/outputs/<dataset>/`.

## Step 3: Clean the tables

Pick the right table from `scripts/outputs/<dataset>/` and clean it:

- Remove multi-row headers or footnotes.
- Ensure the first row is a single header row.
- Save the cleaned table to the CSV path specified in `manifest.json`.

## Step 4: Build JSON

```bash
python scripts/build_json.py --manifest scripts/manifest.json --output-dir src/data
```

## Fast Path: Build RBI JSONs Directly

If the PDFs in `../pdfs` match the table IDs used in the repo, you can build the JSONs directly:

```bash
python scripts/build_rbi_datasets.py
```

This script reads the RBI table PDFs and writes `src/data/gdp.json`, `src/data/banking.json`, `src/data/exports.json`, and `src/data/tourism.json`.

## Notes

- The exports dataset expects `national.growthRate`. Update `national.static.growthRate` in the manifest.
- If headers do not match, update `columns` or use explicit `index` values.
- The pipeline skips datasets with empty `pdf` or missing CSV files.
