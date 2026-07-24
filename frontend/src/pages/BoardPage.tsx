import { useNavigate } from 'react-router-dom'
import { useWorkOrderBoard } from '../hooks/useWorkOrders'
import { PriorityBadge, SlaIndicator } from '../components/StatusBadge'
import PageHeader from '../components/PageHeader'
import type { WOStatus, WorkOrder } from '../types'
import { Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const COLUMNS: { status: WOStatus; label: string; color: string; bg: string }[] = [
  { status: 'NEW',         label: 'New',         color: '#94a3b8', bg: '#f8fafc' },
  { status: 'ASSIGNED',    label: 'Assigned',    color: '#3b82f6', bg: '#eff6ff' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  { status: 'ON_HOLD',     label: 'On Hold',     color: '#f97316', bg: '#fff7ed' },
  { status: 'COMPLETED',   label: 'Completed',   color: '#10b981', bg: '#f0fdf4' },
]

function WOCard({ wo, index }: { wo: WorkOrder; index: number }) {
  const navigate = useNavigate()
  return (
    <div
      className="kanban-card animate-fade-in"
      style={{ animationDelay: `${index * 40}ms` }}
      onClick={() => navigate(`/work-orders/${wo.id}`)}
    >
      {/* Code + Priority */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="code text-xs">{wo.code}</span>
        <PriorityBadge priority={wo.priority} />
      </div>

      {/* Title */}
      <p className="text-sm font-semibold text-slate-800 truncate-2 leading-snug mb-2">
        {wo.title}
      </p>

      {/* Customer / Site */}
      <p className="text-xs text-slate-400 mb-2 truncate">
        {wo.customerName} · {wo.siteName}
      </p>

      {/* Assignee */}
      {wo.assigneeName && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
          <div className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center
                          text-indigo-700 font-bold text-[9px] flex-shrink-0">
            {wo.assigneeName.charAt(0)}
          </div>
          <span className="truncate">{wo.assigneeName}</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={10} />
          <span>{formatDistanceToNow(new Date(wo.createdAt), { addSuffix: true })}</span>
        </div>
        <SlaIndicator slaBreached={wo.slaBreached} slaDueAt={wo.slaDueAt} />
      </div>
    </div>
  )
}

export default function BoardPage() {
  const { data: orders, isLoading } = useWorkOrderBoard()

  if (isLoading) return (
    <div>
      <PageHeader title="Board" breadcrumb="Operations" />
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(c => (
          <div key={c.status} className="kanban-col animate-pulse-soft">
            <div className="kanban-header">
              <div className="skeleton h-4 w-20" />
              <div className="skeleton h-5 w-6 rounded-full" />
            </div>
            <div className="kanban-body gap-3">
              {[1,2].map(i => (
                <div key={i} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const byStatus = COLUMNS.reduce((acc, c) => {
    acc[c.status] = orders?.filter(wo => wo.status === c.status) ?? []
    return acc
  }, {} as Record<WOStatus, WorkOrder[]>)

  const totalOpen = orders?.length ?? 0

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Work Order Board"
        breadcrumb="Operations"
        subtitle={`${totalOpen} open work orders across all statuses`}
      />

      <div className="flex gap-4 overflow-x-auto pb-6 -mx-1 px-1">
        {COLUMNS.map(col => (
          <div
            key={col.status}
            className="kanban-col kanban-col-accent flex-shrink-0"
            style={{ '--col-color': col.color } as React.CSSProperties}
          >
            {/* Column Header */}
            <div className="kanban-header" style={{ background: col.bg }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: col.color }} />
                <span className="text-sm font-bold text-slate-700">{col.label}</span>
              </div>
              <span
                className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: col.color + '20', color: col.color }}
              >
                {byStatus[col.status].length}
              </span>
            </div>

            {/* Cards */}
            <div className="kanban-body">
              {byStatus[col.status].length === 0 ? (
                <div className="flex flex-col items-center justify-center flex-1 py-8
                                text-slate-300 text-xs font-medium gap-2">
                  <div className="w-8 h-8 rounded-xl border-2 border-dashed border-slate-200
                                  flex items-center justify-center">
                    <span>∅</span>
                  </div>
                  No jobs here
                </div>
              ) : (
                byStatus[col.status].map((wo, i) => (
                  <WOCard key={wo.id} wo={wo} index={i} />
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
