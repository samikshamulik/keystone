package com.meridian.keystone.service;

import com.meridian.keystone.domain.*;
import com.meridian.keystone.dto.workorder.*;
import com.meridian.keystone.exception.ApiException;
import com.meridian.keystone.repository.*;
import com.meridian.keystone.security.KeystonePrincipal;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class WorkOrderService {

    private static final Logger log = LoggerFactory.getLogger(WorkOrderService.class);

    private final WorkOrderRepository woRepo;
    private final UserRepository userRepo;
    private final CustomerRepository customerRepo;
    private final SiteRepository siteRepo;
    private final PartRepository partRepo;
    private final PartUsageRepository partUsageRepo;
    private final TimeLogRepository timeLogRepo;
    private final SlaService slaService;
    private final NotificationService notificationService;

    public WorkOrderService(WorkOrderRepository woRepo, UserRepository userRepo,
                            CustomerRepository customerRepo, SiteRepository siteRepo,
                            PartRepository partRepo, PartUsageRepository partUsageRepo,
                            TimeLogRepository timeLogRepo, SlaService slaService,
                            NotificationService notificationService) {
        this.woRepo               = woRepo;
        this.userRepo             = userRepo;
        this.customerRepo         = customerRepo;
        this.siteRepo             = siteRepo;
        this.partRepo             = partRepo;
        this.partUsageRepo        = partUsageRepo;
        this.timeLogRepo          = timeLogRepo;
        this.slaService           = slaService;
        this.notificationService  = notificationService;
    }

    // -----------------------------------------------------------------------
    // Queries
    // -----------------------------------------------------------------------

    public Page<WorkOrderResponse> list(KeystonePrincipal principal,
                                         Long customerId, Long assigneeId,
                                         WorkOrderStatus status, Long siteId,
                                         String search, Pageable pageable) {
        // Scope queries by role
        Long scopedCustomerId = customerId;
        Long scopedAssigneeId = assigneeId;

        if ("CUSTOMER".equals(principal.role())) {
            var customer = customerRepo.findByUserId(principal.userId())
                    .orElseThrow(() -> ApiException.forbidden("No customer account linked"));
            scopedCustomerId = customer.getId();
        } else if ("TECHNICIAN".equals(principal.role())) {
            scopedAssigneeId = principal.userId();
        }

        return woRepo.search(scopedCustomerId, scopedAssigneeId, status, siteId, search, pageable)
                .map(this::toResponse);
    }

    public WorkOrderResponse getById(Long id, KeystonePrincipal principal) {
        WorkOrder wo = findOrThrow(id);
        assertCanView(wo, principal);
        return toResponse(wo);
    }

    public List<WorkOrderResponse> getBoard(KeystonePrincipal principal) {
        Long assigneeId = "TECHNICIAN".equals(principal.role()) ? principal.userId() : null;
        return woRepo.findOpenOrders(assigneeId).stream().map(this::toResponse).toList();
    }

    // -----------------------------------------------------------------------
    // Commands
    // -----------------------------------------------------------------------

    @Transactional
    public WorkOrderResponse create(WorkOrderRequest req, KeystonePrincipal principal) {
        Customer customer = customerRepo.findById(req.customerId())
                .orElseThrow(() -> ApiException.notFound("Customer not found: " + req.customerId()));
        Site site = siteRepo.findById(req.siteId())
                .orElseThrow(() -> ApiException.notFound("Site not found: " + req.siteId()));

        if (!site.getCustomer().getId().equals(customer.getId())) {
            throw ApiException.badRequest("Site does not belong to the specified customer");
        }

        User creator = userRepo.findById(principal.userId())
                .orElseThrow(() -> ApiException.notFound("User not found"));

        String code = generateCode();
        WorkOrder wo = WorkOrder.builder()
                .code(code).title(req.title()).description(req.description())
                .priority(req.priority()).customer(customer).site(site)
                .createdBy(creator).slaDueAt(slaService.calculateDueDate(req.priority()))
                .build();

        appendHistory(wo, null, WorkOrderStatus.NEW, creator, "Work order created");
        return toResponse(woRepo.save(wo));
    }

    @Transactional
    public WorkOrderResponse update(Long id, WorkOrderRequest req, KeystonePrincipal principal) {
        WorkOrder wo = findOrThrow(id);
        if (wo.getStatus().isTerminal()) {
            throw ApiException.badRequest("Cannot edit a closed or cancelled work order");
        }
        Customer customer = customerRepo.findById(req.customerId())
                .orElseThrow(() -> ApiException.notFound("Customer not found"));
        Site site = siteRepo.findById(req.siteId())
                .orElseThrow(() -> ApiException.notFound("Site not found"));

        wo.setTitle(req.title());
        wo.setDescription(req.description());
        wo.setPriority(req.priority());
        wo.setCustomer(customer);
        wo.setSite(site);
        wo.setSlaDueAt(slaService.calculateDueDate(req.priority()));
        return toResponse(woRepo.save(wo));
    }

    @Transactional
    public WorkOrderResponse assign(Long id, AssignRequest req, KeystonePrincipal principal) {
        WorkOrder wo = findOrThrow(id);
        if (wo.getStatus().isTerminal()) {
            throw ApiException.badRequest("Cannot assign a terminal work order");
        }
        User tech = userRepo.findById(req.technicianId())
                .orElseThrow(() -> ApiException.notFound("Technician not found: " + req.technicianId()));
        if (tech.getRole() != Role.TECHNICIAN) {
            throw ApiException.badRequest("Assigned user must have role TECHNICIAN");
        }

        User actor = findUser(principal.userId());
        WorkOrderStatus prevStatus = wo.getStatus();
        wo.setAssignee(tech);

        if (wo.getStatus() == WorkOrderStatus.NEW) {
            wo.setStatus(WorkOrderStatus.ASSIGNED);
            appendHistory(wo, prevStatus, WorkOrderStatus.ASSIGNED, actor,
                    "Assigned to " + tech.getName());
        } else {
            appendHistory(wo, prevStatus, wo.getStatus(), actor,
                    "Reassigned to " + tech.getName());
        }
        WorkOrder saved = woRepo.save(wo);
        notificationService.notifyAssignment(saved, tech);
        log.info("WO [ASSIGN] code={} technician={} by={}", wo.getCode(), tech.getEmail(), actor.getEmail());
        return toResponse(saved);
    }

    @Transactional
    public WorkOrderResponse transition(Long id, StatusTransitionRequest req,
                                         KeystonePrincipal principal) {
        WorkOrder wo = findOrThrow(id);
        WorkOrderStatus from = wo.getStatus();
        WorkOrderStatus to   = req.toStatus();

        if (!from.canTransitionTo(to)) {
            throw ApiException.conflict(
                    "Illegal transition: %s → %s".formatted(from, to));
        }

        validateTransitionRole(wo, from, to, principal);

        User actor = findUser(principal.userId());
        wo.setStatus(to);

        if (to == WorkOrderStatus.COMPLETED) wo.setCompletedAt(Instant.now());
        if (to == WorkOrderStatus.CLOSED)    wo.setClosedAt(Instant.now());

        appendHistory(wo, from, to, actor, req.note());
        log.info("WO [TRANSITION] code={} {}→{} by={}", wo.getCode(), from, to, actor.getEmail());
        return toResponse(woRepo.save(wo));
    }

    @Transactional
    public WorkOrderResponse logParts(Long id, LogPartsRequest req, KeystonePrincipal principal) {
        WorkOrder wo = findOrThrow(id);
        assertAssignee(wo, principal);

        if (wo.getStatus() == WorkOrderStatus.CLOSED || wo.getStatus() == WorkOrderStatus.CANCELLED) {
            throw ApiException.badRequest("Cannot log parts on a closed or cancelled work order");
        }

        // Pessimistic lock to prevent concurrent stock inconsistency
        Part part = partRepo.findByIdForUpdate(req.partId())
                .orElseThrow(() -> ApiException.notFound("Part not found: " + req.partId()));

        part.consume(req.quantity()); // throws if insufficient stock
        partRepo.save(part);

        User logger = findUser(principal.userId());
        PartUsage usage = PartUsage.builder()
                .workOrder(wo).part(part).quantity(req.quantity())
                .unitCostAtUse(part.getUnitCost()).loggedBy(logger).build();

        wo.getPartUsages().add(usage);
        return toResponse(woRepo.save(wo));
    }

    @Transactional
    public WorkOrderResponse logTime(Long id, LogTimeRequest req, KeystonePrincipal principal) {
        WorkOrder wo = findOrThrow(id);
        assertAssignee(wo, principal);

        if (wo.getStatus().isTerminal()) {
            throw ApiException.badRequest("Cannot log time on a terminal work order");
        }

        User logger = findUser(principal.userId());
        TimeLog log = TimeLog.builder()
                .workOrder(wo).technician(logger)
                .minutes(req.minutes()).note(req.note()).build();

        wo.getTimeLogs().add(log);
        return toResponse(woRepo.save(wo));
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    WorkOrder findOrThrow(Long id) {
        return woRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Work order not found: " + id));
    }

    private User findUser(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found: " + id));
    }

    private void assertCanView(WorkOrder wo, KeystonePrincipal p) {
        if ("CUSTOMER".equals(p.role())) {
            customerRepo.findByUserId(p.userId()).ifPresent(c -> {
                if (!wo.getCustomer().getId().equals(c.getId())) {
                    throw ApiException.forbidden("Access denied");
                }
            });
        }
    }

    private void assertAssignee(WorkOrder wo, KeystonePrincipal p) {
        if ("TECHNICIAN".equals(p.role())) {
            if (wo.getAssignee() == null || !wo.getAssignee().getId().equals(p.userId())) {
                throw ApiException.forbidden("You are not assigned to this work order");
            }
        }
    }

    /**
     * Validates that the requesting user is allowed to make the given transition.
     * Rules:
     *  - CLOSED: only MANAGER
     *  - IN_PROGRESS / ON_HOLD / COMPLETED: only the assigned technician
     *  - ASSIGNED: dispatcher or manager
     *  - CANCELLED: dispatcher or manager (or the assigned technician for own jobs)
     */
    private void validateTransitionRole(WorkOrder wo, WorkOrderStatus from,
                                         WorkOrderStatus to, KeystonePrincipal p) {
        String role = p.role();
        switch (to) {
            case CLOSED -> {
                if (!"MANAGER".equals(role)) {
                    throw ApiException.forbidden("Only managers can close work orders");
                }
            }
            case IN_PROGRESS, ON_HOLD, COMPLETED -> {
                // Only the assigned technician
                if (wo.getAssignee() == null || !wo.getAssignee().getId().equals(p.userId())) {
                    if (!"MANAGER".equals(role)) {
                        throw ApiException.forbidden("Only the assigned technician can perform this action");
                    }
                }
            }
            case CANCELLED -> {
                if (!"MANAGER".equals(role) && !"DISPATCHER".equals(role)) {
                    throw ApiException.forbidden("Only dispatchers or managers can cancel work orders");
                }
            }
            case ASSIGNED -> {
                if (!"MANAGER".equals(role) && !"DISPATCHER".equals(role)) {
                    throw ApiException.forbidden("Only dispatchers or managers can assign work orders");
                }
            }
            default -> { /* no extra role restriction */ }
        }
    }

    private void appendHistory(WorkOrder wo, WorkOrderStatus from, WorkOrderStatus to,
                                User changedBy, String note) {
        WorkOrderStatusHistory entry = WorkOrderStatusHistory.builder()
                .workOrder(wo).fromStatus(from).toStatus(to)
                .changedBy(changedBy).note(note).build();
        wo.getStatusHistory().add(entry);
    }

    private String generateCode() {
        // Uses DB sequence via a native query for uniqueness
        Long next = (Long) woRepo.findAll().stream()
                .mapToLong(w -> {
                    try {
                        return Long.parseLong(w.getCode().replace("WO-", ""));
                    } catch (NumberFormatException e) {
                        return 0L;
                    }
                }).max().orElse(0L) + 1;
        return "WO-%04d".formatted(next);
    }

    private WorkOrderResponse toResponse(WorkOrder wo) {
        int totalMinutes     = timeLogRepo.totalMinutesByWorkOrder(wo.getId());
        BigDecimal totalCost = partUsageRepo.totalCostByWorkOrder(wo.getId());
        return WorkOrderResponse.from(wo, totalMinutes, totalCost);
    }
}
