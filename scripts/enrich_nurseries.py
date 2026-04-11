"""Match nursery farms to PlantOntology species + build standard drawings index."""
import json, glob, re, os, zipfile
from pathlib import Path

BASE = Path(__file__).parent.parent

# ── 1. Nursery farms ────────────────────────────────────────────────────────
farms_raw = json.loads((BASE / "output/pdf/national_landscape_tree_farms.json").read_text(encoding="utf-8"))
print(f"Farms loaded: {len(farms_raw)}")

# ── 2. All species ───────────────────────────────────────────────────────────
all_species = []
for fpath in glob.glob(str(BASE / "data/species/*.json")):
    data = json.loads(Path(fpath).read_text(encoding="utf-8"))
    items = data if isinstance(data, list) else data.get("species", [data])
    for item in items:
        item.setdefault("_source_file", Path(fpath).name)
        all_species.append(item)
print(f"Species loaded: {len(all_species)}")

# Build korean name lookup
species_by_kr: dict[str, dict] = {}
for sp in all_species:
    kn = sp.get("korean_name", "")
    if kn:
        main = re.split(r"[\s(\uff08]", kn)[0].strip()
        if main:
            species_by_kr[main] = sp

# ── 3. Match nurseries → species ─────────────────────────────────────────────
enriched_farms = []
total_links = 0
for farm in farms_raw:
    species_text = farm.get("main_species", "")
    raw_names = [s.strip() for s in re.split(r"[,\n\uff0c\u3001]", species_text) if s.strip()]
    matched_ids = []
    for name in raw_names:
        clean = re.split(r"[\s(\uff08]", name)[0].strip()
        if clean in species_by_kr:
            matched_ids.append(species_by_kr[clean].get("id", clean))
    farm["matched_species_ids"] = matched_ids
    farm["matched_count"] = len(matched_ids)
    total_links += len(matched_ids)
    enriched_farms.append(farm)

matched_farms = [f for f in enriched_farms if f["matched_count"] > 0]
print(f"Farms with species matches: {len(matched_farms)}/{len(enriched_farms)}")
print(f"Total species-farm links: {total_links}")

(BASE / "data/nurseries").mkdir(exist_ok=True)
(BASE / "data/nurseries/nursery_farms.json").write_text(
    json.dumps(enriched_farms, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("Saved: data/nurseries/nursery_farms.json")

# ── 4. Standard drawings index ───────────────────────────────────────────────
drawings_zip = BASE / "docs" / "\ud45c\uc900\uc0c1\uc138\ub3c4(\uc870\uacbd) \uac1c\uc815[2023.1]_\ub4f1\uc7ac.zip"
drawings = []
if drawings_zip.exists():
    with zipfile.ZipFile(drawings_zip, "r") as z:
        for name in z.namelist():
            if name.endswith(".dwg") or name.endswith(".pdf"):
                parts = name.replace("\\", "/").split("/")
                category = parts[0] if len(parts) > 1 else "기타"
                fname = parts[-1]
                code_match = re.match(r"(LS\d+-\d+[^-]*)-", fname)
                code = code_match.group(1) if code_match else ""
                drawings.append({
                    "code": code,
                    "category": category,
                    "filename": fname,
                    "path_in_zip": name,
                    "format": fname.split(".")[-1].upper(),
                    "label": "표준상세도",
                    "source": "표준상세도(조경) 개정 2023.1",
                    "domain": "landscape_standard_kr",
                })

print(f"Standard drawings indexed: {len(drawings)}")
(BASE / "data").mkdir(exist_ok=True)
(BASE / "data/standard_drawings_index.json").write_text(
    json.dumps(drawings, ensure_ascii=False, indent=2), encoding="utf-8"
)
print("Saved: data/standard_drawings_index.json")

# ── 5. HWPX climate indicators ───────────────────────────────────────────────
hwpx = BASE / "docs" / "(2024) \uae30\ud6c4\ubcc0\ud654 \uc0dd\ubb3c\uc9c0\ud45c 100\uc885.hwpx"
indicators = []
if hwpx.exists():
    with zipfile.ZipFile(hwpx, "r") as z:
        xml = z.read("Contents/section0.xml").decode("utf-8", errors="ignore")
    # Extract table cells
    cells_raw = re.findall(r"<hp:tc\b[^>]*>(.*?)</hp:tc>", xml, re.DOTALL)
    cell_texts = []
    for c in cells_raw:
        txts = re.findall(r"<hp:t[^>]*>([^<]+)</hp:t>", c)
        combined = "".join(txts).replace("&amp;", "&").strip()
        cell_texts.append(combined)

    HEADER_CELLS = {"순번", "구분(분류군)", "종   명", "국 명", "학 명", "종명", "국명", "학명"}
    i = 0
    while i < len(cell_texts):
        t = cell_texts[i]
        if re.match(r"^\d{1,3}$", t) and 1 <= int(t) <= 100:
            seq = int(t)
            j = i + 1
            group = []
            while j < len(cell_texts):
                nt = cell_texts[j]
                if re.match(r"^\d{1,3}$", nt) and 1 <= int(nt) <= 100:
                    break
                if nt in HEADER_CELLS:
                    j += 1
                    continue
                group.append(nt)
                j += 1
            sci_idx = None
            for k, g in enumerate(group):
                if re.match(r"^[A-Z][a-z]", g):
                    sci_idx = k
                    break
            if sci_idx is not None:
                sci = group[sci_idx]
                kor = ""
                for k in range(sci_idx - 1, -1, -1):
                    g = group[k]
                    if not re.search(r"\(\d+\)", g) and len(g) >= 2:
                        kor = g
                        break
                if kor and sci:
                    indicators.append({
                        "seq": seq,
                        "korean_name": kor,
                        "scientific_name": sci,
                        "source": "국가 기후변화 생물지표종 100종 (2024)",
                        "climate_indicator": True,
                        "domain": "climate_biology_kr",
                    })
            i = j
        else:
            i += 1

print(f"Climate indicators: {len(indicators)}")
out_ci = BASE / "data/species/climate_indicators_2024.json"
out_ci.write_text(json.dumps(indicators, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"Saved: {out_ci.name}")

# ── 6. Cross-match climate indicators with PlantOntology ─────────────────────
ci_matched = []
for ind in indicators:
    kor = ind["korean_name"]
    clean = re.split(r"[\s(\uff08]", kor)[0].strip()
    if clean in species_by_kr:
        sp = species_by_kr[clean]
        ci_matched.append({
            "indicator_seq": ind["seq"],
            "korean_name": kor,
            "scientific_name": ind["scientific_name"],
            "plantontology_id": sp.get("id"),
            "plant_type": sp.get("plant_type"),
            "drought_tolerance": sp.get("drought_tolerance"),
            "pollution_tolerance": sp.get("pollution_tolerance"),
        })
print(f"Climate indicators matched to PlantOntology: {len(ci_matched)}/100")
(BASE / "data/species/climate_indicators_matched.json").write_text(
    json.dumps(ci_matched, ensure_ascii=False, indent=2), encoding="utf-8"
)

print("\nAll done.")
