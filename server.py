from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from main import Grid
from typing import Any, Dict, List, Union

app = FastAPI()

# Allow cross-origin requests (CORS)
# Adjust `origins` to the specific domains you trust in production
origins = [
    "*",  # Permissive for development; replace with specific origins in prod
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

def _generate_grids(n: int = 3, width: int = 30, height: int = 30) -> List[List[List[int]]]:
    # Generate n empty grids; adjust to use main.randomise if desired
    out = []
    for _ in range(n):
        g = Grid(width, height)
        out.append(g.as_list())
    return out


@app.post("/grid")
def post_grids(payload = Body(default=None)):

    if payload:
        if "grids" in payload and isinstance(payload["grids"], list):
            return {"grids": payload["grids"]}

        keyed = [k for k in payload.keys() if k.startswith("grid_")]
        if keyed:
            try:
                grids = [payload[k] for k in sorted(keyed, key=lambda s: int(s.split("_")[1]))]
            except Exception:
                grids = [payload[k] for k in sorted(keyed)]
            return {"grids": grids}

    return {"grids": _generate_grids(3)}
