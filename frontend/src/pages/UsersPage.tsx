import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import PageHeader from '../components/PageHeader'
import { SkeletonTable } from '../components/LoadingSpinner'
import { Plus, UserCheck, UserX, Users } from 'lucide-react'
import type { CreateUserRequest, Role } from '../types'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import clsx from 'clsx'

const ROLE_CONFIG: Record<Role, { label: string; cls: string; gradient: string }> = {
  MANAGER:    { label: 'Manager',    cls: 'bg-violet-100 text-violet-700', gradient: 'from-violet-400 to-indigo-500' },
  DISPATCHER: { label: 'Dispatcher', cls: 'bg-blue-100 text-blue-700',     gradient: 'from-blue-400 to-cyan-500' },
  TECHNICIAN: { label: 'Technician', cls: 'bg-emerald-100 text-emerald-700', gradient: 'from-emerald-400 to-teal-500' },
  CUSTOMER:   { label: 'Customer',   cls: 'bg-amber-100 text-amber-700',   gradient: 'from-amber-400 to-orange-500' },
}

export default function UsersPage() {
  const qc = useQueryClient()
  const [showCreate, setShowCreate] = useState(false)
  const [roleFilter, setRoleFilter] = useState<Role | ''>('')

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'], queryFn: usersApi.list,
  })

  const toggleMutation = useMutation({
    mutationFn: usersApi.toggle,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); toast.success('User status updated') },
  })

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['users'] }); setShowCreate(false); toast.success('User created') },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create user'
      toast.error(msg)
    },
  })

  const filtered = users?.filter(u => !roleFilter || u.role === roleFilter)

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="User Management"
        breadcrumb="Administration"
        subtitle={users ? `${users.length} users` : undefined}
        action={
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={15} /> New User
          </button>
        }
      />

      {/* Role filter pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <button
          className={clsx('btn btn-sm', roleFilter === '' ? 'btn-primary' : 'btn-secondary')}
          onClick={() => setRoleFilter('')}
        >All</button>
        {(Object.keys(ROLE_CONFIG) as Role[]).map(r => (
          <button
            key={r}
            className={clsx('btn btn-sm', roleFilter === r ? 'btn-primary' : 'btn-secondary')}
            onClick={() => setRoleFilter(roleFilter === r ? '' : r)}
          >
            {ROLE_CONFIG[r].label}
          </button>
        ))}
      </div>

      {isLoading ? <SkeletonTable rows={5} /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <div className="empty-state-icon"><Users size={24} /></div>
                    <p className="empty-state-title">No users found</p>
                  </div>
                </td></tr>
              )}
              {filtered?.map((u, i) => {
                const rc = ROLE_CONFIG[u.role]
                return (
                  <tr key={u.id} className={clsx('animate-fade-in', !u.enabled && 'opacity-60')}
                      style={{ animationDelay: `${i * 30}ms` }}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={clsx(
                          'w-9 h-9 rounded-full flex items-center justify-center text-white',
                          'font-bold text-sm flex-shrink-0 shadow-sm',
                          `bg-gradient-to-br ${rc.gradient}`
                        )}>
                          {u.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{u.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-500 text-sm">{u.email}</td>
                    <td>
                      <span className={clsx('badge badge-dot', rc.cls)}>{rc.label}</span>
                    </td>
                    <td>
                      {u.enabled
                        ? <span className="badge bg-emerald-100 text-emerald-700 badge-dot">Active</span>
                        : <span className="badge bg-slate-100 text-slate-500 badge-dot">Disabled</span>
                      }
                    </td>
                    <td className="text-xs text-slate-400">
                      {format(new Date(u.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td>
                      <button
                        className={clsx('btn btn-sm', u.enabled ? 'btn-secondary' : 'btn-primary')}
                        onClick={() => toggleMutation.mutate(u.id)}
                      >
                        {u.enabled
                          ? <><UserX size={13} /> Disable</>
                          : <><UserCheck size={13} /> Enable</>
                        }
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateUserModal
          onClose={() => setShowCreate(false)}
          onSubmit={req => createMutation.mutate(req)}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  )
}

function CreateUserModal({ onClose, onSubmit, isLoading }: {
  onClose: () => void; onSubmit: (r: CreateUserRequest) => void; isLoading: boolean
}) {
  const [form, setForm] = useState<CreateUserRequest>({
    name: '', email: '', password: '', role: 'TECHNICIAN'
  })
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">New User</h2>
            <p className="text-xs text-slate-400 mt-0.5">Create a new platform account</p>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSubmit(form) }}>
          <div className="modal-body space-y-4">
            <div className="field"><label className="label">Full Name *</label>
              <input className="input" required value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Rajesh Kumar" /></div>
            <div className="field"><label className="label">Email *</label>
              <input className="input" type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="rajesh@keystone.dev" /></div>
            <div className="field">
              <label className="label">Password * <span className="field-hint inline ml-1">(min 8 chars)</span></label>
              <input className="input" type="password" required minLength={8} value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••" /></div>
            <div className="field"><label className="label">Role *</label>
              <select className="input" value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}>
                {(Object.keys(ROLE_CONFIG) as Role[]).map(r => (
                  <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isLoading}>
              {isLoading ? 'Creating…' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
