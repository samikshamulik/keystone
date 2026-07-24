import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, X, ExternalLink, CheckCheck } from 'lucide-react'
import { notificationsApi } from '../api/notifications'
import { useNavigate } from 'react-router-dom'
import { formatDistanceToNow } from 'date-fns'
import clsx from 'clsx'

const TYPE_CONFIG: Record<string, { cls: string; dot: string }> = {
  ASSIGNMENT: { cls: 'border-l-blue-400 bg-blue-50/50',    dot: 'bg-blue-400' },
  SLA_BREACH: { cls: 'border-l-red-400 bg-red-50/50',      dot: 'bg-red-400' },
  SLA_AT_RISK:{ cls: 'border-l-orange-400 bg-orange-50/50',dot: 'bg-orange-400' },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const qc = useQueryClient()
  const navigate = useNavigate()

  const { data: countData } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: notificationsApi.getCount,
    refetchInterval: 30_000,
  })

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.getAll,
    enabled: open,
  })

  const markRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications-count'] })
      qc.invalidateQueries({ queryKey: ['notifications'] })
    },
  })

  const unread = countData?.unread ?? 0

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="btn btn-ghost btn-icon relative"
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
      >
        <Bell size={18} className={clsx(unread > 0 && 'text-indigo-600')} />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white
                           text-[9px] font-black rounded-full flex items-center justify-center
                           border-2 border-white animate-bounce-in">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-11 w-80 bg-white rounded-2xl shadow-xl
                          border border-slate-200 z-50 overflow-hidden animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell size={15} className="text-slate-500" />
                <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                {unread > 0 && (
                  <span className="badge bg-red-100 text-red-700 text-[10px]">{unread} new</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={() => markRead.mutate()}
                    className="btn btn-ghost btn-sm text-xs text-indigo-600 gap-1"
                  >
                    <CheckCheck size={12} /> Mark read
                  </button>
                )}
                <button className="btn btn-ghost btn-icon p-1" onClick={() => setOpen(false)}>
                  <X size={13} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
              {!notifications || notifications.length === 0 ? (
                <div className="empty-state py-10">
                  <div className="empty-state-icon w-10 h-10">
                    <Bell size={18} />
                  </div>
                  <p className="empty-state-title text-sm">All caught up!</p>
                  <p className="empty-state-desc text-xs">No notifications yet</p>
                </div>
              ) : (
                notifications.map((n, i) => {
                  const cfg = TYPE_CONFIG[n.type] ?? { cls: 'border-l-slate-300 bg-slate-50/50', dot: 'bg-slate-400' }
                  return (
                    <div
                      key={n.id}
                      className={clsx(
                        'px-4 py-3 border-l-4 cursor-pointer hover:brightness-95 transition-all',
                        'animate-fade-in',
                        cfg.cls,
                        !n.read && 'font-medium'
                      )}
                      style={{ animationDelay: `${i * 30}ms` }}
                      onClick={() => {
                        if (n.workOrderId) { navigate(`/work-orders/${n.workOrderId}`); setOpen(false) }
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5', cfg.dot)} />
                          <p className="text-xs font-bold text-slate-800 truncate">{n.title}</p>
                        </div>
                        {n.workOrderId && <ExternalLink size={10} className="text-slate-400 flex-shrink-0 mt-0.5" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 ml-3.5 line-clamp-2 leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1 ml-3.5 font-medium">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
