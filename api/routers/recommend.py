"""Recommendation engine — companion planting, climate-adaptive selection."""

from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


class RecommendRequest(BaseModel):
    base_species_id: Optional[str] = None
    climate_zone: Optional[str] = None
    soil_type: Optional[str] = None
    landscape_use: Optional[str] = None
    maintenance_level_max: int = 5
    limit: int = 10


class SpeciesSummary(BaseModel):
    id: str
    korean_name: str
    scientific_name: str
    plant_type: str
    relationship_type: Optional[str] = None
    score: Optional[int] = None
    notes_ko: Optional[str] = None


@router.post("/companion", response_model=list[SpeciesSummary])
async def companion_planting(req: RecommendRequest):
    """
    추천 동반식재 수종.

    기준 수종을 입력하면 함께 심기 좋은 수종을 반환합니다.
    Neo4j COMPANION_OF 관계 기반.
    """
    # TODO: Neo4j query
    # MATCH (base:Species {id: $base_id})-[r:COMPANION_OF]->(companion:Species)
    # RETURN companion, r ORDER BY r.strength DESC LIMIT $limit
    return []


@router.get("/by-climate", response_model=list[SpeciesSummary])
async def recommend_by_climate(
    zone: str = Query(..., description="기후존 코드 (e.g. KR-6a)"),
    plant_type: Optional[str] = Query(None, description="교목|관목|지피|초화"),
    use: Optional[str] = Query(None, description="조경 활용처"),
    limit: int = 10,
):
    """
    기후존에 적합한 수종 추천.

    지역/기후 조건에 맞는 수종을 적합도 순으로 반환합니다.
    """
    # TODO: Neo4j query
    # MATCH (s:Species)-[r:SUITABLE_FOR]->(c:ClimateZone {code: $zone})
    # WHERE s.plant_type = $type
    # RETURN s, r ORDER BY r.score DESC LIMIT $limit
    return []


@router.get("/drought-resistant", response_model=list[SpeciesSummary])
async def drought_resistant(
    min_tolerance: int = Query(4, ge=1, le=5),
    plant_type: Optional[str] = None,
    limit: int = 20,
):
    """
    내건성 수종 목록.

    기후변화 적응형 드라이가든, 절수 조경용 수종을 반환합니다.
    """
    # TODO: Neo4j query
    # MATCH (s:Species)
    # WHERE s.drought_tolerance >= $min_tolerance
    # RETURN s ORDER BY s.drought_tolerance DESC, s.carbon_sequestration_kg_yr DESC
    return []
