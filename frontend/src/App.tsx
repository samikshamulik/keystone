import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'

import LoginPage      from './pages/LoginPage'
import DashboardPage  from './pages/DashboardPage'
import WorkOrdersPage from './pages/WorkOrdersPage'
import WorkOrderDetail from './pages/WorkOrderDetail'
import BoardPage      from './pages/BoardPage'
import CustomersPage  from './pages/CustomersPage'
import PartsPage      from './pages/PartsPage'
import UsersPage      from './pages/UsersPage'
import Layout         from './components/Layout'
import type { Role } from './types'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
})

function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: Role[] }) {
  const { isAuthenticated, hasRole } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (roles && !hasRole(...roles)) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />

      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<DashboardPage />} />
        <Route path="work-orders" element={<WorkOrdersPage />} />
        <Route path="work-orders/:id" element={<WorkOrderDetail />} />
        <Route path="board" element={<BoardPage />} />
        <Route path="customers" element={
          <RequireAuth roles={['MANAGER', 'DISPATCHER']}>
            <CustomersPage />
          </RequireAuth>
        } />
        <Route path="parts" element={
          <RequireAuth roles={['MANAGER', 'DISPATCHER', 'TECHNICIAN']}>
            <PartsPage />
          </RequireAuth>
        } />
        <Route path="users" element={
          <RequireAuth roles={['MANAGER']}>
            <UsersPage />
          </RequireAuth>
        } />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
