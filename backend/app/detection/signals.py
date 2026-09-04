from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class DeviationSignal:
    """A single piece of behavioral evidence, application-agnostic.

    The detection engine never knows it is looking at 'Gmail' or 'Finance' -
    it only knows an application label, an event type, and how far a value
    strays from the user's own baseline.
    """

    signal_type: str
    severity: str  # LOW / MEDIUM / HIGH / CRITICAL
    score: float  # 0-1 raw deviation strength, pre-context
    reason: str
    application: Optional[str] = None
    event_id: Optional[int] = None
    occurred_at: Optional[datetime] = None
    dedupe_key: Optional[str] = None
    resource_id: Optional[str] = None
    resource_type: Optional[str] = None

    contextualized: bool = False
    context_note: Optional[str] = None
    adjusted_score: Optional[float] = None

    def effective_score(self) -> float:
        return self.adjusted_score if self.adjusted_score is not None else self.score
