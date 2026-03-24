"""Seed Neo4j with initial PlantOntology dataset."""

import os
import json
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")


def load_schema(driver):
    schema_path = Path(__file__).parent.parent / "ontology" / "schema.cypher"
    cypher = schema_path.read_text(encoding="utf-8")
    # Execute each statement
    statements = [s.strip() for s in cypher.split(";") if s.strip() and not s.strip().startswith("//") and not s.strip().startswith("/*")]
    with driver.session() as session:
        for stmt in statements:
            try:
                session.run(stmt)
                print(f"  ✓ {stmt[:60]}...")
            except Exception as e:
                print(f"  ✗ {e}: {stmt[:60]}")


def seed_species(driver):
    species_dir = Path(__file__).parent.parent / "data" / "species"
    if not species_dir.exists():
        print("  No species data files found. Add JSON files to data/species/")
        return
    for json_file in species_dir.glob("*.json"):
        data = json.loads(json_file.read_text(encoding="utf-8"))
        species_list = data if isinstance(data, list) else [data]
        with driver.session() as session:
            for sp in species_list:
                session.run(
                    "MERGE (s:Species {id: $id}) SET s += $props",
                    id=sp["id"],
                    props=sp,
                )
        print(f"  ✓ Loaded {len(species_list)} species from {json_file.name}")


def main():
    print(f"Connecting to Neo4j at {NEO4J_URI}...")
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    try:
        print("\n[1/2] Loading schema & sample data...")
        load_schema(driver)
        print("\n[2/2] Seeding species data...")
        seed_species(driver)
        print("\n✅ PlantOntology seed complete!")
    finally:
        driver.close()


if __name__ == "__main__":
    main()
