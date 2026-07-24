package com.meridian.keystone.repository;

import com.meridian.keystone.domain.WorkOrder;
import com.meridian.keystone.domain.WorkOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

public interface WorkOrderRepository extends JpaRepository<WorkOrder, Long> {

    Optional<WorkOrder> findByCode(String code);

    /** Role-scoped list with optional filters. */
    @Query("""
        SELECT wo FROM WorkOrder wo
        WHERE (:customerId IS NULL OR wo.customer.id = :customerId)
          AND (:assigneeId IS NULL OR wo.assignee.id = :assigneeId)
          AND (:status    IS NULL OR wo.status = :status)
          AND (:siteId    IS NULL OR wo.site.id = :siteId)
          AND (:search    IS NULL
               OR LOWER(wo.title) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(wo.code)  LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        """)
    Page<WorkOrder> search(
            @Param("customerId") Long customerId,
            @Param("assigneeId") Long assigneeId,
            @Param("status") WorkOrderStatus status,
            @Param("siteId") Long siteId,
            @Param("search") String search,
            Pageable pageable);

    /** For the Kanban board — all non-terminal, optionally scoped to assignee. */
    @Query("""
        SELECT wo FROM WorkOrder wo
        WHERE wo.status NOT IN (com.meridian.keystone.domain.WorkOrderStatus.CLOSED,
                                com.meridian.keystone.domain.WorkOrderStatus.CANCELLED)
          AND (:assigneeId IS NULL OR wo.assignee.id = :assigneeId)
        ORDER BY wo.priority ASC, wo.createdAt ASC
        """)
    List<WorkOrder> findOpenOrders(@Param("assigneeId") Long assigneeId);

    /** SLA breach detection — overdue and not yet marked breached. */
    List<WorkOrder> findBySlaBreachedFalseAndSlaDueAtBeforeAndStatusNotInAndStatusNotIn(
            Instant now,
            List<WorkOrderStatus> excludedStatuses1,
            List<WorkOrderStatus> excludedStatuses2);

    @Query("""
        SELECT wo FROM WorkOrder wo
        WHERE wo.slaBreached = false
          AND wo.slaDueAt IS NOT NULL
          AND wo.slaDueAt < :now
          AND wo.status NOT IN (
              com.meridian.keystone.domain.WorkOrderStatus.CLOSED,
              com.meridian.keystone.domain.WorkOrderStatus.CANCELLED)
        """)
    List<WorkOrder> findUnmarkedBreaches(@Param("now") Instant now);

    // --- Dashboard queries ---

    @Query("SELECT COUNT(wo) FROM WorkOrder wo WHERE wo.status = :status")
    long countByStatus(@Param("status") WorkOrderStatus status);

    @Query("""
        SELECT COUNT(wo) FROM WorkOrder wo
        WHERE wo.slaDueAt IS NOT NULL
          AND wo.slaDueAt < :now
          AND wo.status NOT IN (
              com.meridian.keystone.domain.WorkOrderStatus.CLOSED,
              com.meridian.keystone.domain.WorkOrderStatus.CANCELLED)
        """)
    long countOverdue(@Param("now") Instant now);

    @Query("""
        SELECT wo.assignee.id, wo.assignee.name, COUNT(wo)
        FROM WorkOrder wo
        WHERE wo.assignee IS NOT NULL
          AND wo.status NOT IN (
              com.meridian.keystone.domain.WorkOrderStatus.CLOSED,
              com.meridian.keystone.domain.WorkOrderStatus.CANCELLED)
        GROUP BY wo.assignee.id, wo.assignee.name
        ORDER BY COUNT(wo) DESC
        """)
    List<Object[]> countByTechnician();

    @Query("""
        SELECT wo.site.id, wo.site.name, COUNT(wo)
        FROM WorkOrder wo
        WHERE wo.status NOT IN (
              com.meridian.keystone.domain.WorkOrderStatus.CLOSED,
              com.meridian.keystone.domain.WorkOrderStatus.CANCELLED)
        GROUP BY wo.site.id, wo.site.name
        ORDER BY COUNT(wo) DESC
        """)
    List<Object[]> countBySite();
}
