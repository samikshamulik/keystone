interface PageHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  breadcrumb?: string
}

export default function PageHeader({ title, subtitle, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="page-header animate-fade-in">
      <div>
        {breadcrumb && (
          <p className="text-xs font-semibold uppercase tracking-widest text-indigo-500 mb-1">
            {breadcrumb}
          </p>
        )}
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}
