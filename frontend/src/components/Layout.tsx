import { useState } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard, ClipboardList, Kanban, Users, Building2,
  Package, LogOut, Wrench, ChevronRight, Menu
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import clsx from 'clsx'

interface NavItem {
  to: string; label: string; icon: React.ReactNode; roles?: string[]
}

const navItems: NavItem[] = [
  { to: '/',             label: 'Dashboard',   icon: <LayoutDashboard size={17} />, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/board',        label: 'Board',       icon: <Kanban size={17} /> },
  { to: '/work-orders',  label: 'Work Orders', icon: <ClipboardList size={17} /> },
  { to: '/customers',    label: 'Customers',   icon: <Building2 size={17} />, roles: ['MANAGER', 'DISPATCHER'] },
  { to: '/parts',        label: 'Parts',       icon: <Package size={17} />, roles: ['MANAGER', 'DISPATCHER', 'TECHNICIAN'] },
  { to: '/users',        label: 'Users',       icon: <Users size={17} />, roles: ['MANAGER'] },
]

const ROLE_COLORS: Record<string, string> = {
  MANAGER:    'bg-violet-100 text-violet-700',
  DISPATCHER: 'bg-blue-100 text-blue-700',
  TECHNICIAN: 'bg-emerald-100 text-emerald-700',
  CUSTOMER:   'bg-amber-100 text-amber-700',
}

export default function Layout() {
  const { user, logout, hasRole } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => { logout(); navigate('/login') }

  const visibleItems = navItems.filter(item =>
    !item.roles || hasRole(...(item.roles as Parameters<typeof hasRole>))
  )

  // Current page label for mobile header
  const currentPage = visibleItems.find(i => i.to === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(i.to))?.label ?? 'Keystone'

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                          flex items-center justify-center shadow-md flex-shrink-0">
            <Wrench size={17} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-slate-900 tracking-tight">KEYSTONE</p>
            <p className="text-xs text-slate-400 font-medium">Field Service</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 px-3 py-2 mb-1">
          Navigation
        </p>
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) => clsx('nav-item', isActive && 'active')}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {location.pathname === item.to && (
              <ChevronRight size={13} className="opacity-60" />
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-slate-100 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-50
                        transition-colors cursor-default mb-1">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500
                          flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-800 truncate leading-tight">{user?.name}</p>
            <span className={clsx(
              'text-xs font-bold px-1.5 py-0.5 rounded-full inline-block mt-0.5',
              ROLE_COLORS[user?.role ?? ''] ?? 'bg-slate-100 text-slate-600'
            )}>
              {user?.role}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium
                     text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all group"
        >
          <LogOut size={15} className="group-hover:scale-110 transition-transform" />
          Sign out
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--gray-50)' }}>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile drawer */}
      <aside className={clsx(
        'fixed lg:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200',
        'flex flex-col transition-transform duration-300 lg:translate-x-0',
        sidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
      )}>
        <SidebarContent />
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center
                           justify-between px-4 lg:px-6 flex-shrink-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden btn btn-ghost btn-icon p-1.5"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <p className="text-sm font-semibold text-slate-500 lg:hidden">{currentPage}</p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-7 max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
