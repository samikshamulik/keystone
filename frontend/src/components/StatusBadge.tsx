import clsx from 'clsx'
import type { WOStatus, Priority } from '../types'

/* ── Status ──────────────────────────────────────────────────── */
const STATUS_MAP: Record<WOStatus, { label: string; cls: string }> = {
  NEW:         { label: 'New',         cls: 'bg-slate-100 text-slate-600' },
  ASSIGNED:    { label: 'Assigned',    cls: 'bg-blue-100 text-blue-700' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-amber-100 text-amber-700' },
  ON_HOLD:     { label: 'On Hold',     cls: 'bg-orange-100 text-orange-700' },
  COMPLETED:   { label: 'Completed',   cls: 'bg-emerald-100 text-emerald-700' },
  CLOSED:      { label: 'Closed',      cls: 'bg-gray-100 text-gray-600' },
  CANCELLED:   { label: 'Cancelled',   cls: 'bg-red-100 text-red-600' },
}

export const STATUS_COLORS: Record<WOStatus, string> = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [k, v.cls])
) as Record<WOStatus, string>

export const STATUS_LABELS: Record<WOStatus, string> = Object.fromEntries(
  Object.entries(STATUS_MAP).map(([k, v]) => [k, v.label])
) as Record<WOStatus, string>

/* ── Priority ────────────────────────────────────────────────── */
const PRIORITY_MAP: Record<Priority, { label: string; cls: string; dot: string }> = {
  CRITICAL: { label: 'Critical', cls: 'bg-red-100 text-red-700',         dot: '#ef4444' },
  HIGH:     { label: 'High',     cls: 'bg-orange-100 text-orange-700',   dot: '#f97316' },
  MEDIUM:   { label: 'Medium',   cls: 'bg-yellow-100 text-yellow-700',   dot: '#eab308' },
  LOW:      { label: 'Low',      cls: 'bg-green-100 text-green-700',     dot: '#22c55e' },
}

export const PRIORITY_COLORS: Record<Priority, string> = Object.fromEntries(
  Object.entries(PRIORITY_MAP).map(([k, v]) => [k, v.cls])
) as Record<Priority, string>

export const PRIORITY_LABELS: Record<Priority, string> = Object.fromEntries(
  Object.entries(PRIORITY_MAP).map(([k, v]) => [k, v.label])
) as Record<Priority, string>

/* ── Components ──────────────────────────────────────────────── */
export function StatusBadge({ status }: { status: WOStatus }) {
  const { label, cls } = STATUS_MAP[status] ?? { label: status, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={clsx('badge badge-dot', cls)}>
      {label}
    </span>
  )
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, cls } = PRIORITY_MAP[priority] ?? { label: priority, cls: 'bg-gray-100 text-gray-600' }
  return (
    <span className={clsx('badge badge-dot', cls)}>
      {label}
    </span>
  )
}

export function SlaIndicator({ slaBreached, slaDueAt }: { slaBreached: boolean; slaDueAt?: string }) {
  if (slaBreached) {
    return (
      <span className="badge badge-dot bg-red-100 text-red-700 animate-pulse-soft">
        SLA Breached
      </span>
    )
  }
  if (!slaDueAt) return null
  const hoursLeft = (new Date(slaDueAt).getTime() - Date.now()) / 3_600_000
  if (hoursLeft < 0)  return <span className="badge badge-dot bg-red-100 text-red-700">Overdue</span>
  if (hoursLeft < 2)  return <span className="badge badge-dot bg-orange-100 text-orange-700">At Risk</span>
  return null
}
