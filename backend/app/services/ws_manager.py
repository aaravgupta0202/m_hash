"""Minimal in-memory pub/sub for simulation progress. Deliberately not Redis
or any message broker - a single-process FastAPI app only needs a dict."""
from collections import defaultdict

from fastapi import WebSocket


class SimulationConnectionManager:
    def __init__(self):
        self.connections: dict[int, list[WebSocket]] = defaultdict(list)

    async def connect(self, run_id: int, ws: WebSocket):
        await ws.accept()
        self.connections[run_id].append(ws)

    def disconnect(self, run_id: int, ws: WebSocket):
        if ws in self.connections.get(run_id, []):
            self.connections[run_id].remove(ws)

    async def broadcast(self, run_id: int, message: dict):
        dead = []
        for ws in self.connections.get(run_id, []):
            try:
                await ws.send_json(message)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(run_id, ws)


manager = SimulationConnectionManager()
