import type { Dose, HospitalStay, PrescriptionChange } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { MedicationVisualBox } from '../components/MedicationVisual'
import { PrototypeNote } from '../components/PrototypeNote'
import { medications, user } from '../data/medications'
import { allergies, gpPhone, passportPerson, prescribers } from '../data/passport'
import { doseSummary } from '../utils/dose'
import { lastTakenDose, takenRecordLabel } from '../utils/hospital'
import { illustrationLabel } from '../utils/medication'
import { formatTime, joinNames, keepTogether } from '../utils/time'

interface PassportScreenProps {
  /** False until the device has been stocked in activity 1. */
  stocked: boolean
  doses: Dose[]
  nextDose: Dose | null
  change: PrescriptionChange | null
  hospital: HospitalStay | null
  clock: number
  onShowStaff: () => void
  onSendToPhone: () => void
  onOpenHospital: () => void
  onReturnFromHospital: () => void
  onLoadMedication: () => void
}

/**
 * Extending the system beyond the home: the verified routine, ready to show
 * whoever needs it outside the home — a paramedic, a hospital or a new doctor.
 * Built entirely from the records MediFlow already holds, so there is nothing
 * to fill in, and it is always up to date.
 */
export function PassportScreen({
  stocked,
  doses,
  nextDose,
  change,
  hospital,
  clock,
  onShowStaff,
  onSendToPhone,
  onOpenHospital,
  onReturnFromHospital,
  onLoadMedication,
}: PassportScreenProps) {
  const lastTaken = lastTakenDose(doses)

  return (
    <div className="passport stack stack-6">
      <div className="screen-head">
        <div className="screen-head__titles">
          <h1>Your medication passport</h1>
          <p className="text-muted">Show this to a paramedic, hospital or new doctor.</p>
        </div>
      </div>

      {!stocked ? (
        <Card>
          <div className="next-up">
            <span className="next-up__icon" aria-hidden="true">
              <Icon name="passport" size={26} />
            </span>
            <div className="next-up__body">
              <p className="next-up__label">Nothing here yet</p>
              <p className="next-up__value">
                Your passport fills in once your medication is loaded.
              </p>
            </div>
          </div>
          <Button className="away-card__action" icon="arrowRight" iconPosition="end" onClick={onLoadMedication}>
            Load medication
          </Button>
        </Card>
      ) : (
        <>
          <Card className="passport-id feature">
            <div className="passport-id__top">
              <span className="passport-id__icon" aria-hidden="true">
                <Icon name="passport" size={34} />
              </span>
              <div className="passport-id__who">
                <p className="passport-id__name">{passportPerson.fullName}</p>
                <p className="passport-id__born">Born {passportPerson.dateOfBirth}</p>
              </div>
            </div>
            <ul className="passport-id__facts">
              <li>
                <Icon name="clock" size={22} />
                <span>
                  Up to date as of {keepTogether(formatTime(clock))}, {keepTogether(user.today)}
                </span>
              </li>
              <li>
                <Icon name="shieldCheck" size={22} />
                <span>
                  Checked by {user.pharmacist}, Pharmacist, {user.pharmacy} on{' '}
                  {keepTogether(user.routineVerifiedOn)}
                </span>
              </li>
            </ul>
            <div className="screen-actions passport-id__actions">
              <Button size="xl" icon="person" onClick={onShowStaff}>
                Show to staff
              </Button>
              <Button size="xl" variant="secondary" icon="phone" onClick={onSendToPhone}>
                Send to my phone
              </Button>
            </div>
          </Card>

          <HospitalCard
            hospital={hospital}
            onOpenHospital={onOpenHospital}
            onReturnFromHospital={onReturnFromHospital}
          />

          <div className="passport__columns">
            <Card>
              <h2 className="section-title">
                Current medications{' '}
                <span className="passport__count">· {medications.length}</span>
              </h2>
              <ul className="passport-meds">
                {medications.map((medication) => {
                  const changing = change?.medicationId === medication.id
                  return (
                    <li key={medication.id} className="passport-meds__row">
                      <MedicationVisualBox
                        appearance={medication.appearance}
                        label={illustrationLabel(medication)}
                      />
                      <div className="passport-meds__body">
                        <p className="passport-meds__name">
                          {medication.name} {medication.strength}
                        </p>
                        <p className="passport-meds__how">
                          1 {medication.form} · {joinNames(medication.times)}
                        </p>
                        <p className="passport-meds__why">{medication.plainPurpose}</p>
                        {changing ? (
                          <p className="passport-meds__change">
                            <Icon name="swap" size={18} />
                            Changing to {change.newStrength} from {change.startsLabel.toLowerCase()}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </Card>

            <div className="split__column">
              <Card>
                <h2 className="section-title">Today</h2>
                <dl className="detail-rows">
                  <div className="detail-row">
                    <dt className="detail-row__label">Last taken</dt>
                    <dd className="detail-row__value">
                      {lastTaken ? (
                        <>
                          {formatTime(lastTaken.scheduledMinutes)} · {lastTaken.periodLabel}
                          <span className="detail-row__detail">
                            {doseSummary(lastTaken)}
                          </span>
                          <span className="detail-row__detail">{takenRecordLabel(lastTaken)}</span>
                        </>
                      ) : (
                        'No doses confirmed yet today'
                      )}
                    </dd>
                  </div>
                  <div className="detail-row">
                    <dt className="detail-row__label">Next due</dt>
                    <dd className="detail-row__value">
                      {nextDose ? (
                        <>
                          {formatTime(nextDose.scheduledMinutes)} · {nextDose.periodLabel}
                          <span className="detail-row__detail">{doseSummary(nextDose)}</span>
                        </>
                      ) : (
                        'Nothing else today'
                      )}
                    </dd>
                  </div>
                </dl>
                <p className="panel__note passport__honest">
                  <Icon name="info" size={18} />
                  <span>Based on what you confirmed in {user.deviceName}.</span>
                </p>
              </Card>

              <Card className="passport-allergy">
                <h2 className="section-title">
                  <Icon name="alert" size={24} className="passport__title-icon" />
                  Allergies
                </h2>
                <ul className="passport-list">
                  {allergies.map((allergy) => (
                    <li key={allergy.substance}>
                      <strong>{allergy.substance}</strong> · {allergy.reaction}
                    </li>
                  ))}
                </ul>
              </Card>

              {change ? (
                <Card>
                  <h2 className="section-title">Recent changes</h2>
                  <p className="passport__change">
                    {change.medicationName} {change.previousSummary} → {change.newSummary}
                  </p>
                  <p className="text-muted passport__change-detail">
                    Starts {change.startsDetail} · changed by {change.changedBy.name}
                  </p>
                </Card>
              ) : null}

              <Card>
                <h2 className="section-title">Contacts</h2>
                <dl className="detail-rows">
                  {prescribers().map((prescriber) => (
                    <div key={prescriber.name} className="detail-row">
                      <dt className="detail-row__label">{prescriber.role}</dt>
                      <dd className="detail-row__value">
                        {prescriber.name}
                        <span className="detail-row__detail">
                          {prescriber.practice}
                          {prescriber.role === 'GP' ? (
                            <>
                              {' · '}
                              <span className="passport__phone">{gpPhone}</span>
                            </>
                          ) : null}
                        </span>
                      </dd>
                    </div>
                  ))}
                  <div className="detail-row">
                    <dt className="detail-row__label">Pharmacy</dt>
                    <dd className="detail-row__value">
                      {user.pharmacy}
                      <span className="detail-row__detail">
                        {user.pharmacist} ·{' '}
                        <span className="passport__phone">{user.pharmacyPhone}</span>
                      </span>
                    </dd>
                  </div>
                </dl>
              </Card>
            </div>
          </div>
        </>
      )}

      <PrototypeNote>Prototype only — not a real medical record. Phone numbers are not real.</PrototypeNote>
    </div>
  )
}

interface HospitalCardProps {
  hospital: HospitalStay | null
  onOpenHospital: () => void
  onReturnFromHospital: () => void
}

/** The way into the hospital flow, and where it stands. */
function HospitalCard({ hospital, onOpenHospital, onReturnFromHospital }: HospitalCardProps) {
  const status = hospital?.status ?? null

  if (status === 'returned' && hospital) {
    return (
      <Card tone="success">
        <div className="next-up">
          <span className="next-up__icon" aria-hidden="true">
            <Icon name="checkCircle" size={26} />
          </span>
          <div className="next-up__body">
            <p className="next-up__label">Back from hospital</p>
            <p className="next-up__value">
              Home at {formatTime(hospital.returnedAtMinutes ?? 0)} · you checked with your
              pharmacist at {hospital.checkedAt}
            </p>
          </div>
        </div>
      </Card>
    )
  }

  const copy =
    status === 'away'
      ? { label: 'In hospital', value: 'MediFlow is paused while you’re away' }
      : status === 'returning'
        ? { label: 'Welcome home', value: 'Check with your pharmacist before restarting' }
        : status === 'planning'
          ? { label: 'Going to hospital', value: 'Finish getting ready' }
          : { label: 'Going to hospital?', value: 'Get ready in a few simple steps' }

  return (
    <Card tone={status === 'away' || status === 'returning' ? 'accent' : 'sunken'}>
      <div className="next-up">
        <span className="next-up__icon" aria-hidden="true">
          <Icon name="hospital" size={26} />
        </span>
        <div className="next-up__body">
          <p className="next-up__label">{copy.label}</p>
          <p className="next-up__value">{copy.value}</p>
        </div>
      </div>
      <div className="screen-actions away-card__action">
        {status === 'away' ? (
          <Button size="lg" variant="secondary" icon="home" onClick={onReturnFromHospital}>
            I&rsquo;m back home
          </Button>
        ) : (
          <Button
            size="lg"
            variant="secondary"
            icon={status ? 'arrowRight' : 'hospital'}
            iconPosition={status ? 'end' : 'start'}
            onClick={onOpenHospital}
          >
            {status === 'returning'
              ? 'Finish coming home'
              : status === 'planning'
                ? 'Continue getting ready'
                : 'I’m going to hospital'}
          </Button>
        )}
      </div>
    </Card>
  )
}
