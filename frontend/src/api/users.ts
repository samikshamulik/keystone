import api from './client'
import type { User, CreateUserRequest } from '../types'

export const usersApi = {
  list: () =>
    api.get<User[]>('/users').then(r => r.data),

  technicians: () =>
    api.get<User[]>('/users/technicians').then(r => r.data),

  create: (req: CreateUserRequest) =>
    api.post<User>('/users', req).then(r => r.data),

  toggle: (id: number) =>
    api.patch<User>(`/users/${id}/toggle`).then(r => r.data),
}
