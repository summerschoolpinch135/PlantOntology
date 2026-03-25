# Contributing to PlantOntology

Thank you for your interest in contributing! This guide explains how you can help.

## Ways to Contribute

### 1. Add or improve species data
Missing a plant? Wrong information? Help us expand!

**Option A: Submit a GitHub issue**
```
Title: [DATA] Add Acer palmatum (Japanese Maple) Korean details
Description:
- Missing: korean_name, korean_description
- Source: Korea National Institute of Forest Science
- GBIF ID: 2878824
```

**Option B: Direct data contribution**
Add species to `data/species/[category].json`:
```json
{
  "id": "acer-palmatum",
  "scientific_name": "Acer palmatum",
  "korean_name": "일본단풍",
  "english_name": "Japanese maple",
  "plant_type": "deciduous_tree",
  "height_m": 5,
  "origin": "East Asia",
  "drought_tolerance": 3,
  "cold_tolerance": 5,
  "shade_tolerance": 4,
  "pollution_tolerance": 3,
  "korean_description": "봄과 가을의 색감이 뛰어난 단풍나무로...",
  "climate_zones": ["KR-5a", "KR-5b", "KR-6a"],
  "gbif_taxon_key": 2878824
}
```

### 2. Add relationships
Help us model companion planting, conflicts, and ecological roles.

Edit `data/relationships/companion_planting.json`:
```json
{
  "느티나무": [
    { "species": "팥배나무", "reason": "보색 꽃색 조합" },
    { "species": "말채나무", "reason": "중층 이용 효율" }
  ]
}
```

### 3. Improve documentation
- Fix typos in README, GETTING_STARTED, or API docs
- Add examples or tutorials
- Translate to other languages
- Create how-to guides

### 4. Report bugs
Found an issue?
```
Title: [BUG] validate-species fails on corrupted JSON
Description:
- Command: plantontology validate-species
- Error: JSONDecodeError in tropical_houseplants.json
- Expected: Validation report showing all files processed
- Python: 3.11, OS: macOS
```

### 5. Request features
```
Title: [FEATURE] Search by soil preference
Description:
I'd like to find all shade plants that prefer acidic soil.
plantontology search --shade --soil=acidic
```

---

## Development Setup

### 1. Fork & clone
```bash
git clone https://github.com/YOUR_USERNAME/PlantOntology.git
cd PlantOntology
git remote add upstream https://github.com/alexai-mcp/PlantOntology.git
```

### 2. Create a branch
```bash
git checkout -b feature/add-korean-natives
# or
git checkout -b fix/validate-species-encoding
```

### 3. Install with dev dependencies
```bash
pip install -e ".[dev]"
```

### 4. Make your changes
- Edit species files, schemas, or code
- Validate: `plantontology validate-species`
- Test: `pytest`

### 5. Commit (atomic commits)
```bash
git add data/species/korean_native_trees.json
git commit -m "data: add 5 Korean mountain tree species

- Abies holophylla (한계령가문비나무)
- Abies koreana (구상나무)
- Thuja koraiensis (금강잣나무)
- Larix olgensis (일본낙엽송)
- Pinus koraiensis (잣나무)

GBIF integration verified."
```

### 6. Push & create PR
```bash
git push origin feature/add-korean-natives
```

Then open a PR on GitHub with:
- **Title**: Clear, one-line description
- **Description**: What changed, why, and any relevant context
- **Checklist**:
  - [ ] Data validated (`plantontology validate-species`)
  - [ ] No duplicate IDs
  - [ ] 41-field schema complete
  - [ ] UTF-8 encoding correct
  - [ ] Commit message clear

---

## Data Quality Standards

### Required fields
```python
{
  "id": "unique-slug",
  "scientific_name": "Genus species",
  "korean_name": "한글 이름",
  "english_name": "Common name",
  "family": "Family name",
  "genus": "Genus",
  "plant_type": "deciduous_tree | evergreen_tree | shrub | ...",
  "origin": "Korean native | East Asia | Europe | ...",
  "height_m": number,
  "spread_m": number,
  "growth_rate": "slow | moderate | fast",
  "evergreen": boolean,
  "drought_tolerance": 1-5,  # 1=needs water, 5=very drought resistant
  "cold_tolerance": 1-5,
  "shade_tolerance": 1-5,
  "pollution_tolerance": 1-5,
  "maintenance_level": 1-5,  # 1=minimal, 5=intensive
  "korean_description": "한글 설명 (200-300자)",
  "climate_zones": ["KR-4b", "KR-5a"],
  "gbif_taxon_key": number or null
}
```

### Validation checklist
- [ ] All required fields present
- [ ] No null values in core fields
- [ ] Heights/spreads in realistic ranges
- [ ] Tolerance ratings 1-5
- [ ] Korean description present
- [ ] Climate zones valid (KR-4b through KR-8)
- [ ] GBIF key verified (if provided)

---

## Testing

### Validate species files
```bash
plantontology validate-species
```

### Run pytest
```bash
pytest tests/
```

### Check coverage
```bash
pytest --cov=plantontology
```

---

## Commit Message Convention

```
type: brief description (under 50 chars)

Longer explanation if needed (wrap at 72 chars).
Explain *what* and *why*, not *how*.

- Bullet points for multiple changes
- Include GBIF keys or sources

Fixes #123 (if applicable)
```

**Types:**
- `data:` — Add/update species or relationships
- `fix:` — Bug fixes
- `feat:` — New features
- `docs:` — Documentation updates
- `refactor:` — Code restructuring
- `test:` — Test additions/fixes

---

## Code of Conduct

- Be respectful and inclusive
- Ask questions if something is unclear
- Give credit to data sources and references
- No spam, harassment, or destructive behavior

---

## Recognition

Contributors are recognized in:
- `CONTRIBUTORS.md` (all contributors)
- GitHub contributors graph
- Monthly contributor highlights in discussions

---

## Questions?

- **How do I...?** → Check [GETTING_STARTED.md](GETTING_STARTED.md)
- **I found a bug** → Open a GitHub issue
- **I have an idea** → Start a discussion or open an issue
- **Technical help** → See [docs/ONTOLOGY.md](docs/ONTOLOGY.md)

We appreciate every contribution! 🌿
