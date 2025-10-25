from fastapi import FastAPI, Body
from fastapi.middleware.cors import CORSMiddleware
from grid import Grid
from typing import  Dict, Any

app = FastAPI()

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEFAULT_N = 1
WIDTH = 50
HEIGHT = 50


def _generate_grids(n = DEFAULT_N, width=WIDTH, height=HEIGHT) :
    out=[]
    for _ in range(n):
        g = Grid(width, height)
        g.randomise()
        out.append(g.as_list())
    return out


def _payload_to_grids(payload):
    """Normalize incoming payload to a list of Grid objects.

    Supports:
      - {"grids": [grid2D, ...]}
      - {"grid": grid2D}
      - {"grid_0": grid2D, "grid_1": grid2D, ...}
    """
    if not payload:
        return []
    if isinstance(payload.get("grids"), list):
        return [Grid.from_list(g) for g in payload["grids"]]
    if "grid" in payload:
        return [Grid.from_list(payload["grid"])]
    keyed = [k for k in payload.keys() if isinstance(k, str) and k.startswith("grid_")]
    if keyed:
        try:
            ordered = sorted(keyed, key=lambda s: int(s.split("_")[1]))
        except Exception:
            ordered = sorted(keyed)
        return [Grid.from_list(payload[k]) for k in ordered]
    # Fallback: try interpreting payload itself as a single grid
    try:
        return [Grid.from_list(payload)]
    except Exception:
        return []


@app.post("/grid")
def post_grids(payload: Dict[str, Any] = Body(default=None)):
    # If a payload is provided, rehydrate into Grid objects, optionally modify, then return.
    if payload:
        grids = _payload_to_grids(payload)
        [grid.mutate() for grid in grids]

        # Example: modify grids here if needed
        # for g in grids: g.randomise()
        return {"grids": [g.as_list() for g in grids]}

    # No payload: generate n grids
    return {"grids": _generate_grids(DEFAULT_N)}
