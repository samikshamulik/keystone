package com.meridian.keystone.repository;

import com.meridian.keystone.domain.TimeLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLog, Long> {
    List<TimeLog> findAllByWorkOrderId(Long workOrderId);

    @Query("SELECT COALESCE(SUM(tl.minutes), 0) FROM TimeLog tl WHERE tl.workOrder.id = :woId")
    int totalMinutesByWorkOrder(@Param("woId") Long woId);
}
