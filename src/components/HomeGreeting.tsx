import type { ReactNode } from 'react'
import { greetingFor } from '../utils/greeting'

interface HomeGreetingProps {
  /** Simulated minutes after midnight. */
  clock: number
  /** One short line under the greeting. */
  line: string
  /** Controls beside the greeting, e.g. the voice switch. */
  aside?: ReactNode
}

/** A warm, personal start to Home. Purely a greeting: it never carries a task. */
export function HomeGreeting({ clock, line, aside }: HomeGreetingProps) {
  return (
    <div className="home-greeting">
      <div className="home-greeting__text">
        <p className="home-greeting__hello">{greetingFor(clock)}</p>
        <p className="home-greeting__line">{line}</p>
      </div>
      {aside ? <div className="home-greeting__aside">{aside}</div> : null}
    </div>
  )
}
