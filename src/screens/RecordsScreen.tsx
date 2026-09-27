import type { Prescription, PrescriptionChange } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { StatusPill } from '../components/StatusPill'
import { user } from '../data/medications'

interface RecordsScreenProps {
  stocked: boolean
  prescriptions: Prescription[]
  change: PrescriptionChange | null
  changeAcknowledgedAt: string | null
  onViewScripts: () => void
  onViewScript: (reference: string) => void
  onLoadMedication: () => void
}

/**
 * "What is my routine based on?" Read-only: nothing here dispenses, records,
 * acknowledges or changes anything. View Script leads; changes and status
 * are kept deliberately quieter.
 */
export function RecordsScreen({
  stocked,
  prescriptions,
  change,
  changeAcknowledgedAt,
  onViewScripts,
  onViewScript,
  onLoadMedication,
}: RecordsScreenProps) {
  const current = prescriptions.filter((script) => script.status === 'current')
  const upcoming = prescriptions.filter((script) => script.status === 'upcoming')
  // The script in use now, which the change will replace.
  const replaced = current.find((script) => script.medicationId === change?.medicationId)

  return (
    <div className="stack stack-6">
      <div className="screen-head">
        <div className="screen-head__titles">
          <h1>Records</h1>
          <p className="text-muted">View the information behind your medication routine.</p>
        </div>
      </div>

      {!stocked ? (
        <Card>
          <div className="next-up">
            <span className="next-up__icon" aria-hidden="true">
              <Icon name="document" size={26} />
            </span>
            <div className="next-up__body">
              <p className="next-up__label">Nothing here yet</p>
              <p className="next-up__value">
                Your prescription information arrives with your pharmacy pack.
              </p>
            </div>
          </div>
          <Button className="away-card__action" icon="arrowRight" iconPosition="end" onClick={onLoadMedication}>
            Load medication
          </Button>
        </Card>
      ) : (
        <>
          <button type="button" className="records-primary" onClick={onViewScripts}>
            <span className="records-primary__icon" aria-hidden="true">
              <Icon name="document" size={34} />
            </span>
            <span className="records-primary__body">
              <span className="records-primary__title">View script</span>
              <span className="records-primary__detail">
                The prescriptions your routine is based on · {current.length} scripts
              </span>
            </span>
            <Icon name="arrowRight" size={28} />
          </button>

          <div className="records-secondary">
            <Card>
              <h2 className="section-title">Recent changes</h2>
              {change ? (
                <div className="records-change">
                  <div className="records-change__head">
                    <p className="records-change__what">
                      {change.medicationName} {replaced?.strength} → {change.newStrength}
                    </p>
                    <StatusPill tone="attention" icon="clock">
                      Starts later
                    </StatusPill>
                  </div>
                  <dl className="detail-rows">
                    <div className="detail-row">
                      <dt className="detail-row__label">Starts</dt>
                      <dd className="detail-row__value">
                        {change.startsDetail}
                        <span className="detail-row__detail">
                          Until then your routine stays at {change.previousSummary}.
                        </span>
                      </dd>
                    </div>
                    <div className="detail-row">
                      <dt className="detail-row__label">Changed by</dt>
                      <dd className="detail-row__value">
                        {change.changedBy.name} · {change.changedBy.role}
                      </dd>
                    </div>
                    <div className="detail-row">
                      <dt className="detail-row__label">Verified by</dt>
                      <dd className="detail-row__value">
                        {user.pharmacist} · {user.pharmacy}
                        <span className="detail-row__detail">{change.verifiedAt}</span>
                      </dd>
                    </div>
                    <div className="detail-row">
                      <dt className="detail-row__label">Reviewed</dt>
                      <dd className="detail-row__value">
                        {changeAcknowledgedAt
                          ? `You reviewed this at ${changeAcknowledgedAt}`
                          : 'Not reviewed yet'}
                      </dd>
                    </div>
                  </dl>
                  {upcoming[0] ? (
                    <Button
                      variant="quiet"
                      icon="document"
                      onClick={() => onViewScript(upcoming[0].reference)}
                    >
                      View the new script
                    </Button>
                  ) : null}
                </div>
              ) : (
                <p className="text-muted">No recent changes to your prescriptions.</p>
              )}
            </Card>

            <Card>
              <h2 className="section-title">Prescription status</h2>
              <dl className="detail-rows">
                <div className="detail-row">
                  <dt className="detail-row__label">Covers</dt>
                  <dd className="detail-row__value">
                    {current.length} scripts, one for each medication in your routine
                    {upcoming.length > 0 ? (
                      <span className="detail-row__detail">
                        Plus {upcoming.length} new script that has not started yet
                      </span>
                    ) : null}
                  </dd>
                </div>
                <div className="detail-row">
                  <dt className="detail-row__label">Received by</dt>
                  <dd className="detail-row__value">
                    {user.pharmacy}
                    <span className="detail-row__detail">{user.scriptsReceivedOn}</span>
                  </dd>
                </div>
                <div className="detail-row">
                  <dt className="detail-row__label">Checked by</dt>
                  <dd className="detail-row__value">
                    {user.pharmacist} · Pharmacist
                    <span className="detail-row__detail">{user.routineVerifiedOn}</span>
                  </dd>
                </div>
              </dl>
              <p className="panel__note text-muted">
                This is what your pharmacist checked on {user.routineVerifiedOn}. {user.deviceName}{' '}
                does not check prescriptions itself.
              </p>
            </Card>
          </div>
        </>
      )}

      <p className="flow__note">
        <Icon name="info" size={20} className="flow__note-icon" />
        <span>
          {user.deviceName} cannot change your prescription. Only your doctor can, and your
          pharmacist updates your routine.
        </span>
      </p>
    </div>
  )
}
