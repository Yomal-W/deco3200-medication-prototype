import type { TravelOutcome } from '../types'
import { Button } from './Button'
import type { IconName } from './Icon'

const choices: { outcome: TravelOutcome; label: string; icon: IconName }[] = [
  { outcome: 'taken', label: 'I took it', icon: 'check' },
  { outcome: 'in-case', label: 'It’s still in my travel case', icon: 'suitcase' },
  { outcome: 'unsure', label: 'I’m not sure', icon: 'help' },
]

interface TravelReportProps {
  /** What the user has already said, if anything. */
  outcome: TravelOutcome | null
  onReport: (outcome: TravelOutcome) => void
  /** Visible question, so each group is labelled for assistive technology. */
  label: string
}

/**
 * The user's own account of a dose that went out in the travel case. The
 * chosen answer is shown with a tick and filled button, never colour alone.
 */
export function TravelReport({ outcome, onReport, label }: TravelReportProps) {
  return (
    <div className="travel-report" role="group" aria-label={label}>
      {choices.map((choice) => {
        const selected = choice.outcome === outcome
        return (
          <Button
            key={choice.outcome}
            size="lg"
            variant={selected ? 'primary' : 'secondary'}
            icon={selected ? 'checkCircle' : choice.icon}
            aria-pressed={selected}
            onClick={() => onReport(choice.outcome)}
          >
            {choice.label}
          </Button>
        )
      })}
    </div>
  )
}
