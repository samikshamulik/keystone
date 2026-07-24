package com.meridian.keystone.dto.dashboard;

import java.util.List;
import java.util.Map;

public record DashboardResponse(
        Map<String, Long> statusCounts,
        long overdueCount,
        long slaBreachedCount,
        double slaCompliancePercent,
        List<TechnicianLoad> technicianLoad,
        List<SiteLoad> siteLoad
) {
    public record TechnicianLoad(Long technicianId, String technicianName, long openJobs) {}
    public record SiteLoad(Long siteId, String siteName, long openJobs) {}
}
