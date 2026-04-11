"""PlantOntology API — FastAPI entry point."""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api.routers import recommend
from api.routers import species as species_router
from api.routers import supplementary

app = FastAPI(
    title="PlantOntology API",
    description="Open-source plant knowledge graph — right plant, right place",
    version="0.1.0",
    docs_url="/docs",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(species_router.router, prefix="/species", tags=["Species"])
app.include_router(recommend.router, prefix="/recommend", tags=["Recommendations"])
app.include_router(supplementary.router, prefix="/api", tags=["Supplementary"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.get("/api")
async def api_root():
    return {
        "name": "PlantOntology",
        "version": "0.1.0",
        "docs": "/docs",
        "github": "https://github.com/alexai-mcp/PlantOntology",
    }


# ── 빌드된 프론트엔드 정적 서빙 (Railway / 프로덕션) ──────────────────
# API 라우트 등록 후 맨 마지막에 마운트해야 /api/* 라우트가 우선된다.
_frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
if os.path.exists(_frontend_dist):
    app.mount("/", StaticFiles(directory=_frontend_dist, html=True), name="frontend")
