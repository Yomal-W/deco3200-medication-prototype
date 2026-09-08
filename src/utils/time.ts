/** Simulated-clock helpers. The prototype never reads the real system time. */

/** 495 -> "8:15 AM" */
export function formatTime(minutesAfterMidnight: number): string {
  const minutes = ((minutesAfterMidnight % 1440) + 1440) % 1440
  const hours24 = Math.floor(minutes / 60)
  const suffix = hours24 < 12 ? 'AM' : 'PM'
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  return `${hours12}:${String(minutes % 60).padStart(2, '0')} ${suffix}`
}

export function greetingFor(minutesAfterMidnight: number): string {
  const hours = Math.floor((((minutesAfterMidnight % 1440) + 1440) % 1440) / 60)
  if (hours < 12) return 'Good morning'
  if (hours < 17) return 'Good afternoon'
  return 'Good evening'
}

/** "Metformin, Ramipril and Aspirin" */
export function joinNames(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

/** "3 medications" / "1 medication" */
export function countLabel(count: number): string {
  return `${count} ${count === 1 ? 'medication' : 'medications'}`
}
