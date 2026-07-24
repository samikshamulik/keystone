package com.meridian.keystone.repository;

import com.meridian.keystone.domain.PartUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface PartUsageRepository extends JpaRepository<PartUsage, Long> {
    List<PartUsage> findAllByWorkOrderId(Long workOrderId);

    @Query("SELECT COALESCE(SUM(pu.quantity * pu.unitCostAtUse), 0) FROM PartUsage pu WHERE pu.workOrder.id = :woId")
    BigDecimal totalCostByWorkOrder(@Param("woId") Long woId);
}
