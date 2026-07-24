import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customerApi } from '../api/customers'
import PageHeader from '../components/PageHeader'
import { SkeletonTable } from '../components/LoadingSpinner'
import { Plus, Search, ChevronDown, ChevronRight, Building2, MapPin } from 'lucide-react'
import type { CustomerRequest, SiteRequest } from '../types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function CustomersPage() {
  const qc = useQueryClient()
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(0)
  const [expanded, setExpanded]     = useState<number | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showSite, setShowSite]     = useState<number | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['customers', { search, page }],
    queryFn: () => customerApi.list({ search: search || undefined, page, size: 20 }),
  })

  const { data: sites } = useQuery({
    queryKey: ['sites', expanded],
    queryFn: () => expanded ? customerApi.listSites(expanded, { size: 50 }) : null,
    enabled: !!expanded,
  })

  const createCustomer = useMutation({
    mutationFn: customerApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); setShowCreate(false); toast.success('Customer created') },
    onError: () => toast.error('Failed to create customer'),
  })

  const createSite = useMutation({
    mutationFn: ({ customerId, req }: { customerId: number; req: SiteRequest }) =>
      customerApi.createSite(customerId, req),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['sites'] }); setShowSite(null); toast.success('Site added') },
    onError: () => toast.error('Failed to create site'),
  })

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Customers & Sites"
        breadcrumb="Management"
        subtitle={data ? `${data.totalElements} customers` : undefined}
        action={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New Customer
          </button>
        }
      />

      <div className="input-group max-w-sm mb-5">
        <Search size={15} className="input-icon" />
        <input className="input" placeholder="Search customers…"
          value={search} onChange={e => { setSearch(e.target.value); setPage(0) }} />
      </div>

      {isLoading ? <SkeletonTable rows={6} /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.content.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Building2 size={24} /></div>
                    <p className="empty-state-title">No customers yet</p>
                    <button className="btn btn-primary mt-4" onClick={() => setShowCreate(true)}>
                      <Plus size={15} /> Add Customer
                    </button>
                  </div>
                </td></tr>
              )}
              {data?.content.map((c, i) => (
                <>
                  <tr key={c.id} className="animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500
                                        flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{c.name}</p>
                          {c.address && <p className="text-xs text-slate-400 truncate max-w-[150px]">{c.address}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600">{c.email}</td>
                    <td className="text-slate-500">{c.phone ?? '—'}</td>
                    <td className="text-slate-400 text-xs">{format(new Date(c.createdAt), 'dd MMM yy')}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        >
                          {expanded === c.id
                            ? <><ChevronDown size={13} /> Hide Sites</>
                            : <><ChevronRight size={13} /> Sites</>
                          }
                        </button>
                        <button className="btn btn-ghost btn-sm" onClick={() => setShowSite(c.id)}>
                          <Plus size={13} /> Site
                        </button>
                      </div>
                    </td>
                  </tr>

                  {expanded === c.id && (
                    <tr key={`${c.id}-sites`}>
                      <td colSpan={5} className="py-0">
                        <div className="bg-indigo-50/40 px-6 py-4 border-t border-indigo-100">
                          <p className="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-3">
                            Sites ({sites?.content.length ?? 0})
                          </p>
                          {sites?.content.length === 0 ? (
                            <p className="text-sm text-slate-400 italic">No sites yet — add the first one</p>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {sites?.content.map(s => (
                                <div key={s.id}
                                     className="flex items-center gap-2 bg-white border border-indigo-200
                                                rounded-xl px-3 py-2 text-sm shadow-sm">
                                  <MapPin size={13} className="text-indigo-400 flex-shrink-0" />
                                  <div>
                                    <p className="font-semibold text-slate-700 leading-none">{s.name}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{s.city || s.address}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CustomerModal onClose={() => setShowCreate(false)}
          onSubmit={req => createCustomer.mutate(req)} isLoading={createCustomer.isPending} />
      )}
      {showSite && (
        <SiteModal onClose={() => setShowSite(null)}
          onSubmit={req => createSite.mutate({ customerId: showSite, req })} isLoading={createSite.isPending} />
      )}
    </div>
  )
}

function CustomerModal({ onClose, onSubmit, isLoading }: { onClose: () => void; onSubmit: (r: CustomerRequest) => void; isLoading: boolean }) {
  const [form, setForm] = useState<CustomerRequest>({ name: '', email: '' })
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">New Customer</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form) }}>
          <div className="modal-body space-y-4">
            <div className="field"><label className="label">Company Name *</label>
              <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Tata Consultancy Services" /></div>
            <div className="field"><label className="label">Email *</label>
              <input className="input" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="facilities@company.com" /></div>
            <div className="field"><label className="label">Phone</label>
              <input className="input" value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91-22-1234-5678" /></div>
            <div className="field"><label className="label">Address</label>
              <input className="input" value={form.address ?? ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Full address" /></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SiteModal({ onClose, onSubmit, isLoading }: { onClose: () => void; onSubmit: (r: SiteRequest) => void; isLoading: boolean }) {
  const [form, setForm] = useState<SiteRequest>({ name: '', address: '' })
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Site</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form) }}>
          <div className="modal-body space-y-4">
            <div className="field"><label className="label">Site Name *</label>
              <input className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. HQ Tower, Block A" /></div>
            <div className="field"><label className="label">Address *</label>
              <input className="input" required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Street address" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="field"><label className="label">City</label>
                <input className="input" value={form.city ?? ''} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Mumbai" /></div>
              <div className="field"><label className="label">Postcode</label>
                <input className="input" value={form.postcode ?? ''} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))} placeholder="400001" /></div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Adding…' : 'Add Site'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
