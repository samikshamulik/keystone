package com.meridian.keystone.controller;

import com.meridian.keystone.dto.dashboard.DashboardResponse;
import com.meridian.keystone.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports & Dashboard", description = "Operational dashboards and reporting")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final DashboardService dashboardService;

    public ReportController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Dashboard summary — status counts, overdue, SLA compliance, technician load")
    public DashboardResponse summary() {
        return dashboardService.getSummary();
    }
}
