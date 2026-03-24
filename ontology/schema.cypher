// ============================================================
// PlantOntology — Neo4j Schema
// Node types, relationship types, constraints, indexes
// ============================================================

// ------------------------------------------------------------
// CONSTRAINTS (run once on fresh DB)
// ------------------------------------------------------------

CREATE CONSTRAINT species_id IF NOT EXISTS
  FOR (s:Species) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT climate_zone_code IF NOT EXISTS
  FOR (c:ClimateZone) REQUIRE c.code IS UNIQUE;

CREATE CONSTRAINT soil_type_id IF NOT EXISTS
  FOR (s:SoilType) REQUIRE s.id IS UNIQUE;

CREATE CONSTRAINT pest_id IF NOT EXISTS
  FOR (p:Pest) REQUIRE p.id IS UNIQUE;

CREATE CONSTRAINT ecological_role_id IF NOT EXISTS
  FOR (e:EcologicalRole) REQUIRE e.id IS UNIQUE;

CREATE CONSTRAINT landscape_use_id IF NOT EXISTS
  FOR (l:LandscapeUse) REQUIRE l.id IS UNIQUE;

CREATE CONSTRAINT regulation_id IF NOT EXISTS
  FOR (r:Regulation) REQUIRE r.id IS UNIQUE;

// ------------------------------------------------------------
// INDEXES
// ------------------------------------------------------------

CREATE INDEX species_korean_name IF NOT EXISTS
  FOR (s:Species) ON (s.korean_name);

CREATE INDEX species_scientific_name IF NOT EXISTS
  FOR (s:Species) ON (s.scientific_name);

CREATE INDEX species_english_name IF NOT EXISTS
  FOR (s:Species) ON (s.english_name);

CREATE FULLTEXT INDEX species_search IF NOT EXISTS
  FOR (s:Species) ON EACH [s.korean_name, s.scientific_name, s.english_name, s.description_ko];

// ------------------------------------------------------------
// NODE: Species (수종)
// ------------------------------------------------------------
/*
Properties:
  id              String  — unique slug (e.g., "zelkova-serrata")
  scientific_name String  — 학명 (e.g., "Zelkova serrata")
  korean_name     String  — 국명 (e.g., "느티나무")
  english_name    String  — 영명 (e.g., "Japanese Zelkova")
  family          String  — 과명 (e.g., "Ulmaceae")
  genus           String  — 속명
  plant_type      String  — 교목|관목|지피|초화|덩굴|수생
  origin          String  — 자생|도입|원예품종
  height_min_m    Float   — 최소 수고(m)
  height_max_m    Float   — 최대 수고(m)
  spread_min_m    Float   — 최소 수관폭(m)
  spread_max_m    Float   — 최대 수관폭(m)
  growth_rate     String  — slow|medium|fast
  evergreen       Boolean — 상록 여부
  flowering_months List   — 개화월 [3,4,5]
  fruit_months    List    — 결실월
  fall_color      String  — 단풍색
  drought_tolerance  Int  — 내건성 1–5
  cold_hardiness     Int  — 내한성 1–5 (USDA zone 기반)
  shade_tolerance    Int  — 내음성 1–5
  pollution_tolerance Int  — 내공해성 1–5
  maintenance_level  Int  — 관리난이도 1–5
  carbon_sequestration_kg_yr Float — 탄소흡수량(kg/년)
  description_ko  String  — 한국어 설명
  description_en  String  — 영문 설명
  image_url       String  — 대표 이미지 URL
  gbif_taxon_key  Integer — GBIF taxon key
  created_at      DateTime
  updated_at      DateTime
*/

// ------------------------------------------------------------
// NODE: ClimateZone (기후존)
// ------------------------------------------------------------
/*
Properties:
  code            String  — e.g., "KR-6a" (한국 중부)
  name_ko         String  — 중부 내륙
  koppen_class    String  — Dwa, Cfa 등
  avg_min_temp_c  Float   — 최저 평균기온
  avg_max_temp_c  Float   — 최고 평균기온
  annual_precip_mm Float  — 연강수량
  frost_days      Int     — 서리 일수
  region_ko       String  — 대표 지역명
*/

// ------------------------------------------------------------
// NODE: SoilType (토양)
// ------------------------------------------------------------
/*
Properties:
  id        String  — sandy|loamy|clay|rocky|peat|saline
  name_ko   String  — 사질토|양토|점토|암반|이탄|염분토
  ph_min    Float
  ph_max    Float
  drainage  String  — well|moderate|poor
*/

// ------------------------------------------------------------
// NODE: Pest (병해충)
// ------------------------------------------------------------
/*
Properties:
  id          String
  name_ko     String
  name_sci    String
  pest_type   String  — insect|fungal|bacterial|viral
  severity    Int     — 심각도 1–5
  treatment   String  — 방제 방법
*/

// ------------------------------------------------------------
// NODE: EcologicalRole (생태 기능)
// ------------------------------------------------------------
/*
Properties:
  id       String  — e.g., "bird-habitat", "pollinator-support"
  name_ko  String
  category String  — wildlife|carbon|water|soil|microclimate
*/

// ------------------------------------------------------------
// NODE: LandscapeUse (조경 활용처)
// ------------------------------------------------------------
/*
Properties:
  id       String  — street-tree|park|garden|rooftop|screen|hedge
  name_ko  String
*/

// ------------------------------------------------------------
// RELATIONSHIP TYPES
// ------------------------------------------------------------

/*
(Species)-[:COMPANION_OF {
  benefit_type: String,    — nitrogen-fixing|pest-deterrent|aesthetic|shade
  strength:     Int,       — 시너지 강도 1–5
  notes_ko:     String
}]->(Species)

(Species)-[:CONFLICTS_WITH {
  conflict_type: String,   — allelopathy|competition|disease-spread
  severity:      Int,      — 1–5
  notes_ko:      String
}]->(Species)

(Species)-[:SUITABLE_FOR {
  score:   Int             — 적합도 1–5
}]->(ClimateZone)

(Species)-[:GROWS_IN {
  score:   Int
}]->(SoilType)

(Species)-[:SUSCEPTIBLE_TO {
  risk_level: Int
}]->(Pest)

(Species)-[:PROVIDES {
  quality: Int
}]->(EcologicalRole)

(Species)-[:USED_IN {
  score:   Int,
  notes_ko: String
}]->(LandscapeUse)

(Species)-[:SIMILAR_AESTHETIC_TO]->(Species)

(Species)-[:REQUIRED_BY]->(Regulation)
*/

// ------------------------------------------------------------
// SAMPLE DATA — 느티나무 (Zelkova serrata)
// ------------------------------------------------------------

MERGE (z:Species {id: "zelkova-serrata"})
SET z += {
  scientific_name: "Zelkova serrata",
  korean_name: "느티나무",
  english_name: "Japanese Zelkova",
  family: "Ulmaceae",
  genus: "Zelkova",
  plant_type: "교목",
  origin: "자생",
  height_min_m: 15.0,
  height_max_m: 26.0,
  spread_min_m: 10.0,
  spread_max_m: 20.0,
  growth_rate: "medium",
  evergreen: false,
  flowering_months: [4, 5],
  fall_color: "황갈색",
  drought_tolerance: 4,
  cold_hardiness: 5,
  shade_tolerance: 2,
  pollution_tolerance: 4,
  maintenance_level: 2,
  carbon_sequestration_kg_yr: 21.8,
  description_ko: "한국 자생 낙엽 교목. 수관이 넓고 웅장하여 가로수, 공원 주수로 널리 사용. 단풍이 아름답고 내공해성 강함. 수명 1,000년 이상. 천연기념물 지정 개체 다수.",
  gbif_taxon_key: 2890359
};

MERGE (k:ClimateZone {code: "KR-all"})
SET k += {name_ko: "한국 전역", koppen_class: "Dwa/Cfa"};

MERGE (loam:SoilType {id: "loamy"})
SET loam += {name_ko: "양토", ph_min: 6.0, ph_max: 7.5, drainage: "well"};

MERGE (street:LandscapeUse {id: "street-tree"})
SET street += {name_ko: "가로수"};

MERGE (park:LandscapeUse {id: "park-focal"})
SET park += {name_ko: "공원 주수"};

MERGE (carbon:EcologicalRole {id: "carbon-sequestration"})
SET carbon += {name_ko: "탄소흡수", category: "carbon"};

MERGE (bird:EcologicalRole {id: "bird-habitat"})
SET bird += {name_ko: "조류 서식처", category: "wildlife"};

MATCH (z:Species {id: "zelkova-serrata"}), (k:ClimateZone {code: "KR-all"})
MERGE (z)-[:SUITABLE_FOR {score: 5}]->(k);

MATCH (z:Species {id: "zelkova-serrata"}), (loam:SoilType {id: "loamy"})
MERGE (z)-[:GROWS_IN {score: 5}]->(loam);

MATCH (z:Species {id: "zelkova-serrata"}), (street:LandscapeUse {id: "street-tree"})
MERGE (z)-[:USED_IN {score: 5, notes_ko: "내공해성 강, 수관 넓어 그늘 우수"}]->(street);

MATCH (z:Species {id: "zelkova-serrata"}), (carbon:EcologicalRole {id: "carbon-sequestration"})
MERGE (z)-[:PROVIDES {quality: 4}]->(carbon);
