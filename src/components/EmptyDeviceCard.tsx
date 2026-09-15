import { Button } from './Button'
import { Card } from './Card'
import { StockCartridge } from './StockCartridge'
import { user } from '../data/medications'

interface EmptyDeviceCardProps {
  onLoad: () => void
  /** Tailored to the screen it appears on. */
  lead: string
}

/**
 * The starting state of every session: a device with nothing in it.
 *
 * Deliberately calm. Nothing has gone wrong and nobody has forgotten
 * anything — this is simply a device that has not been stocked yet.
 */
export function EmptyDeviceCard({ onLoad, lead }: EmptyDeviceCardProps) {
  return (
    <Card tone="accent" raised className="empty-state">
      <span className="empty-state__cartridges" aria-hidden="true">
        <StockCartridge level={undefined} height={120} />
        <StockCartridge level={undefined} height={120} />
        <StockCartridge level={undefined} height={120} />
      </span>

      <h1 className="empty-state__title">No medication loaded yet</h1>
      <p className="empty-state__lead">{lead}</p>

      <Button size="xl" icon="arrowRight" iconPosition="end" onClick={onLoad}>
        Load medication
      </Button>

      <p className="text-muted">Your pack comes ready from {user.pharmacy}.</p>
    </Card>
  )
}
