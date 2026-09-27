import { useId, useState } from 'react'
import type { Dose } from '../types'
import { getMedication, user } from '../data/medications'
import { Button } from './Button'

interface DoseDetailsProps {
  dose: Dose
}

/**
 * Extra information about a dose, shown only when asked for. Opening and
 * closing it never changes the dose itself.
 */
export function DoseDetails({ dose }: DoseDetailsProps) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <div className="dose-details">
      <Button
        variant="quiet"
        icon={open ? 'close' : 'help'}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? 'Hide details' : 'More about this dose'}
      </Button>

      {open ? (
        <div id={panelId} className="dose-details__panel">
          {dose.items.map((item) => {
            const medication = getMedication(item.medicationId)
            return (
              <section key={item.medicationId} className="dose-details__medication">
                <h2 className="dose-details__name">
                  {medication.name} {medication.strength}
                </h2>
                <dl className="detail-rows">
                  <div className="detail-row">
                    <dt className="detail-row__label">What for</dt>
                    <dd className="detail-row__value">{medication.plainPurpose}</dd>
                  </div>
                  <div className="detail-row">
                    <dt className="detail-row__label">How much</dt>
                    <dd className="detail-row__value">{item.quantity}</dd>
                  </div>
                  <div className="detail-row">
                    <dt className="detail-row__label">When</dt>
                    <dd className="detail-row__value">{medication.scheduleSummary}</dd>
                  </div>
                  <div className="detail-row">
                    <dt className="detail-row__label">How to take</dt>
                    <dd className="detail-row__value">{medication.instruction}</dd>
                  </div>
                  <div className="detail-row">
                    <dt className="detail-row__label">Prescribed by</dt>
                    <dd className="detail-row__value">
                      {medication.prescribedBy.name} · {medication.prescribedBy.role}
                    </dd>
                  </div>
                </dl>
              </section>
            )
          })}
          <p className="dose-details__verified">
            Routine verified by {user.pharmacist}, {user.pharmacy} · {user.routineVerifiedOn}
          </p>
        </div>
      ) : null}
    </div>
  )
}
