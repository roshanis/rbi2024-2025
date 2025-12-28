#!/usr/bin/env python3
import argparse
import csv
import json
from pathlib import Path
from typing import Iterable, List, Optional

import pdfplumber


def normalize_cell(value: object) -> str:
    if value is None:
        return ""
    return " ".join(str(value).split())


def write_table(rows: List[List[str]], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.writer(handle)
        writer.writerows(rows)


def extract_tables_from_pdf(
    pdf_path: Path,
    output_dir: Path,
    pages: Optional[Iterable[int]] = None,
) -> List[Path]:
    written_files: List[Path] = []
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        if pages is None:
            pages = range(1, total_pages + 1)

        for page_number in pages:
            if page_number < 1 or page_number > total_pages:
                continue
            page = pdf.pages[page_number - 1]
            tables = page.extract_tables() or []
            for table_index, table in enumerate(tables, start=1):
                normalized = [[normalize_cell(cell) for cell in row] for row in table if row]
                if not any(any(cell for cell in row) for row in normalized):
                    continue
                output_path = output_dir / f"page_{page_number:03d}_table_{table_index:02d}.csv"
                write_table(normalized, output_path)
                written_files.append(output_path)
    return written_files


def parse_page_range(start: Optional[int], end: Optional[int]) -> Optional[Iterable[int]]:
    if start is None and end is None:
        return None
    if start is None:
        start = 1
    if end is None:
        end = start
    return range(start, end + 1)


def run_manifest(manifest_path: Path, output_root: Path) -> None:
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    datasets = manifest.get("datasets", [])
    for dataset in datasets:
        pdf_value = dataset.get("pdf")
        if not pdf_value:
            print(f"Skipping {dataset.get('name', 'unknown')}: no pdf path set in manifest.")
            continue
        pdf_path = (manifest_path.parent / pdf_value).resolve()
        if not pdf_path.exists():
            print(f"Skipping {dataset.get('name', 'unknown')}: pdf not found at {pdf_path}")
            continue
        output_dir = output_root / dataset.get("name", "dataset")
        page_range = parse_page_range(dataset.get("page_start"), dataset.get("page_end"))
        written = extract_tables_from_pdf(pdf_path, output_dir, page_range)
        print(f"{dataset.get('name', 'dataset')}: wrote {len(written)} tables to {output_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract tables from RBI PDFs into CSV files.")
    parser.add_argument("--manifest", type=Path, help="Path to manifest.json for batch extraction.")
    parser.add_argument("--pdf", type=Path, help="Single PDF file to extract tables from.")
    parser.add_argument("--output-dir", type=Path, default=Path("scripts/outputs"), help="Output directory.")
    parser.add_argument("--page-start", type=int, help="First page to extract (1-based).")
    parser.add_argument("--page-end", type=int, help="Last page to extract (1-based).")
    args = parser.parse_args()

    output_dir = args.output_dir
    if args.manifest:
        run_manifest(args.manifest, output_dir)
        return

    if not args.pdf:
        parser.error("Either --manifest or --pdf is required.")

    page_range = parse_page_range(args.page_start, args.page_end)
    written = extract_tables_from_pdf(args.pdf, output_dir, page_range)
    print(f"Wrote {len(written)} tables to {output_dir}")


if __name__ == "__main__":
    main()
