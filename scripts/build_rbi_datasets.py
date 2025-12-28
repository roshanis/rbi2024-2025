#!/usr/bin/env python3
import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

import pdfplumber


STATE_MAP = {
    "andaman & nicobar": "Andaman and Nicobar Islands",
    "andaman & nicobar islands": "Andaman and Nicobar Islands",
    "andaman & nicobar island": "Andaman and Nicobar Islands",
    "andaman and nicobar": "Andaman and Nicobar Islands",
    "andaman and nicobar island": "Andaman and Nicobar Islands",
    "dadra & nagar haveli": "Dadra and Nagar Haveli and Daman and Diu",
    "dadra & nagar haveli and daman & diu": "Dadra and Nagar Haveli and Daman and Diu",
    "dadra and nagar haveli and daman and diu": "Dadra and Nagar Haveli and Daman and Diu",
    "daman & diu and dadra &": "Dadra and Nagar Haveli and Daman and Diu",
    "daman and diu and dadra and": "Dadra and Nagar Haveli and Daman and Diu",
    "daman & diu": "Dadra and Nagar Haveli and Daman and Diu",
    "jammu & kashmir": "Jammu and Kashmir",
    "nct of delhi": "Delhi",
    "delhi": "Delhi",
    "orissa": "Odisha",
    "pondicherry": "Puducherry",
}

SKIP_PREFIXES = (
    "table",
    "base",
    "source",
    "note",
    "notes",
    "-:",
    "*:",
)

SKIP_LINES = {
    "islands",
    "and daman & diu@",
    "and daman & diu",
    "and daman & diu#",
    "and daman & diu*",
    "nagar haveli",
}


def normalize_state_name(name: str) -> str:
    cleaned = re.sub(r"[*#@]", "", name).strip()
    cleaned = re.sub(r"(?:\s-+\s*)+$", "", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned)
    lowered = cleaned.lower()
    if lowered in STATE_MAP:
        return STATE_MAP[lowered]
    cleaned = cleaned.replace("&", "and")
    cleaned = re.sub(r"\s+and\s+", " and ", cleaned)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    return cleaned


def parse_years(line: str) -> List[str]:
    tokens = re.findall(r"\b(?:19|20)\d{2}(?:-\d{2})?\b", line)
    return tokens


def parse_numbers(text: str) -> List[Optional[float]]:
    numbers = []
    for token in re.findall(r"-|\d[\d,]*\.?\d*", text):
        token = token.strip()
        if token in {"-", ""}:
            continue
        value = token.replace(",", "")
        try:
            num = float(value)
        except ValueError:
            continue
        numbers.append(num)
    return numbers


def extract_lines(pdf_path: Path) -> List[str]:
    lines: List[str] = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text() or ""
            lines.extend(text.splitlines())
    return lines


def year_sort_key(year: str) -> int:
    if "-" in year:
        return int(year.split("-")[0])
    return int(year)


def parse_state_series(pdf_path: Path) -> Tuple[List[str], Dict[str, List[Optional[float]]]]:
    lines = extract_lines(pdf_path)
    header_years: List[str] = []
    all_years: List[str] = []
    rows: Dict[str, Dict[str, Optional[float]]] = {}
    pending_name = ""

    for line in lines:
        line = " ".join(line.split())
        if not line:
            continue
        lowered = line.lower()
        years = parse_years(line)
        if years and len(years) >= 3:
            header_years = years
            pending_name = ""
            for year in years:
                if year not in all_years:
                    all_years.append(year)
            continue
        if lowered.startswith(SKIP_PREFIXES):
            pending_name = ""
            continue
        if "all india" in lowered or "all-india" in lowered:
            pending_name = ""
            continue
        if "state/union territory" in lowered or "region/state/union" in lowered:
            pending_name = ""
            continue

        if not any(ch.isdigit() for ch in line):
            if lowered in SKIP_LINES or lowered.startswith("and daman"):
                continue
            if "-" in line and header_years:
                name_part = re.split(r"\s-+", line)[0].strip()
                name = normalize_state_name(name_part)
                if name and "region" not in name.lower():
                    rows.setdefault(name, {})
                continue
            pending_name = (pending_name + " " + line).strip()
            continue

        first_digit = re.search(r"\d", line)
        if not first_digit:
            continue
        idx = first_digit.start()
        name_part = line[:idx].strip()
        values_part = line[idx:].strip()

        if not name_part and pending_name:
            name_part = pending_name
            pending_name = ""
        elif pending_name:
            name_part = f"{pending_name} {name_part}".strip()
            pending_name = ""

        if not name_part:
            continue

        values = parse_numbers(values_part)
        if not header_years:
            continue
        if len(values) < len(header_years):
            values = [None] * (len(header_years) - len(values)) + values
        if len(values) > len(header_years):
            values = values[: len(header_years)]

        name = normalize_state_name(name_part)
        if not name or "region" in name.lower():
            continue
        rows.setdefault(name, {})
        for year, value in zip(header_years, values):
            if value is None:
                continue
            if year in rows[name]:
                rows[name][year] += value
            else:
                rows[name][year] = value

    sorted_years = sorted(all_years, key=year_sort_key)
    normalized_rows: Dict[str, List[Optional[float]]] = {}
    for name, year_map in rows.items():
        normalized_rows[name] = [year_map.get(year) for year in sorted_years]

    return sorted_years, normalized_rows


def pick_year_value(values: List[Optional[float]], years: List[str], target: str) -> Optional[float]:
    if target in years:
        idx = years.index(target)
        return values[idx]
    return values[-1] if values else None


def build_gdp_dataset(pdf_dir: Path) -> Dict[str, object]:
    gdp_year = "2016-17"
    gdp_prev_year = "2015-16"
    per_capita_year = "2016-17"

    gdp_years, gdp_rows = parse_state_series(pdf_dir / "21T_11122025D994949B48C44B68B4465FBB9ADDFF3D.PDF")
    per_years, per_rows = parse_state_series(pdf_dir / "19T_11122025B8CC230E4A34431999B4D6A107707BCA.PDF")

    data = []
    for state, series in gdp_rows.items():
        gsdp_lakh = pick_year_value(series, gdp_years, gdp_year)
        gsdp_prev = pick_year_value(series, gdp_years, gdp_prev_year)
        if gsdp_lakh is None:
            continue
        per_capita = None
        if state in per_rows:
            per_capita = pick_year_value(per_rows[state], per_years, per_capita_year)
        gsdp_crore = gsdp_lakh / 100 if gsdp_lakh is not None else None
        growth = None
        if gsdp_prev and gsdp_prev != 0:
            growth = ((gsdp_lakh - gsdp_prev) / gsdp_prev) * 100

        data.append(
            {
                "state": state,
                "gsdp": round(gsdp_crore, 2) if gsdp_crore is not None else None,
                "growth": round(growth, 2) if growth is not None else None,
                "perCapita": int(per_capita) if per_capita is not None else None,
            }
        )

    totals = [row["gsdp"] for row in data if isinstance(row.get("gsdp"), (int, float))]
    growths = [row["growth"] for row in data if isinstance(row.get("growth"), (int, float))]
    per_caps = [row["perCapita"] for row in data if isinstance(row.get("perCapita"), (int, float))]

    return {
        "title": "Gross State Domestic Product (Current Prices)",
        "description": "Gross State Domestic Product at current prices (₹ Crore)",
        "source": "RBI Handbook of Statistics on Indian States, 2024-25",
        "year": gdp_year,
        "unit": "₹ Crore",
        "data": sorted(data, key=lambda d: d["gsdp"] or 0, reverse=True),
        "national": {
            "totalGDP": round(sum(totals), 2) if totals else 0,
            "avgGrowth": round(sum(growths) / len(growths), 2) if growths else 0,
            "avgPerCapita": round(sum(per_caps) / len(per_caps), 2) if per_caps else 0,
        },
    }


def build_banking_dataset(pdf_dir: Path) -> Dict[str, object]:
    year = "2014"

    branches_years, branches_rows = parse_state_series(pdf_dir / "152T_1112202512B2BF0FBDB74FF48CF835E2A6B7C592.PDF")
    deposits_years, deposits_rows = parse_state_series(pdf_dir / "155T_11122025BC88547570414295AB088FBCF5C90806.PDF")
    credit_years, credit_rows = parse_state_series(pdf_dir / "156T_1112202520771561966C49F1B9C00F56ACF97557.PDF")
    cd_years, cd_rows = parse_state_series(pdf_dir / "154T_111220253A00C718ED584E7C850BBCAC3B2FA18B.PDF")

    data = []
    for state, branches_series in branches_rows.items():
        branches = pick_year_value(branches_series, branches_years, year)
        deposits = pick_year_value(deposits_rows.get(state, []), deposits_years, year) if state in deposits_rows else None
        credit = pick_year_value(credit_rows.get(state, []), credit_years, year) if state in credit_rows else None
        cd_ratio = pick_year_value(cd_rows.get(state, []), cd_years, year) if state in cd_rows else None

        if branches is None:
            continue

        data.append(
            {
                "state": state,
                "branches": int(branches) if branches is not None else None,
                "deposits": round(deposits, 2) if deposits is not None else None,
                "credit": round(credit, 2) if credit is not None else None,
                "cdRatio": round(cd_ratio, 2) if cd_ratio is not None else None,
            }
        )

    totals_branches = [row["branches"] for row in data if isinstance(row.get("branches"), (int, float))]
    totals_deposits = [row["deposits"] for row in data if isinstance(row.get("deposits"), (int, float))]
    totals_credit = [row["credit"] for row in data if isinstance(row.get("credit"), (int, float))]
    cd_ratios = [row["cdRatio"] for row in data if isinstance(row.get("cdRatio"), (int, float))]

    return {
        "title": "Banking Statistics (Scheduled Commercial Banks)",
        "description": "State-wise number of offices, deposits, and credit (As at end-March)",
        "source": "RBI Handbook of Statistics on Indian States, 2024-25",
        "year": year,
        "data": sorted(data, key=lambda d: d["deposits"] or 0, reverse=True),
        "national": {
            "totalBranches": int(sum(totals_branches)) if totals_branches else 0,
            "totalDeposits": round(sum(totals_deposits), 2) if totals_deposits else 0,
            "totalCredit": round(sum(totals_credit), 2) if totals_credit else 0,
            "avgCDRatio": round(sum(cd_ratios) / len(cd_ratios), 2) if cd_ratios else 0,
        },
    }


def build_exports_dataset(pdf_dir: Path) -> Dict[str, object]:
    year = "2023-24"
    prev_year = "2022-23"
    usd_to_inr = 83.0
    usd_million_to_crore = usd_to_inr / 10.0

    years, rows = parse_state_series(pdf_dir / "181T_1112202574821AB7B09745AC82B77B352FF4E3EB.PDF")

    data = []
    total_prev = 0.0
    for state, series in rows.items():
        value_usd_mn = pick_year_value(series, years, year)
        prev_usd_mn = pick_year_value(series, years, prev_year)
        if value_usd_mn is None:
            continue
        exports_crore = value_usd_mn * usd_million_to_crore
        if prev_usd_mn is not None:
            total_prev += prev_usd_mn * usd_million_to_crore
        data.append(
            {
                "state": state,
                "exports": round(exports_crore, 2),
            }
        )

    total_exports = sum(row["exports"] for row in data)
    for row in data:
        row["share"] = round((row["exports"] / total_exports) * 100, 2) if total_exports else 0

    growth_rate = ((total_exports - total_prev) / total_prev) * 100 if total_prev else 0

    return {
        "title": "State-wise Exports",
        "description": "State-wise exports (approx ₹ Crore from USD millions, USD@83)",
        "source": "RBI Handbook of Statistics on Indian States, 2024-25",
        "year": year,
        "unit": "₹ Crore (approx)",
        "data": sorted(data, key=lambda d: d["exports"], reverse=True),
        "national": {
            "totalExports": round(total_exports, 2),
            "growthRate": round(growth_rate, 2),
        },
    }


def build_tourism_dataset(pdf_dir: Path) -> Dict[str, object]:
    year = "2016"
    domestic_years, domestic_rows = parse_state_series(pdf_dir / "13T_1112202529FAEEB805FE49E78D8A39C8679DEC25.PDF")
    foreign_years, foreign_rows = parse_state_series(pdf_dir / "182T_111220255D1D4A3006504017A6916B26516E0915.PDF")

    data = []
    for state, domestic_series in domestic_rows.items():
        domestic_mn = pick_year_value(domestic_series, domestic_years, year)
        foreign_lakh = pick_year_value(foreign_rows.get(state, []), foreign_years, year) if state in foreign_rows else None
        if domestic_mn is None and foreign_lakh is None:
            continue
        domestic = int(round(domestic_mn * 1_000_000)) if domestic_mn is not None else None
        foreign = int(round(foreign_lakh * 100_000)) if foreign_lakh is not None else None
        total = None
        if domestic is not None and foreign is not None:
            total = domestic + foreign
        if total is None:
            continue
        data.append(
            {
                "state": state,
                "domestic": domestic,
                "foreign": foreign,
                "total": total,
            }
        )

    totals_domestic = [row["domestic"] for row in data if isinstance(row.get("domestic"), int)]
    totals_foreign = [row["foreign"] for row in data if isinstance(row.get("foreign"), int)]
    totals_total = [row["total"] for row in data if isinstance(row.get("total"), int)]

    return {
        "title": "Tourism Statistics",
        "description": "State-wise domestic and foreign tourist visits",
        "source": "RBI Handbook of Statistics on Indian States, 2024-25",
        "year": year,
        "data": sorted(data, key=lambda d: d.get("total") or 0, reverse=True),
        "national": {
            "totalDomestic": sum(totals_domestic) if totals_domestic else 0,
            "totalForeign": sum(totals_foreign) if totals_foreign else 0,
            "total": sum(totals_total) if totals_total else 0,
        },
    }


def write_dataset(payload: Dict[str, object], output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")


def main() -> None:
    pdf_dir = Path(__file__).resolve().parent.parent.parent / "pdfs"
    output_dir = Path(__file__).resolve().parent.parent / "src" / "data"

    datasets = {
        "gdp.json": build_gdp_dataset(pdf_dir),
        "banking.json": build_banking_dataset(pdf_dir),
        "exports.json": build_exports_dataset(pdf_dir),
        "tourism.json": build_tourism_dataset(pdf_dir),
    }

    for filename, payload in datasets.items():
        write_dataset(payload, output_dir / filename)
        print(f"Wrote {filename}")


if __name__ == "__main__":
    main()
