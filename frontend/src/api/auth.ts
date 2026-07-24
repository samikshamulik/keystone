import api from './client'
import type { LoginRequest, LoginResponse } from '../types'

export const authApi = {
  login: (req: LoginRequest) =>
    api.post<LoginResponse>('/auth/login', req).then(r => r.data),
}
