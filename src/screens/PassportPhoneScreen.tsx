import type { Dose } from '../types'
import { Button } from '../components/Button'
import { Icon } from '../components/Icon'
import { PhoneLockScreen } from '../components/PhoneReminderPreview'
import { medications } from '../data/medications'
import { allergies } from '../data/passport'
import { lastTakenDose } from '../utils/hospital'
import { formatTime, keepTogether } from '../utils/time'

interface PassportPhoneScreenProps {
  doses: Dose[]
  clock: number
  onBack: () => void
}

/**
 * The passport on the phone, so it goes wherever the user goes — into the
 * ambulance, or to an appointment — even when the station stays at home.
 * A preview only: nothing is sent anywhere.
 */
export function PassportPhoneScreen({ doses, clock, onBack }: PassportPhoneScreenProps) {
  const lastTaken = lastTakenDose(doses)

  return (
    <div className="flow flow--wide">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">Your passport on your phone</h1>
          <p className="flow__subtitle">
            Keep it with you, so you can show it wherever you are.
          </p>
        </div>
      </div>

      <p className="reminder-label">
        <Icon name="info" size={20} />
        Simulated preview — not sent to a real phone.
      </p>

      <div className="reminder-layout">
        <figure className="phone-example">
          <PhoneLockScreen time={clock} title="Your medication passport is ready">
            <p className="iphone__note-meds">
              {keepTogether(`${medications.length} medications`)} · allergic to{' '}
              {allergies.map((allergy) => allergy.substance).join(', ')}
            </p>
            <p className="iphone__note-detail">
              {lastTaken
                ? `Last taken ${keepTogether(formatTime(lastTaken.scheduledMinutes))} · tap to show staff`
                : 'Tap to show staff'}
            </p>
          </PhoneLockScreen>
        </figure>

        <div className="split__column">
          <div className="fact">
            <Icon name="passport" size={26} className="fact__icon" />
            <div>
              <p className="fact__label">What it shows</p>
              <p className="fact__value">The same passport as here</p>
              <p className="fact__detail">
                Your medications, allergies, what you last took and who to contact.
              </p>
            </div>
          </div>
          <div className="fact">
            <Icon name="refresh" size={26} className="fact__icon" />
            <div>
              <p className="fact__label">Kept up to date</p>
              <p className="fact__value">Changes when your routine changes</p>
              <p className="fact__detail">
                When your pharmacist updates your routine, your phone copy updates too.
              </p>
            </div>
          </div>
          <div className="fact">
            <Icon name="person" size={26} className="fact__icon" />
            <div>
              <p className="fact__label">For staff</p>
              <p className="fact__value">Hand them your phone</p>
              <p className="fact__detail">It opens straight to the staff view.</p>
            </div>
          </div>
          <div className="screen-actions">
            <Button size="xl" icon="arrowLeft" onClick={onBack}>
              Back to passport
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
