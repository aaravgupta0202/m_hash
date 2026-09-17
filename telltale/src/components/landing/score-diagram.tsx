/**
 * A hand-drawn diagram of the one mechanic the product turns on: signed
 * contributions summed into a logit, passed through a logistic curve, out
 * as a probability. Not a stock hero illustration — it's the same shape
 * as the contribution table on an investigation page, just abstracted.
 */
export function ScoreDiagram() {
  return (
    <svg
      viewBox="0 0 420 190"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="Signed contributions sum into a logit, which passes through a logistic curve to produce a probability"
    >
      <line x1="14" y1="96" x2="132" y2="96" stroke="var(--tt-line)" strokeWidth="1" />
      <rect x="20" y="66" width="18" height="30" rx="2" fill="var(--tt-purple)" fillOpacity="0.75" />
      <rect x="50" y="96" width="18" height="16" rx="2" fill="var(--tt-red)" fillOpacity="0.55" />
      <rect x="80" y="58" width="18" height="38" rx="2" fill="var(--tt-purple)" fillOpacity="0.9" />
      <rect x="110" y="78" width="18" height="18" rx="2" fill="var(--tt-purple)" fillOpacity="0.55" />

      <text x="152" y="102" fontSize="24" fill="var(--tt-ink)" className="machine">
        Σ
      </text>

      <path
        d="M178 96 H206"
        stroke="var(--tt-grey)"
        strokeWidth="1.5"
        markerEnd="url(#arrow)"
      />

      <rect x="214" y="20" width="130" height="140" rx="3" fill="none" stroke="var(--tt-line)" strokeWidth="1" />
      <path
        d="M222 138 C 248 138 250 42 336 42"
        fill="none"
        stroke="var(--tt-purple)"
        strokeWidth="2.25"
        strokeLinecap="round"
      />

      <path
        d="M352 90 H380"
        stroke="var(--tt-grey)"
        strokeWidth="1.5"
        markerEnd="url(#arrow)"
      />

      <rect x="386" y="68" width="0" height="0" />
      <g>
        <rect x="380" y="66" width="34" height="48" rx="3" fill="var(--tt-purple-lt)" stroke="var(--tt-purple)" strokeOpacity="0.3" />
        <text x="397" y="94" fontSize="10.5" textAnchor="middle" fill="var(--tt-purple-dk)" className="machine" fontWeight="700">
          72%
        </text>
      </g>

      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--tt-grey)" />
        </marker>
      </defs>
    </svg>
  );
}
