import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <div className="relative">
        <div className="w-10 h-10 rounded-full border-2 border-indigo-100" />
        <Loader2 size={40} className="animate-spin text-indigo-500 absolute inset-0" />
      </div>
      <p className="text-sm font-medium text-slate-400">{text}</p>
    </div>
  )
}

export function SkeletonCard() {
  return (
    <div className="card">
      <div className="skeleton h-4 w-1/3 mb-3" />
      <div className="skeleton h-8 w-1/2 mb-2" />
      <div className="skeleton h-3 w-2/3" />
    </div>
  )
}

export function SkeletonRow() {
  return (
    <tr>
      {[1,2,3,4,5].map(i => (
        <td key={i} className="px-4 py-3.5">
          <div className="skeleton h-4" style={{ width: `${60 + i * 8}%` }} />
        </td>
      ))}
    </tr>
  )
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="table-container animate-pulse-soft">
      <table className="table">
        <thead>
          <tr>
            {[1,2,3,4,5].map(i => (
              <th key={i}><div className="skeleton h-3 w-20" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
        </tbody>
      </table>
    </div>
  )
}
