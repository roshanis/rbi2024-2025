#!/usr/bin/env python3
import argparse
from pathlib import Path


def is_pdf(path: Path) -> bool:
    with path.open("rb") as handle:
        return handle.read(4) == b"%PDF"


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate that files are real PDFs.")
    parser.add_argument("--dir", type=Path, default=Path("../data"), help="Directory containing PDF files.")
    args = parser.parse_args()

    pdf_files = sorted(args.dir.glob("*.PDF")) + sorted(args.dir.glob("*.pdf"))
    if not pdf_files:
        print(f"No PDFs found in {args.dir}")
        return

    invalid = []
    for pdf in pdf_files:
        if not is_pdf(pdf):
            invalid.append(pdf.name)

    if invalid:
        print("Non-PDF files detected:")
        for name in invalid:
            print(f" - {name}")
    else:
        print("All files are valid PDFs.")


if __name__ == "__main__":
    main()
