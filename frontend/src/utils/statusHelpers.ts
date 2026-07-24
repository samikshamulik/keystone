import type { WOStatus } from '../types'

// Re-export from StatusBadge for backwards compat
export { STATUS_COLORS, STATUS_LABELS, PRIORITY_COLORS, PRIORITY_LABELS } from '../components/StatusBadge'

export function getAllowedTransitions(current: WOStatus, role: string): WOStatus[] {
  const map: Record<WOStatus, WOStatus[]> = {
    NEW:         ['ASSIGNED', 'CANCELLED'],
    ASSIGNED:    ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
    IN_PROGRESS: ['ON_HOLD', 'COMPLETED', 'CANCELLED'],
    ON_HOLD:     ['IN_PROGRESS', 'CANCELLED'],
    COMPLETED:   ['CLOSED', 'CANCELLED'],
    CLOSED:      [],
    CANCELLED:   [],
  }

  return (map[current] ?? []).filter(s => {
    if (s === 'CLOSED')    return role === 'MANAGER'
    if (s === 'CANCELLED') return ['MANAGER', 'DISPATCHER'].includes(role)
    if (['IN_PROGRESS', 'ON_HOLD', 'COMPLETED'].includes(s))
      return ['MANAGER', 'TECHNICIAN'].includes(role)
    if (s === 'ASSIGNED')  return ['MANAGER', 'DISPATCHER'].includes(role)
    return true
  })
}
