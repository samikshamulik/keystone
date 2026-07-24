import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workOrderApi } from '../api/workorders'
import type {
  WorkOrderRequest, AssignRequest, StatusTransitionRequest,
  LogPartsRequest, LogTimeRequest
} from '../types'
import toast from 'react-hot-toast'

export const WO_KEYS = {
  all: ['work-orders'] as const,
  list: (params: Record<string, unknown>) => [...WO_KEYS.all, 'list', params] as const,
  board: () => [...WO_KEYS.all, 'board'] as const,
  detail: (id: number) => [...WO_KEYS.all, id] as const,
}

export function useWorkOrderList(params: Record<string, unknown>) {
  return useQuery({
    queryKey: WO_KEYS.list(params),
    queryFn: () => workOrderApi.list(params),
  })
}

export function useWorkOrderBoard() {
  return useQuery({
    queryKey: WO_KEYS.board(),
    queryFn: workOrderApi.board,
  })
}

export function useWorkOrder(id: number) {
  return useQuery({
    queryKey: WO_KEYS.detail(id),
    queryFn: () => workOrderApi.getById(id),
    enabled: !!id,
  })
}

function useWOMutation<T>(
  fn: (args: T) => Promise<unknown>,
  successMsg: string,
) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: WO_KEYS.all })
      toast.success(successMsg)
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Something went wrong'
      toast.error(msg)
    },
  })
}

export function useCreateWorkOrder() {
  return useWOMutation((req: WorkOrderRequest) => workOrderApi.create(req), 'Work order created')
}

export function useUpdateWorkOrder(id: number) {
  return useWOMutation((req: WorkOrderRequest) => workOrderApi.update(id, req), 'Work order updated')
}

export function useAssignWorkOrder(id: number) {
  return useWOMutation((req: AssignRequest) => workOrderApi.assign(id, req), 'Work order assigned')
}

export function useTransitionWorkOrder(id: number) {
  return useWOMutation(
    (req: StatusTransitionRequest) => workOrderApi.transition(id, req),
    'Status updated'
  )
}

export function useLogParts(id: number) {
  return useWOMutation((req: LogPartsRequest) => workOrderApi.logParts(id, req), 'Parts logged')
}

export function useLogTime(id: number) {
  return useWOMutation((req: LogTimeRequest) => workOrderApi.logTime(id, req), 'Time logged')
}
