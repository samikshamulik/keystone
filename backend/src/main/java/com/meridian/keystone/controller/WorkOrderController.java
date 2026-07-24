package com.meridian.keystone.controller;

import com.meridian.keystone.domain.WorkOrderStatus;
import com.meridian.keystone.dto.workorder.*;
import com.meridian.keystone.security.KeystonePrincipal;
import com.meridian.keystone.service.WorkOrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/work-orders")
@Tag(name = "Work Orders", description = "Work-order lifecycle management")
@SecurityRequirement(name = "bearerAuth")
public class WorkOrderController {

    private final WorkOrderService workOrderService;

    public WorkOrderController(WorkOrderService workOrderService) {
        this.workOrderService = workOrderService;
    }

    @GetMapping
    @Operation(summary = "List work orders (role-scoped, filterable, paginated)")
    public Page<WorkOrderResponse> list(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long assigneeId,
            @RequestParam(required = false) WorkOrderStatus status,
            @RequestParam(required = false) Long siteId,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable,
            @AuthenticationPrincipal KeystonePrincipal principal) {
        return workOrderService.list(principal, customerId, assigneeId, status, siteId, search, pageable);
    }

    @GetMapping("/board")
    @Operation(summary = "Kanban board — all open work orders grouped by status")
    public List<WorkOrderResponse> board(@AuthenticationPrincipal KeystonePrincipal principal) {
        return workOrderService.getBoard(principal);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single work order with full history")
    public WorkOrderResponse getById(@PathVariable Long id,
                                      @AuthenticationPrincipal KeystonePrincipal principal) {
        return workOrderService.getById(id, principal);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','CUSTOMER')")
    @Operation(summary = "Create a work order")
    public ResponseEntity<WorkOrderResponse> create(
            @Valid @RequestBody WorkOrderRequest req,
            @AuthenticationPrincipal KeystonePrincipal principal) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(workOrderService.create(req, principal));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Update work order details (while open)")
    public WorkOrderResponse update(@PathVariable Long id,
                                     @Valid @RequestBody WorkOrderRequest req,
                                     @AuthenticationPrincipal KeystonePrincipal principal) {
        return workOrderService.update(id, req, principal);
    }

    @PostMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Assign (or reassign) a work order to a technician")
    public WorkOrderResponse assign(@PathVariable Long id,
                                     @Valid @RequestBody AssignRequest req,
                                     @AuthenticationPrincipal KeystonePrincipal principal) {
        return workOrderService.assign(id, req, principal);
    }

    @PostMapping("/{id}/status")
    @Operation(summary = "Transition the work order status (validates lifecycle rules)")
    public WorkOrderResponse transition(@PathVariable Long id,
                                         @Valid @RequestBody StatusTransitionRequest req,
                                         @AuthenticationPrincipal KeystonePrincipal principal) {
        return workOrderService.transition(id, req, principal);
    }

    @PostMapping("/{id}/parts")
    @PreAuthorize("hasAnyRole('MANAGER','TECHNICIAN')")
    @Operation(summary = "Log parts used — decrements stock transactionally")
    public WorkOrderResponse logParts(@PathVariable Long id,
                                       @Valid @RequestBody LogPartsRequest req,
                                       @AuthenticationPrincipal KeystonePrincipal principal) {
        return workOrderService.logParts(id, req, principal);
    }

    @PostMapping("/{id}/time")
    @PreAuthorize("hasAnyRole('MANAGER','TECHNICIAN')")
    @Operation(summary = "Log time spent on a work order")
    public WorkOrderResponse logTime(@PathVariable Long id,
                                      @Valid @RequestBody LogTimeRequest req,
                                      @AuthenticationPrincipal KeystonePrincipal principal) {
        return workOrderService.logTime(id, req, principal);
    }
}
