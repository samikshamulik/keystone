import api from './client'
import type { Part, PartRequest, Page } from '../types'

export const partsApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Page<Part>>('/parts', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get<Part>(`/parts/${id}`).then(r => r.data),

  create: (req: PartRequest) =>
    api.post<Part>('/parts', req).then(r => r.data),

  update: (id: number, req: PartRequest) =>
    api.put<Part>(`/parts/${id}`, req).then(r => r.data),

  delete: (id: number) =>
    api.delete(`/parts/${id}`),
}
