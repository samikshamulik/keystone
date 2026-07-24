package com.meridian.keystone.controller;

import com.meridian.keystone.dto.customer.CustomerRequest;
import com.meridian.keystone.dto.customer.CustomerResponse;
import com.meridian.keystone.dto.site.SiteRequest;
import com.meridian.keystone.dto.site.SiteResponse;
import com.meridian.keystone.service.CustomerService;
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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@Tag(name = "Customers & Sites", description = "Customer and site management")
@SecurityRequirement(name = "bearerAuth")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // --- Customers ---

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "List customers (searchable, paginated)")
    public Page<CustomerResponse> list(@RequestParam(required = false) String search,
                                        @PageableDefault(size = 20) Pageable pageable) {
        return customerService.list(search, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Get a customer by ID")
    public CustomerResponse getById(@PathVariable Long id) {
        return customerService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Create a customer")
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CustomerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(customerService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Update a customer")
    public CustomerResponse update(@PathVariable Long id, @Valid @RequestBody CustomerRequest req) {
        return customerService.update(id, req);
    }

    // --- Sites ---

    @GetMapping("/{customerId}/sites")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "List sites for a customer")
    public Page<SiteResponse> listSites(@PathVariable Long customerId,
                                         @RequestParam(required = false) String search,
                                         @PageableDefault(size = 20) Pageable pageable) {
        return customerService.listSites(customerId, search, pageable);
    }

    @GetMapping("/{customerId}/sites/{siteId}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Get a specific site")
    public SiteResponse getSite(@PathVariable Long customerId, @PathVariable Long siteId) {
        return customerService.getSite(customerId, siteId);
    }

    @PostMapping("/{customerId}/sites")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Add a site to a customer")
    public ResponseEntity<SiteResponse> createSite(@PathVariable Long customerId,
                                                    @Valid @RequestBody SiteRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(customerService.createSite(customerId, req));
    }

    @PutMapping("/{customerId}/sites/{siteId}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "Update a site")
    public SiteResponse updateSite(@PathVariable Long customerId,
                                    @PathVariable Long siteId,
                                    @Valid @RequestBody SiteRequest req) {
        return customerService.updateSite(customerId, siteId, req);
    }
}
