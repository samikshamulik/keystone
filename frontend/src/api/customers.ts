import api from './client'
import type { Customer, CustomerRequest, Site, SiteRequest, Page } from '../types'

export const customerApi = {
  list: (params?: Record<string, unknown>) =>
    api.get<Page<Customer>>('/customers', { params }).then(r => r.data),

  getById: (id: number) =>
    api.get<Customer>(`/customers/${id}`).then(r => r.data),

  create: (req: CustomerRequest) =>
    api.post<Customer>('/customers', req).then(r => r.data),

  update: (id: number, req: CustomerRequest) =>
    api.put<Customer>(`/customers/${id}`, req).then(r => r.data),

  listSites: (customerId: number, params?: Record<string, unknown>) =>
    api.get<Page<Site>>(`/customers/${customerId}/sites`, { params }).then(r => r.data),

  createSite: (customerId: number, req: SiteRequest) =>
    api.post<Site>(`/customers/${customerId}/sites`, req).then(r => r.data),

  updateSite: (customerId: number, siteId: number, req: SiteRequest) =>
    api.put<Site>(`/customers/${customerId}/sites/${siteId}`, req).then(r => r.data),
}
