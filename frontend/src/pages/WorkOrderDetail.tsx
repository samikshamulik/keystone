import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserCheck, Clock, Package, ChevronRight, Loader2, Info } from 'lucide-react'
import { useWorkOrder, useAssignWorkOrder, useTransitionWorkOrder, useLogParts, useLogTime } from '../hooks/useWorkOrders'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import { partsApi } from '../api/parts'
import { StatusBadge, PriorityBadge, SlaIndicator } from '../components/StatusBadge'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import { getAllowedTransitions, STATUS_LABELS } from '../utils/statusHelpers'
import { format, formatDistanceToNow } from 'date-fns'
import type { WOStatus } from '../types'
import clsx from 'clsx'

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user, hasRole } = useAuth()

  const { data: wo, isLoading } = useWorkOrder(Number(id))
  const assignMutation     = useAssignWorkOrder(Number(id))
  const transitionMutation = useTransitionWorkOrder(Number(id))
  const logPartsMutation   = useLogParts(Number(id))
  const logTimeMutation    = useLogTime(Number(id))

  const { data: technicians } = useQuery({ queryKey: ['technicians'], queryFn: usersApi.technicians })
  const { data: parts }       = useQuery({ queryKey: ['parts-list'], queryFn: () => partsApi.list({ size: 100 }) })

  const [techId, setTechId]         = useState<number | ''>('')
  const [partId, setPartId]         = useState<number | ''>('')
  const [qty, setQty]               = useState(1)
  const [minutes, setMinutes]       = useState(30)
  const [timeNote, setTimeNote]     = useState('')
  const [transNote, setTransNote]   = useState('')

  if (isLoading) return <div className="py-12"><LoadingSpinner text="Loading work order…" /></div>
  if (!wo) return (
    <div className="empty-state py-20">
      <div className="empty-state-icon"><Info size={24} /></div>
      <p className="empty-state-title">Work order not found</p>
      <button className="btn btn-secondary mt-4" onClick={() => navigate('/work-orders')}>
        <ArrowLeft size={15} /> Back to list
      </button>
    </div>
  )

  const allowedTransitions = getAllowedTransitions(wo.status, user?.role ?? '')
  const canAssign  = hasRole('MANAGER', 'DISPATCHER')
  const canLogStuff = hasRole('MANAGER', 'TECHNICIAN')

  const handleTransition = (toStatus: WOStatus) => {
    transitionMutation.mutate({ toStatus, note: transNote || undefined })
    setTransNote('')
  }

  return (
    <div className="animate-fade-in max-w-5xl">
      {/* Back nav */}
      <button
        onClick={() => navigate('/work-orders')}
        className="btn btn-ghost btn-sm -ml-2 mb-5 group text-slate-500"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
        Work Orders
      </button>

      {/* Header */}
      <div className="mb-6 animate-fade-in">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="code">{wo.code}</span>
          <StatusBadge status={wo.status} />
          <PriorityBadge priority={wo.priority} />
          <SlaIndicator slaBreached={wo.slaBreached} slaDueAt={wo.slaDueAt} />
        </div>
        <h1 className="text-2xl font-black text-slate-900 leading-tight mb-1">{wo.title}</h1>
        {wo.description && (
          <p className="text-slate-500 text-sm leading-relaxed max-w-2xl">{wo.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">

        {/* Main column */}
        <div className="space-y-5">

          {/* Details grid */}
          <div className="card animate-fade-in">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Work Order Details</h3>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Customer',     value: wo.customerName },
                { label: 'Site',         value: wo.siteName },
                { label: 'Assignee',     value: wo.assigneeName ?? 'Unassigned' },
                { label: 'SLA Due',      value: wo.slaDueAt ? format(new Date(wo.slaDueAt), 'dd MMM yyyy HH:mm') : '—' },
                { label: 'Labour Time',  value: `${wo.summary.totalMinutes} min` },
                { label: 'Parts Cost',   value: `₹${Number(wo.summary.totalPartsCost).toFixed(2)}` },
                { label: 'Created',      value: formatDistanceToNow(new Date(wo.createdAt), { addSuffix: true }) },
                { label: 'Last Updated', value: formatDistanceToNow(new Date(wo.updatedAt), { addSuffix: true }) },
              ].map(d => (
                <div key={d.label}>
                  <dt className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{d.label}</dt>
                  <dd className="text-sm font-semibold text-slate-800">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Status History Timeline */}
          <div className="card animate-fade-in" style={{ animationDelay: '80ms' }}>
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Status History</h3>
            {wo.statusHistory.length === 0 ? (
              <p className="text-sm text-slate-400 italic">No history yet</p>
            ) : (
              <div className="timeline">
                {wo.statusHistory.map((h, i) => (
                  <div key={i} className="timeline-item animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                    <div className="timeline-dot" />
                    <div>
                      <div className="flex flex-wrap items-baseline gap-2">
                        <span className="text-sm font-bold text-slate-800">
                          {h.fromStatus
                            ? `${STATUS_LABELS[h.fromStatus as WOStatus] ?? h.fromStatus} → ${STATUS_LABELS[h.toStatus as WOStatus] ?? h.toStatus}`
                            : `Created as ${STATUS_LABELS[h.toStatus as WOStatus] ?? h.toStatus}`
                          }
                        </span>
                        {h.note && (
                          <span className="text-xs text-slate-500 italic">"{h.note}"</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        by <span className="font-semibold text-slate-600">{h.changedBy}</span>
                        {' · '}{formatDistanceToNow(new Date(h.changedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="space-y-4 animate-slide-in">

          {/* Transition status */}
          {allowedTransitions.length > 0 && (
            <div className="card p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                Change Status
              </h3>
              <textarea
                className="input text-xs mb-3 resize-none"
                style={{ height: '60px' }}
                placeholder="Optional note…"
                value={transNote}
                onChange={e => setTransNote(e.target.value)}
              />
              <div className="space-y-1.5">
                {allowedTransitions.map(s => (
                  <button
                    key={s}
                    className="btn btn-secondary w-full justify-between text-xs group"
                    onClick={() => handleTransition(s)}
                    disabled={transitionMutation.isPending}
                  >
                    <span>{STATUS_LABELS[s]}</span>
                    {transitionMutation.isPending
                      ? <Loader2 size={12} className="animate-spin" />
                      : <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                    }
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assign */}
          {canAssign && !wo.status.match(/CLOSED|CANCELLED/) && (
            <div className="card p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <UserCheck size={13} /> Assign Technician
              </h3>
              <select className="input text-xs mb-2" value={techId}
                onChange={e => setTechId(Number(e.target.value))}>
                <option value="">Select technician…</option>
                {technicians?.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button
                className="btn btn-primary w-full text-xs"
                disabled={!techId || assignMutation.isPending}
                onClick={() => techId && assignMutation.mutate({ technicianId: techId as number })}
              >
                {assignMutation.isPending
                  ? <Loader2 size={12} className="animate-spin" />
                  : <UserCheck size={13} />
                }
                {wo.assigneeId ? 'Reassign' : 'Assign'}
              </button>
            </div>
          )}

          {/* Log Parts */}
          {canLogStuff && !wo.status.match(/CLOSED|CANCELLED/) && (
            <div className="card p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Package size={13} /> Log Parts
              </h3>
              <select className="input text-xs mb-2" value={partId}
                onChange={e => setPartId(Number(e.target.value))}>
                <option value="">Select part…</option>
                {parts?.content.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (stock: {p.stockQuantity})
                  </option>
                ))}
              </select>
              <div className="flex gap-2 mb-2">
                <input type="number" min={1} className="input text-xs flex-1"
                  value={qty} onChange={e => setQty(Number(e.target.value))}
                  placeholder="Qty" />
              </div>
              <button
                className="btn btn-primary w-full text-xs"
                disabled={!partId || logPartsMutation.isPending}
                onClick={() => partId && logPartsMutation.mutate({ partId: partId as number, quantity: qty })}
              >
                {logPartsMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Package size={12} />}
                Log Parts
              </button>
            </div>
          )}

          {/* Log Time */}
          {canLogStuff && !wo.status.match(/CLOSED|CANCELLED/) && (
            <div className="card p-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Clock size={13} /> Log Time
              </h3>
              <input type="number" min={1} className="input text-xs mb-2"
                value={minutes} onChange={e => setMinutes(Number(e.target.value))}
                placeholder="Minutes" />
              <input className="input text-xs mb-2"
                value={timeNote} onChange={e => setTimeNote(e.target.value)}
                placeholder="Note (optional)" />
              <button
                className="btn btn-primary w-full text-xs"
                disabled={logTimeMutation.isPending}
                onClick={() => logTimeMutation.mutate({ minutes, note: timeNote || undefined })}
              >
                {logTimeMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                Log Time
              </button>
            </div>
          )}

          {/* Closed/Cancelled state */}
          {wo.status.match(/CLOSED|CANCELLED/) && (
            <div className={clsx(
              'card p-4 text-center',
              wo.status === 'CLOSED' ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'
            )}>
              <p className={clsx(
                'text-sm font-bold',
                wo.status === 'CLOSED' ? 'text-emerald-700' : 'text-red-700'
              )}>
                {wo.status === 'CLOSED' ? '✓ Job Completed & Closed' : '✕ Job Cancelled'}
              </p>
              {wo.closedAt && (
                <p className="text-xs text-slate-500 mt-1">
                  {format(new Date(wo.closedAt), 'dd MMM yyyy HH:mm')}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
