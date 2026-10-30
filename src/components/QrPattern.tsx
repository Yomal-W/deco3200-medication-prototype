/*
 * A drawing that looks like a QR code, for the passport's "scan to view"
 * panel. Nothing is encoded in it and it cannot be scanned: the pattern is a
 * fixed, seeded scatter of squares with the three corner markers a real code
 * has, so it reads as a code without pretending to be one.
 */

const SIZE = 25
const FINDER = 7

/** Small, fixed pseudo-random sequence, so the pattern is the same on every render. */
function seeded(seed: number): () => number {
  let value = seed
  return () => {
    value = (value * 1103515245 + 12345) % 2147483648
    return value / 2147483648
  }
}

function inFinder(x: number, y: number): boolean {
  const near = (n: number, start: number) => n >= start && n < start + FINDER + 1
  return (
    (near(x, 0) && near(y, 0)) ||
    (near(x, SIZE - FINDER - 1) && near(y, 0)) ||
    (near(x, 0) && near(y, SIZE - FINDER - 1))
  )
}

function modules(): string {
  const random = seeded(4103)
  let path = ''
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      if (!inFinder(x, y) && random() > 0.52) path += `M${x} ${y}h1v1h-1z`
    }
  }
  return path
}

const PATTERN = modules()

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <>
      <rect x={x + 0.5} y={y + 0.5} width={FINDER - 1} height={FINDER - 1} fill="none" stroke="currentColor" />
      <rect x={x + 2} y={y + 2} width={FINDER - 4} height={FINDER - 4} fill="currentColor" />
    </>
  )
}

export function QrPattern() {
  return (
    <svg
      className="qr-pattern"
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="-2" y="-2" width={SIZE + 4} height={SIZE + 4} fill="#fff" />
      <path d={PATTERN} fill="currentColor" />
      <Finder x={0} y={0} />
      <Finder x={SIZE - FINDER} y={0} />
      <Finder x={0} y={SIZE - FINDER} />
    </svg>
  )
}
