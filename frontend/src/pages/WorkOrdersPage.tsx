import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, SlidersHorizontal, ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { useWorkOrderList, useCreateWorkOrder } from '../hooks/useWorkOrders'
import { useQuery } from '@tanstack/react-query'
import { customerApi } from '../api/customers'
import PageHeader from '../components/PageHeader'
import { StatusBadge, PriorityBadge, SlaIndicator } from '../components/StatusBadge'
import { SkeletonTable } from '../components/LoadingSpinner'
import { useAuth } from '../context/AuthContext'
import type { WOStatus, Priority, WorkOrderRequest } from '../types'
import { format } from 'date-fns'
import clsx from 'clsx'

const ALL_STATUSES: WOStatus[] = ['NEW','ASSIGNED','IN_PROGRESS','ON_HOLD','COMPLETED','CLOSED','CANCELLED']
const STATUS_LABELS_SHORT: Record<WOStatus, string> = {
  NEW: 'New', ASSIGNED: 'Assigned', IN_PROGRESS: 'In Progress',
  ON_HOLD: 'On Hold', COMPLETED: 'Completed', CLOSED: 'Closed', CANCELLED: 'Cancelled',
}

export default function WorkOrdersPage() {
  const { hasRole } = useAuth()
  const navigate    = useNavigate()
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState<WOStatus | ''>('')
  const [page, setPage]             = useState(0)
  const [showCreate, setShowCreate] = useState(false)

  const params = { search: search || undefined, status: statusFilter || undefined, page, size: 20, sort: 'createdAt,desc' }
  const { data, isLoading } = useWorkOrderList(params)
  const createMutation = useCreateWorkOrder()
  const canCreate = hasRole('MANAGER', 'DISPATCHER', 'CUSTOMER')

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Work Orders"
        breadcrumb="Operations"
        subtitle={data ? `${data.totalElements} work orders` : undefined}
        action={canCreate ? (
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Work Order
          </button>
        ) : undefined}
      />

      {/* Search & Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="input-group flex-1 min-w-[200px]">
          <Search size={15} className="input-icon" />
          <input
            className="input"
            placeholder="Search by title, code…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }}
          />
        </div>

        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-slate-400" />
          <div className="flex flex-wrap gap-1.5">
            <button
              className={clsx('btn btn-sm', statusFilter === '' ? 'btn-primary' : 'btn-secondary')}
              onClick={() => { setStatus(''); setPage(0) }}
            >All</button>
            {ALL_STATUSES.slice(0, 5).map(s => (
              <button
                key={s}
                className={clsx('btn btn-sm', statusFilter === s ? 'btn-primary' : 'btn-secondary')}
                onClick={() => { setStatus(statusFilter === s ? '' : s); setPage(0) }}
              >
                {STATUS_LABELS_SHORT[s]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      {isLoading ? <SkeletonTable rows={8} /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Customer / Site</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>SLA</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.length === 0 && (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><FileText size={24} /></div>
                      <p className="empty-state-title">No work orders found</p>
                      <p className="empty-state-desc">
                        {search || statusFilter ? 'Try adjusting your filters' : 'Create the first work order to get started'}
                      </p>
                      {canCreate && !search && !statusFilter && (
                        <button className="btn btn-primary mt-4" onClick={() => setShowCreate(true)}>
                          <Plus size={15} /> New Work Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
              {data?.content.map((wo, i) => (
                <tr
                  key={wo.id}
                  className="table-row-clickable animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                  onClick={() => navigate(`/work-orders/${wo.id}`)}
                >
                  <td>
                    <span className="code">{wo.code}</span>
                  </td>
                  <td>
                    <p className="font-semibold text-slate-800 max-w-[200px] truncate">{wo.title}</p>
                    {wo.description && (
                      <p className="text-xs text-slate-400 truncate max-w-[200px] mt-0.5">{wo.description}</p>
                    )}
                  </td>
                  <td>
                    <p className="font-medium text-slate-700">{wo.customerName}</p>
                    <p className="text-xs text-slate-400">{wo.siteName}</p>
                  </td>
                  <td><PriorityBadge priority={wo.priority} /></td>
                  <td><StatusBadge status={wo.status} /></td>
                  <td>
                    {wo.assigneeName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center
                                        justify-center text-indigo-700 text-xs font-bold flex-shrink-0">
                          {wo.assigneeName.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-600 truncate max-w-[100px]">{wo.assigneeName}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-slate-300">—</span>
                    )}
                  </td>
                  <td><SlaIndicator slaBreached={wo.slaBreached} slaDueAt={wo.slaDueAt} /></td>
                  <td className="whitespace-nowrap text-slate-400 text-xs">
                    {format(new Date(wo.createdAt), 'dd MMM yy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50">
              <p className="text-sm text-slate-500">
                Showing <span className="font-semibold text-slate-700">
                  {data.number * data.size + 1}–{Math.min((data.number + 1) * data.size, data.totalElements)}
                </span> of <span className="font-semibold text-slate-700">{data.totalElements}</span>
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="btn btn-secondary btn-sm btn-icon"
                  disabled={data.number === 0}
                  onClick={() => setPage(p => p - 1)}
                ><ChevronLeft size={14} /></button>
                <span className="text-sm text-slate-600 px-1">
                  {data.number + 1} / {data.totalPages}
                </span>
                <button
                  className="btn btn-secondary btn-sm btn-icon"
                  disabled={data.number >= data.totalPages - 1}
                  onClick={() => setPage(p => p + 1)}
                ><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <CreateWorkOrderModal
          onClose={() => setShowCreate(false)}
          onCreate={req => createMutation.mutate(req, { onSuccess: () => setShowCreate(false) })}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  )
}

function CreateWorkOrderModal({
  onClose, onCreate, isLoading
}: {
  onClose: () => void
  onCreate: (req: WorkOrderRequest) => void
  isLoading: boolean
}) {
  const [form, setForm] = useState<Partial<WorkOrderRequest>>({ priority: 'MEDIUM' })
  const [selectedCustomer, setSelectedCustomer] = useState<number | null>(null)

  const { data: customers } = useQuery({
    queryKey: ['customers-list'], queryFn: () => customerApi.list({ size: 100 }),
  })
  const { data: sites } = useQuery({
    queryKey: ['sites-list', selectedCustomer],
    queryFn: () => selectedCustomer ? customerApi.listSites(selectedCustomer, { size: 100 }) : null,
    enabled: !!selectedCustomer,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.title && form.priority && form.customerId && form.siteId) {
      onCreate(form as WorkOrderRequest)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New Work Order</h2>
            <p className="text-xs text-slate-400 mt-0.5">Fill in the details to create a new work order</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 field">
              <label className="label">Title *</label>
              <input className="input" required placeholder="e.g. AC Unit Malfunction - Server Room"
                value={form.title ?? ''}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="sm:col-span-2 field">
              <label className="label">Description</label>
              <textarea className="input resize-none" style={{ height: '80px' }}
                placeholder="Describe the issue in detail…"
                value={form.description ?? ''}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="field">
              <label className="label">Priority *</label>
              <select className="input" value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value as Priority }))}>
                {(['CRITICAL','HIGH','MEDIUM','LOW'] as Priority[]).map(p =>
                  <option key={p} value={p}>{p}</option>
                )}
              </select>
            </div>
            <div className="field">
              <label className="label">Customer *</label>
              <select className="input" required value={form.customerId ?? ''}
                onChange={e => {
                  const id = Number(e.target.value)
                  setSelectedCustomer(id)
                  setForm(f => ({ ...f, customerId: id, siteId: undefined }))
                }}>
                <option value="">Select customer…</option>
                {customers?.content.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 field">
              <label className="label">Site *</label>
              <select className="input" required value={form.siteId ?? ''}
                onChange={e => setForm(f => ({ ...f, siteId: Number(e.target.value) }))}
                disabled={!selectedCustomer}>
                <option value="">{selectedCustomer ? 'Select site…' : 'Select a customer first'}</option>
                {sites?.content.map(s => <option key={s.id} value={s.id}>{s.name} — {s.city || s.address}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? <><span className="animate-spin">⏳</span> Creating…</> : <><Plus size={15} /> Create Work Order</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
