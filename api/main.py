"""PlantOntology API — FastAPI entry point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import species, recommend, plan, ecosystem

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

app.include_router(species.router, prefix="/species", tags=["Species"])
app.include_router(recommend.router, prefix="/recommend", tags=["Recommendations"])
app.include_router(plan.router, prefix="/plan", tags=["Planting Plans"])
app.include_router(ecosystem.router, prefix="/ecosystem", tags=["Ecosystem"])


@app.get("/")
async def root():
    return {
        "name": "PlantOntology",
        "version": "0.1.0",
        "docs": "/docs",
        "github": "https://github.com/alexai-mcp/PlantOntology",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}
