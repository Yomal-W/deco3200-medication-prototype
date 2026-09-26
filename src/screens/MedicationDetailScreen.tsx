import type { Medication, PrescriptionChange, StockLevel } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { MedicationVisualBox } from '../components/MedicationVisual'
import { StatusPill } from '../components/StatusPill'
import { StockCompartment } from '../components/StockCompartment'
import { user } from '../data/medications'
import { illustrationLabel } from '../utils/medication'
import { stockLabel, stockStatus, stockStatusLabel } from '../utils/stock'
import { joinNames } from '../utils/time'

interface MedicationDetailScreenProps {
  medication: Medication
  level: StockLevel | undefined
  restockRequestedAt: string | null
  change: PrescriptionChange | null
  onBack: () => void
  onRequestRestock: () => void
  onOpenChange: () => void
}

/**
 * One medication in the routine. Deliberately not a drug encyclopaedia — no
 * side effects, interactions or advice.
 *
 * At a glance it answers: what is it, when do I take it, why, who put it on
 * my routine, how much is left, and is there anything I need to do.
 */
export function MedicationDetailScreen({
  medication,
  level,
  restockRequestedAt,
  change,
  onBack,
  onRequestRestock,
  onOpenChange,
}: MedicationDetailScreenProps) {
  const status = stockStatus(level)
  const low = status === 'low'
  const requested = restockRequestedAt !== null
  const changing = change?.medicationId === medication.id
  const prescriber = medication.prescribedBy

  return (
    <div className="flow flow--full">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">{medication.name}</h1>
          <p className="flow__subtitle">
            {medication.strength} · 1 {medication.form}
          </p>
        </div>
        {low ? (
          <StatusPill tone="low" icon="alert">
            Low stock
          </StatusPill>
        ) : changing ? (
          <StatusPill tone="attention" icon="swap">
            Changing tomorrow
          </StatusPill>
        ) : null}
      </div>

      <div className="split">
        <Card className={`detail-side${low ? ' detail-side--low' : ''}`}>
          <section className="stock-panel" aria-labelledby="stock-panel-label">
            <h2 id="stock-panel-label" className="stock-panel__label">
              Left in {user.deviceName}
            </h2>
            <div className="stock-panel__main">
              <StockCompartment appearance={medication.appearance} level={level} height={150} />
              <div className="stock-panel__figures">
                <p className="stock-panel__count">{stockLabel(level)}</p>
                <p className="stock-panel__status">
                  <Icon name={low ? 'alert' : status === 'empty' ? 'info' : 'checkCircle'} size={20} />
                  {stockStatusLabel(status)}
                </p>
                {level && level.capacity > 0 ? (
                  <p className="stock-panel__capacity">Holds {level.capacity} doses when full</p>
                ) : null}
              </div>
            </div>

            {low && !requested ? (
              <Button size="lg" block icon="refresh" onClick={onRequestRestock}>
                Ask pharmacy to restock
              </Button>
            ) : null}

            {low && requested ? (
              <p className="restock-confirmation">
                <Icon name="checkCircle" size={24} className="restock-confirmation__icon" />
                <span>
                  <span className="restock-confirmation__title">
                    Restock requested at {restockRequestedAt}
                  </span>
                  <span className="restock-confirmation__detail">
                    {user.pharmacy} has been notified. The request stays here until it arrives.
                  </span>
                </span>
              </p>
            ) : null}
          </section>

          <div className="appearance-row">
            <MedicationVisualBox
              appearance={medication.appearance}
              label={illustrationLabel(medication)}
            />
            <div>
              <p className="appearance-row__title">What it looks like</p>
              <p className="appearance-note">
                <Icon name="info" size={18} />
                <span>Illustrative appearance — your medication may look different.</span>
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <dl className="detail-rows">
            <div className="detail-row">
              <dt className="detail-row__label">When</dt>
              <dd className="detail-row__value">{joinNames(medication.times)}</dd>
            </div>
            <div className="detail-row">
              <dt className="detail-row__label">How to take</dt>
              <dd className="detail-row__value">
                1 {medication.form} · {medication.instruction}
              </dd>
            </div>
            <div className="detail-row">
              <dt className="detail-row__label">What for</dt>
              <dd className="detail-row__value">{medication.plainPurpose}</dd>
            </div>
            <div className="detail-row">
              <dt className="detail-row__label">Prescribed by</dt>
              <dd className="detail-row__value">
                {prescriber.name} · {prescriber.role}
                <span className="detail-row__detail">{prescriber.practice}</span>
              </dd>
            </div>
            <div className="detail-row">
              <dt className="detail-row__label">Verified by</dt>
              <dd className="detail-row__value">
                {user.pharmacist} · Pharmacist
                <span className="detail-row__detail">{user.pharmacy}</span>
              </dd>
            </div>
          </dl>

          <div className="screen-actions detail-actions">
            {changing ? (
              <Button size="lg" icon="swap" onClick={onOpenChange}>
                See what is changing
              </Button>
            ) : null}
            <Button size="lg" variant="secondary" icon="arrowLeft" onClick={onBack}>
              Back to medications
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
