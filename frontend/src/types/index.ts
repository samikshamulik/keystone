// ── Auth ──────────────────────────────────────────────────────────────────────
export interface LoginRequest { email: string; password: string }
export interface LoginResponse {
  token: string; tokenType: string; userId: number;
  email: string; name: string; role: Role
}

// ── Roles ─────────────────────────────────────────────────────────────────────
export type Role = 'MANAGER' | 'DISPATCHER' | 'TECHNICIAN' | 'CUSTOMER'

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: number; name: string; email: string; role: Role;
  enabled: boolean; createdAt: string
}
export interface CreateUserRequest {
  name: string; email: string; password: string; role: Role
}

// ── Customer / Site ───────────────────────────────────────────────────────────
export interface Customer {
  id: number; name: string; email: string; phone?: string;
  address?: string; userId?: number; createdAt: string
}
export interface CustomerRequest { name: string; email: string; phone?: string; address?: string }

export interface Site {
  id: number; customerId: number; customerName: string;
  name: string; address: string; city?: string; postcode?: string; createdAt: string
}
export interface SiteRequest { name: string; address: string; city?: string; postcode?: string }

// ── Work Orders ───────────────────────────────────────────────────────────────
export type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
export type WOStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'ON_HOLD' | 'COMPLETED' | 'CLOSED' | 'CANCELLED'

export interface StatusHistoryEntry {
  fromStatus?: string; toStatus: string; changedBy: string; note?: string; changedAt: string
}
export interface PartTimeSummary { totalMinutes: number; totalPartsCost: number }

export interface WorkOrder {
  id: number; code: string; title: string; description?: string;
  priority: Priority; status: WOStatus;
  customerId: number; customerName: string;
  siteId: number; siteName: string;
  assigneeId?: number; assigneeName?: string;
  slaDueAt?: string; slaBreached: boolean;
  completedAt?: string; closedAt?: string;
  createdAt: string; updatedAt: string;
  statusHistory: StatusHistoryEntry[];
  summary: PartTimeSummary
}

export interface WorkOrderRequest {
  title: string; description?: string; priority: Priority;
  customerId: number; siteId: number
}
export interface AssignRequest { technicianId: number }
export interface StatusTransitionRequest { toStatus: WOStatus; note?: string }
export interface LogPartsRequest { partId: number; quantity: number }
export interface LogTimeRequest { minutes: number; note?: string }

// ── Parts ─────────────────────────────────────────────────────────────────────
export interface Part {
  id: number; name: string; partNumber?: string;
  unitCost: number; stockQuantity: number; createdAt: string
}
export interface PartRequest {
  name: string; partNumber?: string; unitCost: number; stockQuantity: number
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export interface TechnicianLoad { technicianId: number; technicianName: string; openJobs: number }
export interface SiteLoad { siteId: number; siteName: string; openJobs: number }
export interface DashboardResponse {
  statusCounts: Record<string, number>;
  overdueCount: number; slaBreachedCount: number;
  slaCompliancePercent: number;
  technicianLoad: TechnicianLoad[];
  siteLoad: SiteLoad[];
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface Page<T> {
  content: T[]; totalElements: number; totalPages: number;
  number: number; size: number
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface NotificationItem {
  id: number; type: string; title: string; message: string;
  workOrderId?: number; workOrderCode?: string;
  read: boolean; createdAt: string
}
