import type { Inventory, PrescriptionChange } from '../types'
import { EmptyDeviceCard } from '../components/EmptyDeviceCard'
import { Icon } from '../components/Icon'
import { MedicationVisualBox } from '../components/MedicationVisual'
import { StatusPill } from '../components/StatusPill'
import { StockCartridge } from '../components/StockCartridge'
import { medications, user } from '../data/medications'
import { stockLabel, stockStatus } from '../utils/stock'
import { countLabel } from '../utils/time'

interface MedicationsScreenProps {
  stocked: boolean
  onLoadMedication: () => void
  inventory: Inventory
  restockRequestedAt: string | null
  change: PrescriptionChange | null
  onOpenMedication: (medicationId: string) => void
}

/**
 * The current routine in one place — the single list that replaces old labels
 * and notes from different health professionals. It is also where a
 * medication running low has to be noticed, so stock sits on every card
 * rather than only on the one that needs attention.
 */
export function MedicationsScreen({
  stocked,
  onLoadMedication,
  inventory,
  restockRequestedAt,
  change,
  onOpenMedication,
}: MedicationsScreenProps) {
  if (!stocked) {
    return (
      <div className="today--empty">
        <EmptyDeviceCard
          onLoad={onLoadMedication}
          lead={`There are no medications in ${user.deviceName} yet. Load your pack and they will be listed here.`}
        />
      </div>
    )
  }

  return (
    <div className="stack stack-5">
      <div className="screen-head">
        <div className="screen-head__titles">
          <h1>Your medications</h1>
          <p className="text-muted">
            {countLabel(medications.length)} · verified by {user.pharmacist} on{' '}
            {user.routineVerifiedOn}
          </p>
        </div>
      </div>

      <ul className="med-grid">
        {medications.map((medication) => {
          const level = inventory[medication.id]
          const status = stockStatus(level)
          const changing = change?.medicationId === medication.id
          const requested = status === 'low' && restockRequestedAt !== null

          return (
            <li key={medication.id}>
              <button
                type="button"
                className={`med-card${status === 'low' ? ' med-card--low' : ''}`}
                onClick={() => onOpenMedication(medication.id)}
              >
                <MedicationVisualBox appearance={medication.appearance} />
                <span className="med-card__body">
                  <span className="med-card__head">
                    <span className="med-card__name">{medication.name}</span>
                    {requested ? (
                      <StatusPill tone="success" icon="checkCircle">
                        Restock requested
                      </StatusPill>
                    ) : status === 'low' ? (
                      <StatusPill tone="attention" icon="alert">
                        Low stock
                      </StatusPill>
                    ) : changing ? (
                      <StatusPill tone="attention" icon="swap">
                        Changing
                      </StatusPill>
                    ) : null}
                  </span>
                  <span className="med-card__dose">{medication.strength}</span>
                  <span className="med-card__meta">
                    <Icon name="clock" size={19} />
                    {medication.scheduleSummary}
                  </span>
                  <span
                    className={`med-card__stock${status === 'low' ? ' med-card__stock--low' : ''}`}
                  >
                    <StockCartridge
                      appearance={medication.appearance}
                      level={level}
                      height={30}
                      low={status === 'low'}
                    />
                    {stockLabel(level)}
                  </span>
                </span>
                <Icon name="arrowRight" size={22} className="med-card__chevron" />
              </button>
            </li>
          )
        })}
      </ul>

      <p className="flow__note">
        <Icon name="shieldCheck" size={20} className="flow__note-icon" />
        <span>
          This list is the routine {user.pharmacy} has verified. If an old box or label says
          something different, this list is the current one. The pictures are illustrative — your
          medication may look different depending on the brand your pharmacy supplies.
        </span>
      </p>
    </div>
  )
}
