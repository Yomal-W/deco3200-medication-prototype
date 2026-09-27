import type { Dose, Prescription, PrescriptionChange } from '../types'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { user } from '../data/medications'
import { formatTime } from '../utils/time'
import { ScriptStatusPill } from './ScriptsScreen'

interface ScriptScreenProps {
  script: Prescription
  /** Today's routine, to show how the script appears in it. */
  doses: Dose[]
  change: PrescriptionChange | null
}

/**
 * One fictional prescription, read-only. It says plainly what it covers and
 * keeps the script's own directions apart from the routine's times of day,
 * which the script does not specify.
 */
export function ScriptScreen({ script, doses, change }: ScriptScreenProps) {
  const inRoutine = doses.flatMap((dose) =>
    dose.items
      .filter((item) => item.medicationId === script.medicationId)
      .map((item) => ({ dose, item })),
  )

  return (
    <div className="flow flow--wide">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">
            {script.medicationName} {script.strength}
          </h1>
          <p className="flow__subtitle">
            This script covers {script.medicationName} {script.strength} only.
          </p>
        </div>
        <ScriptStatusPill script={script} />
      </div>

      <section className="script-doc" aria-label="Prototype prescription">
        <p className="script-doc__banner">
          <Icon name="info" size={20} />
          Prototype prescription — not valid for dispensing.
        </p>
        <dl className="detail-rows">
          <div className="detail-row">
            <dt className="detail-row__label">Reference</dt>
            <dd className="detail-row__value">{script.reference}</dd>
          </div>
          <div className="detail-row">
            <dt className="detail-row__label">Patient</dt>
            <dd className="detail-row__value">{user.firstName}</dd>
          </div>
          <div className="detail-row">
            <dt className="detail-row__label">Medication</dt>
            <dd className="detail-row__value">
              {script.medicationName} {script.strength} {script.form}
            </dd>
          </div>
          <div className="detail-row">
            <dt className="detail-row__label">Directions</dt>
            <dd className="detail-row__value">{script.directions}</dd>
          </div>
          <div className="detail-row">
            <dt className="detail-row__label">Quantity</dt>
            <dd className="detail-row__value">{script.quantitySupplied}</dd>
          </div>
          <div className="detail-row">
            <dt className="detail-row__label">Repeats</dt>
            <dd className="detail-row__value">{script.repeats}</dd>
          </div>
          <div className="detail-row">
            <dt className="detail-row__label">Prescriber</dt>
            <dd className="detail-row__value">
              {script.prescriber.name} · {script.prescriber.role}
              <span className="detail-row__detail">{script.prescriber.practice}</span>
            </dd>
          </div>
          <div className="detail-row">
            <dt className="detail-row__label">Prescribed</dt>
            <dd className="detail-row__value">{script.prescribedOn}</dd>
          </div>
        </dl>
      </section>

      <div className="split split--equal">
        <Card>
          <h2 className="section-title">How your routine uses it</h2>
          <div className="change__compare change__compare--stacked">
            <div className="change__side">
              <p className="change__side-label">
                <Icon name="document" size={18} strokeWidth={2.4} />
                On the script
              </p>
              <p className="change__detail">{script.directions}</p>
            </div>
            <div className="change__arrow" aria-hidden="true">
              <Icon name="arrowDown" size={30} strokeWidth={2.4} />
            </div>
            <div className="change__side change__side--new">
              <p className="change__side-label">
                <Icon name="device" size={18} strokeWidth={2.4} />
                Shown in your {user.deviceName} routine as
              </p>
              {script.status === 'upcoming' ? (
                <p className="change__detail">
                  Not in your routine yet. From {script.startsOn}: {change?.newDetail}.
                </p>
              ) : (
                inRoutine.map(({ dose, item }) => (
                  <p key={dose.id} className="change__detail">
                    {formatTime(dose.scheduledMinutes)} · {dose.periodLabel}: {item.quantity},{' '}
                    {item.instruction.toLowerCase()}
                  </p>
                ))
              )}
            </div>
          </div>
          <p className="panel__note text-muted">
            Times of day come from your {user.deviceName} routine. They are not written on the
            script.
          </p>
        </Card>

        <div className="split__column">
          {script.status === 'upcoming' ? (
            <div className="fact">
              <Icon name="calendar" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">Starts</p>
                <p className="fact__value">{script.startsOn}</p>
                <p className="fact__detail">Verified, but not in effect yet.</p>
              </div>
            </div>
          ) : script.replacedOn ? (
            <div className="fact">
              <Icon name="calendar" size={26} className="fact__icon" />
              <div>
                <p className="fact__label">In use until</p>
                <p className="fact__value">{script.replacedOn}</p>
                <p className="fact__detail">A new script replaces it then.</p>
              </div>
            </div>
          ) : null}
          <div className="fact">
            <Icon name="shieldCheck" size={26} className="fact__icon" />
            <div>
              <p className="fact__label">Source</p>
              <p className="fact__value">Received by {user.pharmacy}</p>
              <p className="fact__detail">
                {user.scriptsReceivedOn} · checked by {user.pharmacist}, {user.routineVerifiedOn}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
