import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '../api/reports'
import PageHeader from '../components/PageHeader'
import { SkeletonCard } from '../components/LoadingSpinner'
import {
  TrendingUp, AlertTriangle, CheckCircle2, Briefcase,
  Users, MapPin, ArrowUpRight
} from 'lucide-react'
import { STATUS_COLORS, STATUS_LABELS } from '../components/StatusBadge'
import type { WOStatus } from '../types'
import clsx from 'clsx'

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: reportsApi.summary,
    refetchInterval: 60_000,
  })

  if (isLoading) {
    return (
      <div>
        <div className="page-header animate-pulse-soft">
          <div className="skeleton h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
          {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    )
  }
  if (!data) return null

  const totalOpen = Object.entries(data.statusCounts)
    .filter(([s]) => !['CLOSED', 'CANCELLED'].includes(s))
    .reduce((sum, [, v]) => sum + v, 0)

  const metrics = [
    {
      label: 'Open Jobs', value: totalOpen,
      icon: <Briefcase size={20} />, accent: '#4f46e5',
      iconBg: 'bg-indigo-50 text-indigo-600',
      change: 'Active work orders',
    },
    {
      label: 'Overdue', value: data.overdueCount,
      icon: <AlertTriangle size={20} />, accent: '#ef4444',
      iconBg: 'bg-red-50 text-red-600',
      change: 'Need immediate attention',
    },
    {
      label: 'SLA Compliance', value: `${data.slaCompliancePercent}%`,
      icon: <CheckCircle2 size={20} />, accent: '#10b981',
      iconBg: 'bg-emerald-50 text-emerald-600',
      change: 'Meeting response targets',
    },
    {
      label: 'In Progress', value: data.statusCounts['IN_PROGRESS'] ?? 0,
      icon: <TrendingUp size={20} />, accent: '#f59e0b',
      iconBg: 'bg-amber-50 text-amber-600',
      change: 'Currently being worked',
    },
  ]

  const totalAll = Object.values(data.statusCounts).reduce((a, b) => a + b, 0) || 1

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Dashboard"
        subtitle="Real-time operational overview"
        breadcrumb="Overview"
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        {metrics.map(m => (
          <div
            key={m.label}
            className="stat-card animate-fade-in"
            style={{ '--accent': m.accent } as React.CSSProperties}
          >
            <div className="flex items-start justify-between mb-3">
              <div className={clsx('stat-icon', m.iconBg)}>{m.icon}</div>
              <ArrowUpRight size={14} className="text-slate-300" />
            </div>
            <div className="stat-value">{m.value}</div>
            <div className="stat-label">{m.label}</div>
            <p className="text-xs text-slate-400 mt-1 font-medium">{m.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Status Breakdown */}
        <div className="card animate-fade-in" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900">Status Breakdown</h2>
            <span className="text-xs text-slate-400 font-medium">{totalAll} total</span>
          </div>
          <div className="space-y-3">
            {Object.entries(data.statusCounts)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const pct = Math.round((count / totalAll) * 100)
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className={clsx('badge badge-dot', STATUS_COLORS[status as WOStatus])}>
                        {STATUS_LABELS[status as WOStatus]}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">{pct}%</span>
                        <span className="text-sm font-bold text-slate-700 w-4 text-right">{count}</span>
                      </div>
                    </div>
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )
            })}
          </div>
        </div>

        {/* Technician Workload */}
        <div className="card animate-fade-in" style={{ animationDelay: '160ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <Users size={16} className="text-slate-400" />
              Technician Load
            </h2>
          </div>
          {data.technicianLoad.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon"><Users size={22} /></div>
              <p className="empty-state-title">No active assignments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.technicianLoad.map(t => (
                <div key={t.technicianId} className="flex items-center gap-3 p-2 rounded-lg
                                                       hover:bg-slate-50 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500
                                  flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm">
                    {t.technicianName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{t.technicianName}</p>
                    <div className="mt-1 progress" style={{ height: '4px' }}>
                      <div className="progress-bar" style={{ width: `${Math.min(t.openJobs * 20, 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-sm font-black text-slate-700 flex-shrink-0 w-6 text-right">
                    {t.openJobs}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Site Load */}
        <div className="card animate-fade-in" style={{ animationDelay: '220ms' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-slate-900 flex items-center gap-2">
              <MapPin size={16} className="text-slate-400" />
              Open Jobs by Site
            </h2>
          </div>
          {!data.siteLoad || data.siteLoad.length === 0 ? (
            <div className="empty-state py-8">
              <div className="empty-state-icon"><MapPin size={22} /></div>
              <p className="empty-state-title">No open jobs</p>
            </div>
          ) : (
            <div className="space-y-2">
              {data.siteLoad.map((s, i) => (
                <div key={s.siteId}
                     className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-black text-indigo-600">{i + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-700 truncate">{s.siteName}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="progress w-16" style={{ height: '4px' }}>
                      <div className="progress-bar"
                           style={{ width: `${Math.min(s.openJobs * 15, 100)}%` }} />
                    </div>
                    <span className="text-sm font-black text-slate-700 w-4 text-right">{s.openJobs}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
