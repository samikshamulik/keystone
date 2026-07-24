import api from './client'
import type { DashboardResponse } from '../types'

export const reportsApi = {
  summary: () =>
    api.get<DashboardResponse>('/reports/summary').then(r => r.data),
}
