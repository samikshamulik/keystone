import api from './client'
import type { NotificationItem } from '../types'

export const notificationsApi = {
  getAll: () =>
    api.get<NotificationItem[]>('/notifications').then(r => r.data),

  getUnread: () =>
    api.get<NotificationItem[]>('/notifications/unread').then(r => r.data),

  getCount: () =>
    api.get<{ unread: number }>('/notifications/count').then(r => r.data),

  markAllRead: () =>
    api.post('/notifications/mark-read'),
}
