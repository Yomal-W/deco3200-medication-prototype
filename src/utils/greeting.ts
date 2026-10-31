import { user } from '../data/medications'

/** "Good morning" before noon, "Good afternoon" until 5 PM, then "Good evening". */
function partOfDay(clock: number): string {
  if (clock < 12 * 60) return 'morning'
  if (clock < 17 * 60) return 'afternoon'
  return 'evening'
}

/** "Good morning, Margaret" */
export function greetingFor(clock: number): string {
  return `Good ${partOfDay(clock)}, ${user.firstName}`
}
