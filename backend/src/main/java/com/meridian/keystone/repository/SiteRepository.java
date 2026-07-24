package com.meridian.keystone.repository;

import com.meridian.keystone.domain.Site;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SiteRepository extends JpaRepository<Site, Long> {
    List<Site> findAllByCustomerId(Long customerId);

    @Query("""
        SELECT s FROM Site s
        WHERE s.customer.id = :customerId
          AND (:search IS NULL
               OR LOWER(s.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(s.city) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        """)
    Page<Site> searchByCustomer(@Param("customerId") Long customerId,
                                @Param("search") String search,
                                Pageable pageable);
}
