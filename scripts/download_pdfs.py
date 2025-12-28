#!/usr/bin/env python3
import argparse
from pathlib import Path
from typing import Iterable

import requests


def iter_urls(path: Path) -> Iterable[str]:
    for line in path.read_text(encoding="utf-8").splitlines():
        url = line.strip()
        if url and not url.startswith("#"):
            yield url


def sanitize_filename(url: str) -> str:
    return url.rsplit("/", 1)[-1]


def download_pdf(url: str, output_path: Path, timeout: int = 30) -> bool:
    headers = {"User-Agent": "Mozilla/5.0 (RBI stats downloader)"}
    with requests.get(url, headers=headers, stream=True, timeout=timeout) as response:
        response.raise_for_status()
        content_type = response.headers.get("Content-Type", "")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with output_path.open("wb") as handle:
            for chunk in response.iter_content(chunk_size=1024 * 64):
                if chunk:
                    handle.write(chunk)

    with output_path.open("rb") as handle:
        signature = handle.read(4)
    if signature != b"%PDF":
        output_path.unlink(missing_ok=True)
        print(f"Skipped (not PDF): {url} | content-type: {content_type}")
        return False
    print(f"Downloaded: {output_path.name}")
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Download RBI PDFs from a URL list.")
    parser.add_argument("--list", type=Path, default=Path("../pdf.txt"), help="Path to file containing PDF URLs.")
    parser.add_argument("--output-dir", type=Path, default=Path("../data/raw"), help="Output directory for PDFs.")
    parser.add_argument("--limit", type=int, help="Limit number of downloads.")
    parser.add_argument("--start-index", type=int, default=0, help="Start index in the URL list (0-based).")
    parser.add_argument("--skip-existing", action="store_true", help="Skip files that already exist.")
    args = parser.parse_args()

    urls = list(iter_urls(args.list))
    if args.start_index:
        urls = urls[args.start_index :]
    if args.limit:
        urls = urls[: args.limit]

    success = 0
    for url in urls:
        filename = sanitize_filename(url)
        output_path = args.output_dir / filename
        if args.skip_existing and output_path.exists():
            print(f"Skipped (exists): {output_path.name}")
            continue
        if download_pdf(url, output_path):
            success += 1

    print(f"Downloaded {success}/{len(urls)} PDFs.")


if __name__ == "__main__":
    main()
