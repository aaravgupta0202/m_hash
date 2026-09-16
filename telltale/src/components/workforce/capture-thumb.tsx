/**
 * PRD §7.4: capture thumbnails are generated placeholders. Never an image of
 * anyone's actual screen, including our own.
 *
 * Everything below is drawn from the capture's committed seed — an abstract
 * window with chrome, a toolbar and content blocks. There is no text content in
 * it, because §7.5 excludes message bodies, file contents and typed text even
 * as mock data. The application name and the timestamp are metadata and are
 * shown in the caption, outside the frame.
 */

function lcg(seed: number) {
  let s = (seed % 2147483647) || 1;
  return () => {
    s = (s * 48271) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const PALETTES: [string, string][] = [
  ["#efeaf8", "#d9d0ee"],
  ["#eaf2ee", "#d3e6dc"],
  ["#f2eee7", "#e5dbcb"],
  ["#eceef6", "#d7dbeb"],
];

export function CaptureThumb({
  seed,
  aspect = "aspect-16/10",
  chrome = true,
}: {
  seed: number;
  aspect?: string;
  chrome?: boolean;
}) {
  const rand = lcg(seed);
  const [from, to] = PALETTES[Math.floor(rand() * PALETTES.length)];
  const cols = 2 + Math.floor(rand() * 2);
  const blocks = Array.from({ length: cols * 3 }, () => ({
    w: 30 + rand() * 60,
    h: 4 + rand() * 9,
    o: 0.12 + rand() * 0.3,
  }));
  const gid = `cap-${seed}`;

  return (
    <div className={`${aspect} w-full overflow-hidden rounded-sm border border-line bg-white`}>
      <svg viewBox="0 0 320 200" className="size-full" role="img" aria-label="Generated placeholder capture">
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <rect width="320" height="200" fill={`url(#${gid})`} />

        {chrome && (
          <>
            <rect x="14" y="14" width="292" height="172" rx="3" fill="#fff" fillOpacity="0.72" />
            <rect x="14" y="14" width="292" height="16" rx="3" fill="var(--tt-purple)" fillOpacity="0.1" />
            {[24, 34, 44].map((cx) => (
              <circle key={cx} cx={cx} cy="22" r="2.6" fill="var(--tt-grey)" fillOpacity="0.35" />
            ))}
            <rect x="60" y="18.5" width="90" height="7" rx="3.5" fill="var(--tt-grey)" fillOpacity="0.2" />
            <rect x="14" y="30" width="72" height="156" fill="var(--tt-purple)" fillOpacity="0.05" />
          </>
        )}

        {blocks.map((b, i) => {
          const col = i % cols;
          const rowIndex = Math.floor(i / cols);
          const x = 96 + col * (200 / cols);
          const y = 44 + rowIndex * 44;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={Math.min(b.w, 200 / cols - 10)}
              height={b.h}
              rx="2"
              fill="var(--tt-ink)"
              fillOpacity={b.o}
            />
          );
        })}
        {Array.from({ length: 5 }, (_, i) => (
          <rect
            key={`s${i}`}
            x="22"
            y={42 + i * 18}
            width={40 + (i % 3) * 8}
            height="6"
            rx="3"
            fill="var(--tt-purple)"
            fillOpacity="0.16"
          />
        ))}
      </svg>
    </div>
  );
}
