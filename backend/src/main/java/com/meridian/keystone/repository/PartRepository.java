package com.meridian.keystone.repository;

import com.meridian.keystone.domain.Part;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PartRepository extends JpaRepository<Part, Long> {

    /** Pessimistic write lock to prevent concurrent stock inconsistency. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Part p WHERE p.id = :id")
    Optional<Part> findByIdForUpdate(@Param("id") Long id);

    @Query("""
        SELECT p FROM Part p
        WHERE (:search IS NULL
               OR LOWER(p.name)       LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(p.partNumber) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        """)
    Page<Part> search(@Param("search") String search, Pageable pageable);
}
