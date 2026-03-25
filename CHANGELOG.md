# Changelog

All notable changes to PlantOntology are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-25

### Added
- **Initial public release** of PlantOntology knowledge graph
- **10,888 plant species** across 45 curated datasets:
  - Korean native trees, shrubs, wildflowers (80+ species)
  - World ornamental, perennial, succulent, and alpine plants
  - Regional specialists: Americas, Europe, Africa, Asia, Middle East
  - Specialized categories: desert plants, aquatic species, medicinal herbs
- **OpenCrab 9-space semantic grammar**:
  - 9 semantic spaces: subject, resource, evidence, concept, claim, community, outcome, lever, policy
  - 40+ node types for plant domain modeling
  - 11 meta-edge relationship types
  - Plant-specific domain edges: COMPANION_OF, SUITABLE_FOR, GROWS_IN, SUSCEPTIBLE_TO
- **41-field canonical species schema** with:
  - Taxonomic data (scientific name, family, genus)
  - Korean and English common names
  - Morphological traits (height, spread, growth rate, evergreen status)
  - Ecological characteristics (drought, cold, shade, pollution tolerance)
  - Landscape use data (maintenance level, soil preference, climate zones)
  - Carbon sequestration estimates
  - GBIF integration keys
- **Data validation tools**:
  - `plantontology validate-species` — Validates all 45 JSON files
  - `plantontology manifest` — Displays OpenCrab grammar
  - `plantontology export-schema` — Exports canonical schema
- **CLI interface** with 6 commands:
  - validate-species, manifest, export-schema
  - validate-node, validate-meta-edge, validate-domain-edge
  - serve (MCP server for Claude Code)
- **MCP server integration** for Claude Code with 5 tools:
  - plant_search, companion_planting, climate_recommend
  - ecosystem_analysis, drought_resistant_list
- **REST API** (FastAPI) with endpoints:
  - /species/search, /species/{id}
  - /relationships/companions, /ecosystem/health-score
  - /recommend/climate-zone, /recommend/companion-planting
- **Neo4j graph database support** with:
  - Cypher schema definition
  - Automatic constraint creation
  - Relationship projection tools
- **Python SDK** (`pip install plantontology`):
  - JSONSpeciesStore for JSON file operations
  - Neo4jStore for graph queries
  - Query builders for companion planting, climate matching
- **Comprehensive documentation**:
  - GETTING_STARTED.md — Quick setup guide
  - CONTRIBUTING.md — How to contribute data and code
  - docs/ONTOLOGY.md — OpenCrab grammar deep dive
  - API reference (in progress)
- **Data enrichment pipeline**:
  - Schema normalization (41 canonical fields)
  - Deduplication (111 duplicate IDs removed)
  - Backup system for data changes
  - Quality assurance reports

### Technical Details
- Python 3.11+
- Neo4j 5.0+ (optional)
- FastAPI 0.115+
- MCP protocol compatible
- MIT License
- ~22MB data footprint

### Known Limitations
- Neo4j integration requires manual database setup
- Companion planting data is minimal (relationship expansion in v0.2)
- No web UI yet (REST API available)
- Korean climate zones limited to 8 zones (KR-4b to KR-8)

---

## [Unreleased]

### Planned for v0.2.0
- [ ] Expand companion planting relationships (1000+ edges)
- [ ] Web UI dashboard (species search, visualization)
- [ ] CSV import/export tools
- [ ] Bulk species data editor with validation
- [ ] Ecosystem health scoring algorithms
- [ ] Carbon sequestration calculator
- [ ] Korean landscaping regulations database

### Planned for v0.3.0
- [ ] Mobile app (React Native)
- [ ] Multi-language support (English, Korean, Japanese, Chinese)
- [ ] User accounts and favorite species lists
- [ ] Community contributions platform
- [ ] Integration with iNaturalist and GBIF APIs
- [ ] Real-time phenology data (flowering times, migration patterns)

---

## Versioning Notes

- **Major (x.0.0)**: Breaking schema changes, major API overhauls
- **Minor (0.x.0)**: New features, new species datasets, new tools
- **Patch (0.0.x)**: Bug fixes, data corrections, documentation

First stable release (1.0.0) targeted after community feedback and 500+ GitHub stars.

---

## Contributors

- **AlexLee** (alexlee_77886) — Founder, data curation, OpenCrab architecture
- **Contributors** — See [CONTRIBUTORS.md](CONTRIBUTORS.md)

Thank you to everyone contributing plant data and improving the knowledge graph! 🌿
