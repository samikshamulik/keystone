import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Wrench, Loader2, Zap, Shield, BarChart3, ArrowRight } from 'lucide-react'
import { authApi } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const DEMO_ACCOUNTS = [
  { label: 'Manager',    email: 'manager@keystone.dev',    password: 'manager123',    color: 'from-violet-500 to-indigo-600', desc: 'Full access + reports' },
  { label: 'Dispatcher', email: 'dispatcher@keystone.dev', password: 'dispatcher123', color: 'from-blue-500 to-cyan-600',    desc: 'Assign & track jobs' },
  { label: 'Technician', email: 'technician@keystone.dev', password: 'technician123', color: 'from-emerald-500 to-teal-600', desc: 'Field work updates' },
  { label: 'Customer',   email: 'customer@keystone.dev',   password: 'customer123',   color: 'from-amber-500 to-orange-600', desc: 'Submit & track requests' },
]

const FEATURES = [
  { icon: <Zap size={16} />,       text: 'Real-time work order tracking' },
  { icon: <Shield size={16} />,    text: 'Role-based access control' },
  { icon: <BarChart3 size={16} />, text: 'SLA monitoring & dashboards' },
]

export default function LoginPage() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const { login } = useAuth()
  const navigate  = useNavigate()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login({ email, password })
      login(res)
      navigate('/')
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--gray-50)' }}>

      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[42%] xl:w-[45%] flex-col justify-between p-10
                      bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 relative overflow-hidden">

        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full
                          bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full
                          bg-violet-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[500px] h-[500px] rounded-full bg-white/3" />
          {/* Grid pattern */}
          <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative z-10 animate-fade-in">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur flex items-center
                            justify-center border border-white/20">
              <Wrench size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg tracking-tight">KEYSTONE</p>
              <p className="text-indigo-200 text-xs font-medium">by Meridian Facilities</p>
            </div>
          </div>

          <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
            Field Service<br />
            <span className="text-indigo-200">Made Simple</span>
          </h1>
          <p className="text-indigo-200 text-base leading-relaxed max-w-xs">
            One platform to manage every work order — from the first call to the final sign-off.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3 animate-fade-in" style={{ animationDelay: '150ms' }}>
          {FEATURES.map(f => (
            <div key={f.text} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center
                              text-white flex-shrink-0">
                {f.icon}
              </div>
              <span className="text-sm text-indigo-100 font-medium">{f.text}</span>
            </div>
          ))}
        </div>

        {/* Bottom badge */}
        <div className="relative z-10 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur
                          rounded-full px-4 py-2 border border-white/15">
            <div className="status-dot online" />
            <span className="text-xs text-indigo-100 font-semibold">System Operational</span>
          </div>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md animate-scale-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600
                            flex items-center justify-center shadow-lg">
              <Wrench size={18} className="text-white" />
            </div>
            <div>
              <p className="font-black text-slate-900">KEYSTONE</p>
              <p className="text-xs text-slate-400">Field Service Platform</p>
            </div>
          </div>

          <h2 className="text-2xl font-black text-slate-900 mb-1">Welcome back</h2>
          <p className="text-slate-500 text-sm mb-7">Sign in to your workspace</p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="field">
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email" type="email" required
                className="input"
                placeholder="you@keystone.dev"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password" type="password" required
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full mt-2 group"
            >
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : <><span>Sign in</span><ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></>
              }
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="divider flex-1 m-0" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Demo accounts</span>
            <div className="divider flex-1 m-0" />
          </div>

          {/* Demo accounts */}
          <div className="grid grid-cols-2 gap-2.5 stagger">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.label}
                type="button"
                onClick={() => { setEmail(acc.email); setPassword(acc.password) }}
                className="text-left p-3.5 rounded-xl border border-slate-200 bg-white
                           hover:border-indigo-300 hover:shadow-md transition-all group animate-fade-in"
              >
                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${acc.color}
                                flex items-center justify-center mb-2 shadow-sm
                                group-hover:scale-110 transition-transform`}>
                  <span className="text-white text-xs font-black">{acc.label[0]}</span>
                </div>
                <p className="text-sm font-bold text-slate-800 leading-none mb-0.5">{acc.label}</p>
                <p className="text-xs text-slate-400">{acc.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
