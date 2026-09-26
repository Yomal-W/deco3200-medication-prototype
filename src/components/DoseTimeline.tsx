import type { Dose } from '../types'
import { formatTime } from '../utils/time'
import { doseSummary, travelRecordLines } from '../utils/dose'
import { DoseStatusPill } from './DoseStatusPill'
import { Icon } from './Icon'
import type { IconName } from './Icon'

const dayPartIcon: Record<Dose['dayPart'], IconName> = {
  'early-morning': 'sunrise',
  morning: 'sun',
  afternoon: 'sun',
  evening: 'moon',
}

function markerFor(dose: Dose): { modifier: string; icon: IconName } {
  if (dose.status === 'completed') return { modifier: 'completed', icon: 'check' }
  if (dose.travel) return { modifier: 'upcoming', icon: 'suitcase' }
  if (dose.status === 'missed') return { modifier: 'missed', icon: 'alert' }
  if (dose.status === 'due') return { modifier: 'due', icon: dose.dispensedAt ? 'device' : 'clock' }
  return { modifier: 'upcoming', icon: dayPartIcon[dose.dayPart] }
}

interface DoseTimelineProps {
  doses: Dose[]
  /** The first dose still ahead of the user. */
  nextDoseId: string | null
  /** The dose the device is currently offering. */
  activeDoseId: string | null
  onSelect: (doseId: string) => void
}

/**
 * Today's routine at a glance: what is done, what is due, what is later.
 * Every completed dose shows what the device recorded, which is what makes
 * "did I already take it?" answerable.
 */
export function DoseTimeline({ doses, nextDoseId, activeDoseId, onSelect }: DoseTimelineProps) {
  return (
    <ol className="timeline">
      {doses.map((dose) => {
        const marker = markerFor(dose)
        return (
          <li key={dose.id}>
            <button
              type="button"
              className={`timeline__row${dose.id === activeDoseId ? ' is-current' : ''}`}
              onClick={() => onSelect(dose.id)}
            >
              <span className="timeline__time">{formatTime(dose.scheduledMinutes)}</span>
              <span className={`timeline__marker timeline__marker--${marker.modifier}`} aria-hidden="true">
                <Icon name={marker.icon} size={18} strokeWidth={2.4} />
              </span>
              <span className="timeline__content">
                <span className="timeline__heading">
                  <span className="timeline__title">{dose.periodLabel}</span>
                  <DoseStatusPill dose={dose} isNext={dose.id === nextDoseId} />
                </span>
                <span className="timeline__detail">{doseSummary(dose)}</span>
                {dose.travel ? (
                  <span className="timeline__record">
                    {travelRecordLines(dose).map((line) => (
                      <span key={line.text} className="timeline__record-line">
                        <Icon name={line.icon} size={17} />
                        {line.text}
                      </span>
                    ))}
                  </span>
                ) : dose.dispensedAt ? (
                  <span className="timeline__record">
                    <span className="timeline__record-line">
                      <Icon name="device" size={17} />
                      Dispensed {dose.dispensedAt}
                    </span>
                    <span className="timeline__record-line">
                      <Icon name={dose.confirmedAt ? 'person' : 'clock'} size={17} />
                      {dose.confirmedAt
                        ? `You confirmed ${dose.confirmedAt}`
                        : 'Waiting for you to confirm'}
                    </span>
                  </span>
                ) : null}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
