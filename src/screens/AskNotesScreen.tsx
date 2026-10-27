import { useState } from 'react'
import type { DoctorNote } from '../types'
import { Button } from '../components/Button'
import { Card } from '../components/Card'
import { Icon } from '../components/Icon'
import { user } from '../data/medications'
import { passportPerson, prescribers } from '../data/passport'

interface AskNotesScreenProps {
  notes: DoctorNote[]
  onRemove: (noteId: string) => void
  onShowDoctor: () => void
  onBackToAsk: () => void
}

const gp = prescribers().find((prescriber) => prescriber.role === 'GP')

/**
 * Everything the user wanted their doctor or pharmacist to know, gathered in
 * one place before an appointment. Their own notes: MediFlow adds only what
 * its records say was taken that day, and never what might be the cause.
 */
export function AskNotesScreen({ notes, onRemove, onShowDoctor, onBackToAsk }: AskNotesScreenProps) {
  return (
    <div className="flow flow--wide ask-notes">
      <div className="flow__intro">
        <div>
          <h1 className="flow__title">Notes for your appointment</h1>
          <p className="flow__subtitle">
            Show this to {gp?.name ?? 'your doctor'} or your pharmacist.
          </p>
        </div>
      </div>

      {notes.length === 0 ? (
        <Card tone="sunken">
          <div className="next-up">
            <span className="next-up__icon" aria-hidden="true">
              <Icon name="document" size={26} />
            </span>
            <div className="next-up__body">
              <p className="next-up__label">Nothing noted yet</p>
              <p className="next-up__value">Tell me if something doesn&rsquo;t feel right.</p>
            </div>
          </div>
        </Card>
      ) : (
        <NotesList notes={notes} onRemove={onRemove} />
      )}

      <p className="flow__note">
        <Icon name="info" size={20} className="flow__note-icon" />
        <span>
          These are your own notes. {user.deviceName} does not diagnose or decide what is causing
          anything.
        </span>
      </p>

      <div className="screen-actions">
        {notes.length > 0 ? (
          <Button size="xl" icon="person" onClick={onShowDoctor}>
            Show to my doctor
          </Button>
        ) : null}
        <Button size="xl" variant="secondary" icon="arrowLeft" onClick={onBackToAsk}>
          Back to Ask
        </Button>
      </div>
    </div>
  )
}

interface AskDoctorScreenProps {
  notes: DoctorNote[]
  onDone: () => void
}

/** The notes turned around for the doctor: large, plain, no navigation. */
export function AskDoctorScreen({ notes, onDone }: AskDoctorScreenProps) {
  return (
    <div className="flow flow--full ask-doctor">
      <div className="flow__intro">
        <div>
          <p className="flow__eyebrow">Notes from your patient · written by them in {user.deviceName}</p>
          <h1 className="flow__title">{passportPerson.fullName}</h1>
          <p className="flow__subtitle">
            Born {passportPerson.dateOfBirth} · {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>
      </div>

      <NotesList notes={notes} large />

      <p className="flow__note">
        <Icon name="info" size={20} className="flow__note-icon" />
        <span>
          Self-reported by the patient. &ldquo;Taken today&rdquo; is what they confirmed in{' '}
          {user.deviceName}, not proof of taking.
        </span>
      </p>

      <div className="screen-actions">
        <Button size="xl" icon="check" onClick={onDone}>
          Done
        </Button>
      </div>
    </div>
  )
}

// --- The list itself -------------------------------------------------------------

function NotesList({
  notes,
  onRemove,
  large = false,
}: {
  notes: DoctorNote[]
  onRemove?: (noteId: string) => void
  large?: boolean
}) {
  const noticed = [...notes].filter((note) => note.kind === 'symptom').reverse()
  const asked = [...notes].filter((note) => note.kind === 'question').reverse()

  return (
    <div className={`notes${large ? ' notes--large' : ''}`}>
      {noticed.length > 0 ? (
        <section className="notes__group" aria-labelledby="notes-noticed">
          <h2 id="notes-noticed" className="section-title">
            Things I noticed
          </h2>
          <ul className="notes__list">
            {noticed.map((note) => (
              <NoteCard key={note.id} note={note} onRemove={onRemove} />
            ))}
          </ul>
        </section>
      ) : null}

      {asked.length > 0 ? (
        <section className="notes__group" aria-labelledby="notes-asked">
          <h2 id="notes-asked" className="section-title">
            Questions to ask
          </h2>
          <ul className="notes__list">
            {asked.map((note) => (
              <NoteCard key={note.id} note={note} onRemove={onRemove} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}

function NoteCard({ note, onRemove }: { note: DoctorNote; onRemove?: (noteId: string) => void }) {
  const [confirming, setConfirming] = useState(false)

  return (
    <li className="note card">
      <div className="note__head">
        <p className="note__title">
          <Icon name={note.kind === 'symptom' ? 'person' : 'help'} size={24} />
          <span>{note.title}</span>
        </p>
        <p className="note__when">Noted at {note.notedAt}</p>
      </div>

      {note.details.length > 0 ? (
        <ul className="note__details">
          {note.details.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      ) : null}

      {note.takenToday.length > 0 ? (
        <div className="note__taken">
          <p className="note__taken-label">Taken today</p>
          <ul>
            {note.takenToday.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {onRemove ? (
        confirming ? (
          <div className="note__confirm" role="group" aria-label="Remove this note?">
            <p className="note__confirm-text">Remove this note?</p>
            <div className="note__confirm-actions">
              <Button variant="secondary" icon="close" onClick={() => onRemove(note.id)}>
                Yes, remove
              </Button>
              <Button variant="quiet" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </div>
          </div>
        ) : (
          <Button variant="secondary" icon="close" className="note__remove" onClick={() => setConfirming(true)}>
            Remove
          </Button>
        )
      ) : null}
    </li>
  )
}
