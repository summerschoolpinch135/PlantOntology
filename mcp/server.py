"""PlantOntology MCP Server — Claude Code integration."""

import asyncio
import json
import os
from typing import Any

from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent

from neo4j import AsyncGraphDatabase

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "password")

server = Server("plantontology")
driver = AsyncGraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))


@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="plant_search",
            description="수종을 이름(국명, 학명, 영명)으로 검색합니다. Search plants by Korean, scientific, or English name.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "검색어 (예: 느티나무, Zelkova, Japanese Zelkova)"},
                    "limit": {"type": "integer", "default": 10},
                },
                "required": ["query"],
            },
        ),
        Tool(
            name="companion_planting",
            description="특정 수종과 함께 심기 좋은 동반식재 수종을 추천합니다. Get companion planting recommendations.",
            inputSchema={
                "type": "object",
                "properties": {
                    "species_id": {"type": "string", "description": "기준 수종 ID (예: zelkova-serrata)"},
                    "limit": {"type": "integer", "default": 5},
                },
                "required": ["species_id"],
            },
        ),
        Tool(
            name="climate_recommend",
            description="기후존과 용도에 맞는 수종을 추천합니다. Recommend species for a climate zone and landscape use.",
            inputSchema={
                "type": "object",
                "properties": {
                    "climate_zone": {"type": "string", "description": "기후존 코드 (예: KR-6a = 서울/경기)"},
                    "landscape_use": {"type": "string", "description": "활용처: street-tree|park|garden|rooftop|hedge"},
                    "plant_type": {"type": "string", "description": "수종 타입: 교목|관목|지피|초화"},
                    "limit": {"type": "integer", "default": 10},
                },
                "required": [],
            },
        ),
        Tool(
            name="ecosystem_analysis",
            description="식재 목록의 생태적 건강도와 다양성을 분석합니다. Analyze ecological health of a planting list.",
            inputSchema={
                "type": "object",
                "properties": {
                    "species_ids": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "분석할 수종 ID 목록",
                    },
                },
                "required": ["species_ids"],
            },
        ),
        Tool(
            name="drought_resistant_list",
            description="내건성 수종 목록을 반환합니다. 기후변화 적응 조경, 드라이가든용.",
            inputSchema={
                "type": "object",
                "properties": {
                    "min_tolerance": {"type": "integer", "default": 4, "description": "내건성 최소 등급 (1-5)"},
                    "plant_type": {"type": "string", "description": "교목|관목|지피|초화 (optional)"},
                },
            },
        ),
    ]


@server.call_tool()
async def call_tool(name: str, arguments: dict[str, Any]) -> list[TextContent]:
    async with driver.session() as session:

        if name == "plant_search":
            query = arguments["query"]
            limit = arguments.get("limit", 10)
            result = await session.run(
                """
                CALL db.index.fulltext.queryNodes('species_search', $query)
                YIELD node, score
                RETURN node.id AS id,
                       node.korean_name AS korean_name,
                       node.scientific_name AS scientific_name,
                       node.english_name AS english_name,
                       node.plant_type AS plant_type,
                       node.description_ko AS description_ko,
                       score
                ORDER BY score DESC LIMIT $limit
                """,
                query=query,
                limit=limit,
            )
            records = [dict(r) async for r in result]
            return [TextContent(type="text", text=json.dumps(records, ensure_ascii=False, indent=2))]

        elif name == "companion_planting":
            species_id = arguments["species_id"]
            limit = arguments.get("limit", 5)
            result = await session.run(
                """
                MATCH (base:Species {id: $id})-[r:COMPANION_OF]->(companion:Species)
                RETURN companion.id AS id,
                       companion.korean_name AS korean_name,
                       companion.scientific_name AS scientific_name,
                       r.benefit_type AS benefit_type,
                       r.strength AS strength,
                       r.notes_ko AS notes_ko
                ORDER BY r.strength DESC LIMIT $limit
                """,
                id=species_id,
                limit=limit,
            )
            records = [dict(r) async for r in result]
            return [TextContent(type="text", text=json.dumps(records, ensure_ascii=False, indent=2))]

        elif name == "climate_recommend":
            zone = arguments.get("climate_zone", "KR-all")
            use = arguments.get("landscape_use")
            plant_type = arguments.get("plant_type")
            limit = arguments.get("limit", 10)

            cypher = """
                MATCH (s:Species)-[r:SUITABLE_FOR]->(c:ClimateZone {code: $zone})
                WHERE ($plant_type IS NULL OR s.plant_type = $plant_type)
                RETURN s.id AS id,
                       s.korean_name AS korean_name,
                       s.scientific_name AS scientific_name,
                       s.plant_type AS plant_type,
                       r.score AS score
                ORDER BY r.score DESC LIMIT $limit
            """
            result = await session.run(cypher, zone=zone, plant_type=plant_type, limit=limit)
            records = [dict(r) async for r in result]
            return [TextContent(type="text", text=json.dumps(records, ensure_ascii=False, indent=2))]

        elif name == "drought_resistant_list":
            min_tol = arguments.get("min_tolerance", 4)
            plant_type = arguments.get("plant_type")
            result = await session.run(
                """
                MATCH (s:Species)
                WHERE s.drought_tolerance >= $min_tol
                  AND ($plant_type IS NULL OR s.plant_type = $plant_type)
                RETURN s.id, s.korean_name, s.scientific_name, s.plant_type,
                       s.drought_tolerance, s.carbon_sequestration_kg_yr
                ORDER BY s.drought_tolerance DESC, s.carbon_sequestration_kg_yr DESC
                LIMIT 50
                """,
                min_tol=min_tol,
                plant_type=plant_type,
            )
            records = [dict(r) async for r in result]
            return [TextContent(type="text", text=json.dumps(records, ensure_ascii=False, indent=2))]

    return [TextContent(type="text", text="[]")]


async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())


if __name__ == "__main__":
    asyncio.run(main())
