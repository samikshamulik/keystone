package com.meridian.keystone.repository;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
    Optional<Customer> findByUser(User user);
    Optional<Customer> findByUserId(Long userId);

    @Query("""
        SELECT c FROM Customer c
        WHERE (:search IS NULL
               OR LOWER(c.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
               OR LOWER(c.email) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')))
        """)
    Page<Customer> search(@Param("search") String search, Pageable pageable);
}
