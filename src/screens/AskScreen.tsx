import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Dose, DoctorNote, PrescriptionChange, SickDayState } from '../types'
import { Button } from '../components/Button'
import { Icon, type IconName } from '../components/Icon'
import { PrototypeNote } from '../components/PrototypeNote'
import { user } from '../data/medications'
import {
  ASSISTANT_DISCLAIMER,
  NOT_A_DIAGNOSIS,
  extras,
  onsets,
  questions,
  severities,
  sickDaySymptomIds,
  symptoms,
  type Option,
  type QuestionId,
} from '../data/assistant'
import { usePrefersReducedMotion } from '../state/usePrefersReducedMotion'
import {
  answerQuestion,
  buildQuestionNote,
  buildSymptomNote,
  matchQuestion,
  needsUrgentHelp,
  soundsUrgent,
  type SymptomAnswers,
} from '../utils/assistant'

type Stage =
  | 'menu'
  | 'symptom-what'
  | 'symptom-typed'
  | 'symptom-when'
  | 'symptom-how'
  | 'symptom-extra'
  | 'saved'
  | 'questions'
  | 'answered'
  | 'answered-stop'
  | 'urgent'

interface Message {
  id: number
  from: 'assistant' | 'user'
  lines: string[]
  tone?: 'urgent' | 'saved'
}

interface AskScreenProps {
  doses: Dose[]
  nextDose: Dose | null
  change: PrescriptionChange | null
  sickDay: SickDayState | null
  notes: DoctorNote[]
  onAddNote: (build: (id: string, clock: number) => DoctorNote) => void
  onOpenNotes: () => void
  onShowPassport: () => void
}

const START_OPTIONS = [
  { id: 'symptom', label: 'Something doesn’t feel right' },
  { id: 'question', label: 'I have a question about my medication' },
  { id: 'appointment', label: 'Get ready for my appointment' },
]

const START_ICONS: Record<string, IconName> = {
  symptom: 'person',
  question: 'help',
  appointment: 'document',
}

/**
 * Making the system transparent in the other direction: what the user
 * notices. A calm, guided conversation that answers only from MediFlow's own
 * records, helps the user describe and save what they noticed, and gathers it
 * for their doctor. Pre-written, not a live AI. It never diagnoses, never
 * links a symptom to a medication and never suggests changing a dose.
 */
export function AskScreen({
  doses,
  nextDose,
  change,
  sickDay,
  notes,
  onAddNote,
  onOpenNotes,
  onShowPassport,
}: AskScreenProps) {
  const reduceMotion = usePrefersReducedMotion()
  const unwell = sickDay?.status === 'active'
  const greeting = (): Message => ({
    id: 0,
    from: 'assistant',
    lines: [
      `Hello ${user.firstName}. What would you like to do?`,
      ...(unwell ? ['Your sick-day plan is on. Tell me if something doesn’t feel right.'] : []),
    ],
  })

  const [messages, setMessages] = useState<Message[]>(() => [greeting()])
  const [stage, setStage] = useState<Stage>('menu')
  const [typing, setTyping] = useState(false)
  const [text, setText] = useState('')
  const draft = useRef<Partial<SymptomAnswers>>({})
  const nextId = useRef(1)
  const timer = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => () => {
    if (timer.current) window.clearTimeout(timer.current)
  }, [])

  // Keep the newest message and the answers in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [messages, typing, stage, reduceMotion])

  /** The user's turn, then the assistant's after a short, honest pause. */
  const turn = (userLines: string[] | null, reply: string[], next: Stage, tone?: Message['tone']) => {
    if (typing) return
    if (userLines) {
      setMessages((current) => [...current, { id: nextId.current++, from: 'user', lines: userLines }])
    }
    setTyping(true)
    timer.current = window.setTimeout(
      () => {
        setMessages((current) => [...current, { id: nextId.current++, from: 'assistant', lines: reply, tone }])
        setStage(next)
        setTyping(false)
      },
      reduceMotion ? 0 : 700,
    )
  }

  const restart = () => {
    if (timer.current) window.clearTimeout(timer.current)
    draft.current = {}
    setTyping(false)
    setText('')
    setMessages([greeting()])
    setStage('menu')
  }

  const urgent = (userLines: string[] | null) =>
    turn(
      userLines,
      [
        'If you feel very unwell, call 000 now.',
        `If you’re not sure, call ${user.pharmacist} at ${user.pharmacy} on ${user.pharmacyPhone}.`,
        'When help arrives, show them your medication passport.',
      ],
      'urgent',
      'urgent',
    )

  const saveSymptom = (answers: SymptomAnswers, userLines: string[] | null, urgentToo: boolean) => {
    onAddNote((id, clock) => buildSymptomNote(id, answers, doses, clock))
    draft.current = {}
    if (urgentToo) {
      urgent(userLines)
      return
    }
    turn(userLines, ['Saved to your notes.', NOT_A_DIAGNOSIS], 'saved', 'saved')
  }

  // --- Choices ----------------------------------------------------------------

  const chooseStart = (option: Option) => {
    if (option.id === 'symptom') turn([option.label], ['What did you notice?'], 'symptom-what')
    else if (option.id === 'question') turn([option.label], ['What would you like to know?'], 'questions')
    else onOpenNotes()
  }

  const chooseSymptom = (option: Option) => {
    if (option.id === 'other') {
      turn([option.label], ['Tell me in a few words. Type it in the box below.'], 'symptom-typed')
      window.setTimeout(() => inputRef.current?.focus(), reduceMotion ? 0 : 750)
      return
    }
    draft.current = { symptomId: option.id }
    turn([option.label], ['When did it start?'], 'symptom-when')
  }

  const chooseOnset = (option: Option) => {
    draft.current.onsetId = option.id
    turn([option.label], ['How much is it bothering you?'], 'symptom-how')
  }

  const chooseSeverity = (option: Option) => {
    draft.current.severityId = option.id
    if (needsUrgentHelp(option.id, draft.current.typed)) {
      saveSymptom({ ...(draft.current as SymptomAnswers), extraIds: [] }, [option.label], true)
      return
    }
    turn([option.label], ['Anything else to add?'], 'symptom-extra')
  }

  const chooseExtra = (option: Option) => {
    saveSymptom({ ...(draft.current as SymptomAnswers), extraIds: [option.id] }, [option.label], false)
  }

  const ask = (id: QuestionId, userText: string) => {
    turn([userText], answerQuestion(id, { doses, nextDose, change }), id === 'stop' ? 'answered-stop' : 'answered')
  }

  const addQuestionToNotes = (question: string) => {
    onAddNote((id, clock) => buildQuestionNote(id, question, clock))
    turn(['Add to my notes'], ['Added to your notes for your doctor.'], 'answered', 'saved')
  }

  const send = (event: FormEvent) => {
    event.preventDefault()
    const typed = text.trim()
    if (!typed || typing) return
    setText('')
    if (soundsUrgent(typed)) {
      if (stage === 'symptom-what' || stage === 'symptom-typed') {
        saveSymptom(
          { symptomId: 'other', typed, onsetId: 'today', severityId: 'lot', extraIds: [] },
          [typed],
          true,
        )
      } else {
        urgent([typed])
      }
      return
    }
    if (stage === 'symptom-what' || stage === 'symptom-typed') {
      draft.current = { symptomId: 'other', typed }
      turn([typed], ['When did it start?'], 'symptom-when')
      return
    }
    const match = matchQuestion(typed)
    if (match) {
      ask(match, typed)
      return
    }
    onAddNote((id, clock) => buildQuestionNote(id, typed, clock))
    turn(
      [typed],
      [
        'I can only answer questions about your routine.',
        'I’ve added your question to your notes, so you can ask your doctor or pharmacist.',
      ],
      'answered',
      'saved',
    )
  }

  // --- Answers on offer -----------------------------------------------------

  const lastQuestion = [...messages].reverse().find((message) => message.from === 'user')?.lines[0] ?? ''
  const symptomOptions = unwell
    ? [
        ...symptoms.filter((item) => sickDaySymptomIds.includes(item.id)),
        ...symptoms.filter((item) => !sickDaySymptomIds.includes(item.id)),
      ]
    : symptoms

  type Reply =
    | { kind: 'start' | 'symptom' | 'onset' | 'severity' | 'extra'; option: Option }
    | { kind: 'question'; id: QuestionId; label: string }
    | { kind: 'add-question'; question: string }
    | { kind: 'ask-another' | 'another-symptom' | 'notes' | 'passport' }

  const asReplies = (kind: 'start' | 'symptom' | 'onset' | 'severity' | 'extra', list: Option[]) =>
    list.map((option): { label: string; reply: Reply; icon?: IconName } => ({
      label: option.label,
      reply: { kind, option },
      icon: kind === 'start' ? START_ICONS[option.id] : undefined,
    }))

  // Short answers sit in a grid; long ones get a full row each, so no label wraps.
  const stacked = !['symptom-what', 'symptom-when', 'symptom-how', 'symptom-extra'].includes(stage)

  const replies: { label: string; reply: Reply; icon?: IconName }[] =
    stage === 'menu'
      ? asReplies('start', START_OPTIONS)
      : stage === 'symptom-what'
        ? asReplies('symptom', [...symptomOptions, { id: 'other', label: 'Something else' }])
        : stage === 'symptom-when'
          ? asReplies('onset', onsets)
          : stage === 'symptom-how'
            ? asReplies('severity', severities)
            : stage === 'symptom-extra'
              ? asReplies('extra', extras)
              : stage === 'questions'
                ? questions.map((question) => ({
                    label: question.label,
                    reply: { kind: 'question', id: question.id, label: question.label },
                    icon: 'help' as IconName,
                  }))
                : stage === 'answered-stop'
                  ? [
                      { label: 'Add to my notes', reply: { kind: 'add-question', question: lastQuestion } },
                      { label: 'Ask another question', reply: { kind: 'ask-another' } },
                    ]
                  : stage === 'answered'
                    ? [{ label: 'Ask another question', reply: { kind: 'ask-another' } }]
                    : stage === 'saved'
                      ? [
                          { label: 'See my notes', reply: { kind: 'notes' } },
                          { label: 'Something else doesn’t feel right', reply: { kind: 'another-symptom' } },
                        ]
                      : stage === 'urgent'
                        ? [{ label: 'Show my passport', reply: { kind: 'passport' } }]
                        : []

  /** Every answer button lands here, so nothing is decided while rendering. */
  const handleReply = (reply: Reply) => {
    switch (reply.kind) {
      case 'start':
        return chooseStart(reply.option)
      case 'symptom':
        return chooseSymptom(reply.option)
      case 'onset':
        return chooseOnset(reply.option)
      case 'severity':
        return chooseSeverity(reply.option)
      case 'extra':
        return chooseExtra(reply.option)
      case 'question':
        return ask(reply.id, reply.label)
      case 'add-question':
        return addQuestionToNotes(reply.question)
      case 'ask-another':
        return turn(['Ask another question'], ['What would you like to know?'], 'questions')
      case 'another-symptom':
        return turn(['Something else doesn’t feel right'], ['What did you notice?'], 'symptom-what')
      case 'notes':
        return onOpenNotes()
      case 'passport':
        return onShowPassport()
    }
  }

  const canType = stage !== 'urgent'
  const placeholder =
    stage === 'symptom-what' || stage === 'symptom-typed' ? 'e.g. my ankles are swollen' : 'e.g. what is Ramipril for?'

  return (
    <div className="flow flow--wide ask">
      <div className="flow__intro ask__head">
        <div>
          <h1 className="flow__title">Ask {user.deviceName}</h1>
          <p className="flow__subtitle">Answers come from your own records. Pre-written for testing.</p>
        </div>
        <div className="ask__head-actions">
          <Button variant="secondary" icon="document" onClick={onOpenNotes}>
            My notes{notes.length > 0 ? ` · ${notes.length}` : ''}
          </Button>
        </div>
      </div>

      <div className="chat" role="log" aria-live="polite" aria-label="Conversation">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat__row chat__row--${message.from}${message.tone ? ` chat__row--${message.tone}` : ''}`}
          >
            {message.from === 'assistant' ? (
              <span className="chat__avatar" aria-hidden="true">
                <Icon name={message.tone === 'urgent' ? 'alert' : 'device'} size={22} />
              </span>
            ) : null}
            <div className="chat__bubble">
              <span className="sr-only">{message.from === 'assistant' ? `${user.deviceName} says:` : 'You said:'}</span>
              {message.lines.map((line, index) => (
                <p key={index} className="chat__line">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}

        {typing ? (
          <div className="chat__row chat__row--assistant">
            <span className="chat__avatar" aria-hidden="true">
              <Icon name="device" size={22} />
            </span>
            <div className="chat__bubble chat__typing" aria-label={`${user.deviceName} is writing`}>
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}
      </div>

      {replies.length > 0 ? (
        <div
          className={`chat-replies${stacked ? ' chat-replies--stacked' : ''}`}
          role="group"
          aria-label="Choose an answer"
        >
          {replies.map((item) => (
            <Button
              key={item.label}
              size="lg"
              variant="secondary"
              icon={item.icon ?? (stacked ? 'arrowRight' : undefined)}
              iconPosition={item.icon ? 'start' : 'end'}
              disabled={typing}
              onClick={() => handleReply(item.reply)}
            >
              {item.label}
            </Button>
          ))}
        </div>
      ) : null}

      {canType ? (
        <form className="chat-input" onSubmit={send}>
          <label className="chat-input__label" htmlFor="ask-input">
            {stage === 'symptom-typed' ? 'Type what you noticed' : 'Or type it instead'}
          </label>
          <div className="chat-input__row">
            <input
              ref={inputRef}
              id="ask-input"
              className="chat-input__field"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder={placeholder}
              autoComplete="off"
            />
            <Button type="submit" size="lg" icon="arrowRight" iconPosition="end" disabled={typing || !text.trim()}>
              Send
            </Button>
          </div>
        </form>
      ) : null}

      <div className="screen-actions">
        <Button size="lg" variant="secondary" icon="home" onClick={restart}>
          Back to start
        </Button>
      </div>

      <PrototypeNote>{ASSISTANT_DISCLAIMER}</PrototypeNote>
      <div ref={endRef} />
    </div>
  )
}
