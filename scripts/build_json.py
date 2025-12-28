#!/usr/bin/env python3
import argparse
import csv
import json
import re
from pathlib import Path
from typing import Dict, List, Optional


def normalize_header(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


def parse_number(value: Optional[str]) -> Optional[float]:
    if value is None:
        return None
    raw = str(value).strip()
    if raw == "" or raw in {"-", ".."}:
        return None
    cleaned = raw.replace(",", "").replace("₹", "").replace("%", "")
    cleaned = cleaned.replace("N.A.", "").replace("NA", "").replace("n/a", "")
    cleaned = cleaned.strip()
    if cleaned == "":
        return None
    if cleaned.startswith("(") and cleaned.endswith(")"):
        cleaned = "-" + cleaned[1:-1]
    try:
        num = float(cleaned)
    except ValueError:
        return None
    return int(num) if num.is_integer() else num


def load_csv(path: Path) -> List[List[str]]:
    with path.open(newline="", encoding="utf-8") as handle:
        reader = csv.reader(handle)
        return [row for row in reader if any(cell.strip() for cell in row)]


def find_column_index(headers: List[str], column_def: Dict[str, object]) -> Optional[int]:
    if "index" in column_def:
        return int(column_def["index"])
    tokens = column_def.get("source", [])
    if isinstance(tokens, str):
        tokens = [tokens]
    normalized_headers = [normalize_header(header) for header in headers]
    for index, header in enumerate(normalized_headers):
        if all(normalize_header(str(token)) in header for token in tokens):
            return index
    return None


def build_rows(
    rows: List[List[str]],
    columns: Dict[str, Dict[str, object]],
    numeric_fields: List[str],
    header_row: int,
) -> List[Dict[str, object]]:
    headers = rows[header_row]
    indices = {key: find_column_index(headers, column_def) for key, column_def in columns.items()}
    data_rows = []
    for row in rows[header_row + 1 :]:
        record: Dict[str, object] = {}
        for key, index in indices.items():
            if index is None or index >= len(row):
                record[key] = None
                continue
            value = row[index]
            if key in numeric_fields:
                record[key] = parse_number(value)
            else:
                record[key] = value.strip()
        state_value = record.get("state")
        if not state_value or str(state_value).lower().startswith("total"):
            continue
        data_rows.append(record)
    return data_rows


def compute_national(data: List[Dict[str, object]], config: Dict[str, object]) -> Dict[str, object]:
    national: Dict[str, object] = {}
    for key, field in (config.get("sum") or {}).items():
        values = [row.get(field) for row in data if isinstance(row.get(field), (int, float))]
        national[key] = sum(values)
    for key, field in (config.get("avg") or {}).items():
        values = [row.get(field) for row in data if isinstance(row.get(field), (int, float))]
        national[key] = round(sum(values) / len(values), 2) if values else 0
    national.update(config.get("static", {}) or {})
    return national


def main() -> None:
    parser = argparse.ArgumentParser(description="Build JSON datasets from cleaned CSV tables.")
    parser.add_argument("--manifest", type=Path, required=True, help="Path to manifest.json.")
    parser.add_argument("--output-dir", type=Path, default=Path("src/data"), help="Output directory.")
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    datasets = manifest.get("datasets", [])
    output_dir = args.output_dir
    output_dir.mkdir(parents=True, exist_ok=True)

    for dataset in datasets:
        csv_path_value = dataset.get("csv")
        if not csv_path_value:
            print(f"Skipping {dataset.get('name', 'unknown')}: no csv path set in manifest.")
            continue
        csv_path = (args.manifest.parent / csv_path_value).resolve()
        if not csv_path.exists():
            print(f"Skipping {dataset.get('name', 'unknown')}: csv not found at {csv_path}")
            continue

        rows = load_csv(csv_path)
        header_row = int(dataset.get("header_row", 0))
        columns = dataset.get("columns", {})
        numeric_fields = dataset.get("numeric_fields") or [key for key in columns if key != "state"]
        data_rows = build_rows(rows, columns, numeric_fields, header_row)

        payload: Dict[str, object] = {
            "title": dataset.get("title", dataset.get("name", "")),
            "description": dataset.get("description", ""),
            "source": dataset.get("source", ""),
            "year": dataset.get("year", ""),
            "data": data_rows,
        }
        if dataset.get("unit"):
            payload["unit"] = dataset["unit"]
        national_config = dataset.get("national", {})
        if national_config:
            payload["national"] = compute_national(data_rows, national_config)

        output_file = output_dir / dataset.get("output", f"{dataset.get('name', 'dataset')}.json")
        output_file.write_text(json.dumps(payload, indent=2), encoding="utf-8")
        print(f"Wrote {output_file}")


if __name__ == "__main__":
    main()
