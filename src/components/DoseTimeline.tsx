import { useId, useState } from 'react'
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
  if (dose.status === 'in-hospital') return { modifier: 'upcoming', icon: 'hospital' }
  if (dose.status === 'sick-day') return { modifier: 'upcoming', icon: 'thermometer' }
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
 *
 * Each time of day is a short row — time, status and name — that opens to
 * show its medications and what the device recorded, which is what makes
 * "did I already take it?" answerable. Rows start closed so the list reads
 * quickly; the full dose screen is one more tap away from an open row.
 */
export function DoseTimeline({ doses, nextDoseId, activeDoseId, onSelect }: DoseTimelineProps) {
  const id = useId()
  const [open, setOpen] = useState<Set<string>>(() => new Set())

  const toggle = (doseId: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(doseId)) next.delete(doseId)
      else next.add(doseId)
      return next
    })

  return (
    <ol className="timeline">
      {doses.map((dose) => {
        const marker = markerFor(dose)
        const expanded = open.has(dose.id)
        const panelId = `${id}-${dose.id}`
        return (
          <li
            key={dose.id}
            className={`timeline__item${dose.id === activeDoseId ? ' is-current' : ''}${
              dose.status === 'completed' ? ' timeline__row--completed' : ''
            }${expanded ? ' is-open' : ''}`}
          >
            <button
              type="button"
              className="timeline__row"
              aria-expanded={expanded}
              aria-controls={panelId}
              onClick={() => toggle(dose.id)}
            >
              <span className="timeline__time">{formatTime(dose.scheduledMinutes)}</span>
              <span className={`timeline__marker timeline__marker--${marker.modifier}`} aria-hidden="true">
                <Icon name={marker.icon} size={18} strokeWidth={2.4} />
              </span>
              <span className="timeline__heading">
                <span className="timeline__title">{dose.periodLabel}</span>
                <DoseStatusPill dose={dose} isNext={dose.id === nextDoseId} />
              </span>
              <Icon name="chevronDown" size={22} className="timeline__chevron" />
            </button>

            <div id={panelId} className="timeline__panel" hidden={!expanded}>
              <p className="timeline__detail">{doseSummary(dose)}</p>
              {dose.travel ? (
                <p className="timeline__record">
                  {travelRecordLines(dose).map((line) => (
                    <span key={line.text} className="timeline__record-line">
                      <Icon name={line.icon} size={17} />
                      {line.text}
                    </span>
                  ))}
                </p>
              ) : dose.dispensedAt ? (
                <p className="timeline__record">
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
                </p>
              ) : null}
              <button type="button" className="timeline__open" onClick={() => onSelect(dose.id)}>
                View dose
                <Icon name="arrowRight" size={18} />
              </button>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
