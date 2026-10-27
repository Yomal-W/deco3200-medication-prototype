import type { Dose, PrescriptionChange } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { QrPattern } from '../components/QrPattern'
import { medications, user } from '../data/medications'
import { allergies, passportPerson } from '../data/passport'
import { doseMedicationNames } from '../utils/dose'
import { lastTakenDose, takenRecordLabel } from '../utils/hospital'
import { formatTime, joinNames, keepTogether } from '../utils/time'

/** "For your blood sugar" → "Blood sugar", the way a clinician would scan it. */
function purposeLabel(plainPurpose: string): string {
  const purpose = plainPurpose.replace(/^For your /, '')
  return purpose.charAt(0).toUpperCase() + purpose.slice(1)
}

interface PassportStaffScreenProps {
  doses: Dose[]
  change: PrescriptionChange | null
  clock: number
  onDone: () => void
}

/**
 * The passport turned around for someone else to read: a paramedic, a nurse
 * or a hospital pharmacist. No navigation and no choices — just the facts
 * they ask for, large enough to read at arm's length.
 */
export function PassportStaffScreen({ doses, change, clock, onDone }: PassportStaffScreenProps) {
  const lastTaken = lastTakenDose(doses)

  return (
    <div className="flow flow--full passport-staff">
      <div className="flow__intro">
        <div>
          <p className="flow__eyebrow">Medication passport · for hospital and emergency staff</p>
          <h1 className="flow__title">{passportPerson.fullName}</h1>
          <p className="flow__subtitle">
            Born {keepTogether(passportPerson.dateOfBirth)} · up to date as of{' '}
            {keepTogether(formatTime(clock))}, {keepTogether(user.today)}
          </p>
        </div>
      </div>

      <div className="passport-staff__layout">
        <Card>
          <table className="passport-table">
            <caption className="passport-table__caption">
              Current medications · checked by {user.pharmacist}, Pharmacist, {user.pharmacy} on{' '}
              {user.routineVerifiedOn}
            </caption>
            <thead>
              <tr>
                <th scope="col">Medication</th>
                <th scope="col">Dose</th>
                <th scope="col">When</th>
                <th scope="col">For</th>
              </tr>
            </thead>
            <tbody>
              {medications.map((medication) => (
                <tr key={medication.id}>
                  <th scope="row">
                    {medication.name}{' '}
                    <span className="passport-table__nowrap">{medication.strength}</span>
                    {change?.medicationId === medication.id ? (
                      <span className="passport-table__note">
                        {change.newStrength} from {change.startsDetail}
                      </span>
                    ) : null}
                  </th>
                  <td className="passport-table__nowrap">1 {medication.form}</td>
                  <td>
                    {medication.times.map((time) => (
                      <span key={time} className="passport-table__time">
                        {time}
                      </span>
                    ))}
                  </td>
                  <td>{purposeLabel(medication.plainPurpose)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        <div className="split__column">
          <Card className="passport-allergy">
            <h2 className="section-title">
              <Icon name="alert" size={24} className="passport__title-icon" />
              Allergies
            </h2>
            <ul className="passport-list passport-list--large">
              {allergies.map((allergy) => (
                <li key={allergy.substance}>
                  <strong>{allergy.substance}</strong> · {allergy.reaction}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h2 className="section-title">Last taken</h2>
            {lastTaken ? (
              <>
                <p className="passport-staff__fact">
                  {formatTime(lastTaken.scheduledMinutes)} · {joinNames(doseMedicationNames(lastTaken))}
                </p>
                <p className="text-muted">{takenRecordLabel(lastTaken)}</p>
              </>
            ) : (
              <p className="passport-staff__fact">No doses confirmed yet today</p>
            )}
            <p className="panel__note passport__honest">
              <Icon name="info" size={18} />
              <span>
                Self-reported in {user.deviceName}. It records what was dispensed and what the
                patient confirmed, not that a dose was swallowed.
              </span>
            </p>
          </Card>

          <Card className="passport-qr">
            <QrPattern />
            <div>
              <p className="passport-qr__title">
                <Icon name="qr" size={22} />
                Scan to view
              </p>
              <p className="text-muted">Prototype — this code is not real and holds no data.</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="screen-actions">
        <Button size="xl" icon="check" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  )
}
