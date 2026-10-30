import type { SickDayPause } from '../types'
import { user } from './medications'

/**
 * PROTOTYPE DATA ONLY — not medical advice.
 *
 * The sick-day plan Margaret's pharmacist agreed with her in advance. MediFlow
 * never decides which medication to pause: it only shows this plan and
 * applies it while she says she is unwell. A real plan comes from the
 * person's own pharmacist or doctor.
 */
export const sickDayPlan = {
  writtenBy: user.pharmacist,
  pharmacy: user.pharmacy,
  agreedOn: user.routineVerifiedOn,
  pause: [
    {
      medicationId: 'metformin',
      reason: 'Can build up in your body when you are dehydrated.',
    },
    {
      medicationId: 'ramipril',
      reason: 'Can affect your kidneys and blood pressure when you are dehydrated.',
    },
  ] satisfies SickDayPause[],
  restartWhen: 'When you’re eating and drinking normally again for 24 hours.',
} as const

export const SICK_DAY_DISCLAIMER =
  'Prototype only — not medical advice. A real plan comes from your own pharmacist or doctor.'
