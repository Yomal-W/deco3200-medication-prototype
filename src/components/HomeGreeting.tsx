import { greetingFor } from '../utils/greeting'

interface HomeGreetingProps {
  /** Simulated minutes after midnight. */
  clock: number
  /** One short line under the greeting. */
  line: string
}

/** A warm, personal start to Home. Purely a greeting: it never carries a task. */
export function HomeGreeting({ clock, line }: HomeGreetingProps) {
  return (
    <div className="home-greeting">
      <p className="home-greeting__hello">
        {greetingFor(clock)}
      </p>
      <p className="home-greeting__line">{line}</p>
    </div>
  )
}
