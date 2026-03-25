# Getting Started with PlantOntology

Welcome! This guide will help you set up PlantOntology and run your first queries.

## Installation

### Prerequisites
- Python 3.11+
- Neo4j 5.0+ (optional, for full functionality)
- 500MB disk space (for species data)

### Step 1: Clone the repository
```bash
git clone https://github.com/alexai-mcp/PlantOntology.git
cd PlantOntology
```

### Step 2: Install dependencies
```bash
pip install -e .
```

Or for development:
```bash
pip install -e ".[dev]"
```

### Step 3: Verify installation
```bash
plantontology manifest
```

This displays the OpenCrab grammar and validates your setup.

---

## Your First Query

### 1. Validate species data
```bash
plantontology validate-species
```

Output shows:
- 45 species files
- 10,888 species records
- 0 errors ✓

### 2. List a few species
```python
from plantontology.stores.json import JSONSpeciesStore

store = JSONSpeciesStore()
species = store.search("maple")
for s in species[:5]:
    print(f"{s.scientific_name} ({s.korean_name})")
```

### 3. Use the MCP server (Claude Code integration)
```bash
plantontology serve
```

Then use Claude Code to query:
```
@plantontology plant_search "느티나무"
```

---

## Common Tasks

### Export species for a specific region
```python
from plantontology.stores.json import JSONSpeciesStore

store = JSONSpeciesStore()
korean_natives = [s for s in store.all() if s.origin == "Korean native"]
print(f"Found {len(korean_natives)} Korean native plants")
```

### Find companion plants
```python
# Coming soon: relationship queries
# query: "느티나무와 함께 심으면 좋은 수종 추천"
# result: companion planting suggestions
```

### Check climate compatibility
```python
# Coming soon: climate zone matching
# query: "서울(KR-6a) 기후에서 자라는 상록수 20종"
```

---

## Documentation

- **[API Reference](docs/API.md)** — Complete REST API documentation
- **[OpenCrab Grammar](docs/ONTOLOGY.md)** — 9-space semantic structure
- **[Contributing Guide](CONTRIBUTING.md)** — How to add data or features
- **[Neo4j Setup](docs/NEO4J_SETUP.md)** — Full database setup instructions

---

## Troubleshooting

### "Neo4j unavailable"
Neo4j is optional. The system works in "dry-run" mode without it. To enable:
1. Install Neo4j (community edition free)
2. Set `NEO4J_URI=bolt://localhost:7687` in `.env`
3. Run: `python scripts/seed_neo4j.py`

### "ModuleNotFoundError: plantontology"
Install in development mode:
```bash
pip install -e .
```

### "JSON decode error"
Make sure all species files are UTF-8 encoded (they should be by default).

---

## Next Steps

1. **Explore the data**: Browse `data/species/` to see what's available
2. **Read the ontology**: Check `docs/ONTOLOGY.md` to understand the 9-space structure
3. **Contribute**: See `CONTRIBUTING.md` for how to add species or relationships
4. **Build with it**: Use the Python SDK or REST API in your own projects

---

## Questions?

- Open a GitHub issue for bugs or feature requests
- Check [Discussions](https://github.com/alexai-mcp/PlantOntology/discussions) for Q&A
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development questions

Happy planting! 🌿
