from __future__ import annotations

import csv
import json
import re
from pathlib import Path

import fitz


LABEL_FARM = "\ub18d\uc7a5\uba85"
LABEL_ADDRESS = "\uc8fc\uc18c"
LABEL_REPRESENTATIVE = "\ub300\ud45c"
LABEL_SPECIES = "\ub300\ud45c\uc218\uc885"
LABEL_CONTACT = "\uc5f0\ub77d\ucc98"


def normalize_text(text: str) -> str:
    text = re.sub(r"\s+", " ", text)
    replacements = [
        (r"\ub300\s*\ud45c\s*\uc218\s*\uc885", LABEL_SPECIES),
        (r"\ub300\ud45c\s*\uc218\uc885", LABEL_SPECIES),
        (r"\uc8fc\s*\uc18c", LABEL_ADDRESS),
        (r"\ub300\s*\ud45c", LABEL_REPRESENTATIVE),
        (r"\ub18d\uc7a5\s*\uba85", LABEL_FARM),
        (r"\uc5f0\s*\ub77d\s*\ucc98", LABEL_CONTACT),
    ]
    for pattern, replacement in replacements:
        text = re.sub(pattern, replacement, text)
    return text.strip()


def clean_value(value: str) -> str:
    value = re.sub(r"\s+", " ", value)
    value = value.strip(" \t\r\n,")
    return value


def extract_phone(value: str) -> str:
    matches = re.findall(r"0\d{1,2}[-\s)]?\d{3,4}[-\s]?\d{4}", value)
    if not matches:
        return clean_value(value)
    cleaned = []
    for phone in matches:
        digits = re.sub(r"\D", "", phone)
        if len(digits) == 11:
            cleaned.append(f"{digits[:3]}-{digits[3:7]}-{digits[7:]}")
        elif len(digits) == 10 and digits.startswith("02"):
            cleaned.append(f"{digits[:2]}-{digits[2:6]}-{digits[6:]}")
        elif len(digits) == 10:
            cleaned.append(f"{digits[:3]}-{digits[3:6]}-{digits[6:]}")
        else:
            cleaned.append(phone.strip())
    return "; ".join(dict.fromkeys(cleaned))


def infer_region(address: str) -> str:
    if re.search(r"^(서울|경기|경기도)", address):
        return "서울·경기"
    if re.search(r"^(전북|전라북도)", address):
        return "전북"
    if re.search(r"^(전남|전라남도|광주)", address):
        return "전남"
    if re.search(r"^(충남|충청남도|대전)", address):
        return "충남"
    if re.search(r"^(충북|충청북도)", address):
        return "충북"
    if re.search(r"^(경북|경상북도|대구)", address):
        return "경북"
    if re.search(r"^(경남|경상남도|부산)", address):
        return "경남"
    if re.search(r"^(강원|강원도)", address):
        return "강원"
    return ""


def parse_page(text: str, page_number: int) -> list[dict[str, str | int]]:
    text = normalize_text(text)
    if LABEL_FARM not in text:
        return []

    pattern = re.compile(
        rf"{LABEL_FARM}(?P<name>.*?){LABEL_ADDRESS}"
        rf"(?P<address>.*?){LABEL_REPRESENTATIVE}"
        rf"(?P<representative>.*?){LABEL_SPECIES}"
        rf"(?P<species>.*?){LABEL_CONTACT}"
        rf"(?P<contact>.*?)(?={LABEL_FARM}|$)"
    )

    entries: list[dict[str, str | int]] = []
    for match in pattern.finditer(text):
        address = clean_value(match.group("address"))
        raw_contact = clean_value(match.group("contact"))
        entry = {
            "source_page": page_number,
            "region": infer_region(address),
            "farm_name": clean_value(match.group("name")),
            "address": address,
            "representative": clean_value(match.group("representative")),
            "main_species": clean_value(match.group("species")),
            "phone": extract_phone(raw_contact),
        }
        if entry["farm_name"] and entry["address"]:
            entries.append(entry)
    return entries


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    pdf = next((root / "docs").glob("*\uc870\uacbd\uc218*.pdf"))
    out_dir = root / "output" / "pdf"
    out_dir.mkdir(parents=True, exist_ok=True)

    entries: list[dict[str, str | int]] = []
    with fitz.open(pdf) as doc:
        for index, page in enumerate(doc, start=1):
            entries.extend(parse_page(page.get_text("text") or "", index))

    csv_path = out_dir / "national_landscape_tree_farms.csv"
    json_path = out_dir / "national_landscape_tree_farms.json"

    fields = [
        "source_page",
        "region",
        "farm_name",
        "address",
        "representative",
        "main_species",
        "phone",
    ]
    with csv_path.open("w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(entries)

    with json_path.open("w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
        f.write("\n")

    print(f"parsed_entries={len(entries)}")
    print(f"csv={csv_path}")
    print(f"json={json_path}")


if __name__ == "__main__":
    main()
