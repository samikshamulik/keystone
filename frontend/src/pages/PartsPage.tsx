import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { partsApi } from '../api/parts'
import PageHeader from '../components/PageHeader'
import { SkeletonTable } from '../components/LoadingSpinner'
import { Plus, Search, Pencil, Trash2, Package, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import type { PartRequest } from '../types'
import toast from 'react-hot-toast'

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <span className="badge bg-red-100 text-red-700 badge-dot">Out of Stock</span>
  if (qty < 10)  return <span className="badge bg-orange-100 text-orange-700 badge-dot">Low ({qty})</span>
  return <span className="badge bg-emerald-100 text-emerald-700 badge-dot">{qty} in stock</span>
}

export default function PartsPage() {
  const qc = useQueryClient()
  const { hasRole } = useAuth()
  const [search, setSearch]   = useState('')
  const [page, setPage]       = useState(0)
  const [editing, setEditing] = useState<number | 'new' | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['parts', { search, page }],
    queryFn: () => partsApi.list({ search: search || undefined, page, size: 20 }),
  })

  const createMutation = useMutation({
    mutationFn: partsApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parts'] }); setEditing(null); toast.success('Part created') },
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: PartRequest }) => partsApi.update(id, req),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parts'] }); setEditing(null); toast.success('Part updated') },
  })
  const deleteMutation = useMutation({
    mutationFn: partsApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['parts'] }); toast.success('Part deleted') },
  })

  const canManage = hasRole('MANAGER')
  const currentPart = typeof editing === 'number' ? data?.content.find(p => p.id === editing) : undefined

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Parts Inventory"
        breadcrumb="Management"
        subtitle={data ? `${data.totalElements} parts` : undefined}
        action={canManage ? (
          <button className="btn btn-primary" onClick={() => setEditing('new')}>
            <Plus size={15} /> New Part
          </button>
        ) : undefined}
      />

      {/* Low stock alert */}
      {data && data.content.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0).length > 0 && (
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200
                        text-amber-800 text-sm font-medium mb-5 animate-fade-in">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          {data.content.filter(p => p.stockQuantity < 10 && p.stockQuantity > 0).length} part(s) running low on stock
        </div>
      )}

      <div className="input-group max-w-sm mb-5">
        <Search size={15} className="input-icon" />
        <input className="input" placeholder="Search by name or part number…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
      </div>

      {isLoading ? <SkeletonTable rows={6} /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Part</th>
                <th>Part Number</th>
                <th>Unit Cost</th>
                <th>Stock</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data?.content.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Package size={24} /></div>
                    <p className="empty-state-title">No parts found</p>
                    <p className="empty-state-desc">Add parts to track inventory and usage on work orders</p>
                    {canManage && (
                      <button className="btn btn-primary mt-4" onClick={() => setEditing('new')}>
                        <Plus size={15} /> Add First Part
                      </button>
                    )}
                  </div>
                </td></tr>
              )}
              {data?.content.map((p, i) => (
                <tr key={p.id} className="animate-fade-in" style={{ animationDelay: `${i * 25}ms` }}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center
                                      justify-center flex-shrink-0">
                        <Package size={14} className="text-slate-500" />
                      </div>
                      <span className="font-semibold text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td><span className="code">{p.partNumber ?? '—'}</span></td>
                  <td className="font-semibold text-slate-700">₹{Number(p.unitCost).toFixed(2)}</td>
                  <td><StockBadge qty={p.stockQuantity} /></td>
                  {canManage && (
                    <td>
                      <div className="flex items-center gap-1.5">
                        <button className="btn btn-secondary btn-sm btn-icon"
                          onClick={() => setEditing(p.id)}>
                          <Pencil size={13} />
                        </button>
                        <button className="btn btn-danger btn-sm btn-icon"
                          onClick={() => deleteMutation.mutate(p.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing !== null && (
        <PartModal
          part={currentPart}
          onClose={() => setEditing(null)}
          onSubmit={req => {
            if (editing === 'new') createMutation.mutate(req)
            else updateMutation.mutate({ id: editing as number, req })
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  )
}

function PartModal({ part, onClose, onSubmit, isLoading }: {
  part?: { name: string; partNumber?: string; unitCost: number; stockQuantity: number }
  onClose: () => void; onSubmit: (r: PartRequest) => void; isLoading: boolean
}) {
  const [form, setForm] = useState<PartRequest>({
    name: part?.name ?? '',
    partNumber: part?.partNumber,
    unitCost: part?.unitCost ?? 0,
    stockQuantity: part?.stockQuantity ?? 0,
  })
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{part ? 'Edit Part' : 'New Part'}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form) }}>
          <div className="modal-body space-y-4">
            <div className="field"><label className="label">Part Name *</label>
              <input className="input" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. HVAC Air Filter" /></div>
            <div className="field"><label className="label">Part Number</label>
              <input className="input" value={form.partNumber ?? ''}
                onChange={e => setForm(f => ({ ...f, partNumber: e.target.value }))}
                placeholder="e.g. HVAC-AF-001" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field"><label className="label">Unit Cost (₹) *</label>
                <input className="input" type="number" step="0.01" min="0" required
                  value={form.unitCost}
                  onChange={e => setForm(f => ({ ...f, unitCost: parseFloat(e.target.value) }))}
                  placeholder="0.00" /></div>
              <div className="field"><label className="label">Stock Quantity *</label>
                <input className="input" type="number" min="0" required
                  value={form.stockQuantity}
                  onChange={e => setForm(f => ({ ...f, stockQuantity: parseInt(e.target.value) }))}
                  placeholder="0" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Saving…' : part ? 'Update Part' : 'Add Part'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
