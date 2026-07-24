import api from './client'
import type {
  WorkOrder, WorkOrderRequest, AssignRequest, StatusTransitionRequest,
  LogPartsRequest, LogTimeRequest, Page
} from '../types'

export const workOrderApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Page<WorkOrder>>('/work-orders', { params }).then(r => r.data),

  board: () =>
    api.get<WorkOrder[]>('/work-orders/board').then(r => r.data),

  getById: (id: number) =>
    api.get<WorkOrder>(`/work-orders/${id}`).then(r => r.data),

  create: (req: WorkOrderRequest) =>
    api.post<WorkOrder>('/work-orders', req).then(r => r.data),

  update: (id: number, req: WorkOrderRequest) =>
    api.put<WorkOrder>(`/work-orders/${id}`, req).then(r => r.data),

  assign: (id: number, req: AssignRequest) =>
    api.post<WorkOrder>(`/work-orders/${id}/assign`, req).then(r => r.data),

  transition: (id: number, req: StatusTransitionRequest) =>
    api.post<WorkOrder>(`/work-orders/${id}/status`, req).then(r => r.data),

  logParts: (id: number, req: LogPartsRequest) =>
    api.post<WorkOrder>(`/work-orders/${id}/parts`, req).then(r => r.data),

  logTime: (id: number, req: LogTimeRequest) =>
    api.post<WorkOrder>(`/work-orders/${id}/time`, req).then(r => r.data),
}
