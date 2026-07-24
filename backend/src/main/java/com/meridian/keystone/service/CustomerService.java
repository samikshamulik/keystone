package com.meridian.keystone.service;

import com.meridian.keystone.domain.Customer;
import com.meridian.keystone.domain.Site;
import com.meridian.keystone.dto.customer.CustomerRequest;
import com.meridian.keystone.dto.customer.CustomerResponse;
import com.meridian.keystone.dto.site.SiteRequest;
import com.meridian.keystone.dto.site.SiteResponse;
import com.meridian.keystone.exception.ApiException;
import com.meridian.keystone.repository.CustomerRepository;
import com.meridian.keystone.repository.SiteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository customerRepo;
    private final SiteRepository siteRepo;

    public CustomerService(CustomerRepository customerRepo, SiteRepository siteRepo) {
        this.customerRepo = customerRepo;
        this.siteRepo     = siteRepo;
    }

    public Page<CustomerResponse> list(String search, Pageable pageable) {
        return customerRepo.search(search, pageable).map(CustomerResponse::from);
    }

    public CustomerResponse getById(Long id) {
        return CustomerResponse.from(findCustomerOrThrow(id));
    }

    @Transactional
    public CustomerResponse create(CustomerRequest req) {
        if (customerRepo.existsByEmail(req.email())) {
            throw ApiException.conflict("Customer email already exists: " + req.email());
        }
        Customer c = Customer.builder()
                .name(req.name()).email(req.email())
                .phone(req.phone()).address(req.address()).build();
        return CustomerResponse.from(customerRepo.save(c));
    }

    @Transactional
    public CustomerResponse update(Long id, CustomerRequest req) {
        Customer c = findCustomerOrThrow(id);
        if (!c.getEmail().equals(req.email()) && customerRepo.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already in use: " + req.email());
        }
        c.setName(req.name()); c.setEmail(req.email());
        c.setPhone(req.phone()); c.setAddress(req.address());
        return CustomerResponse.from(customerRepo.save(c));
    }

    // --- Sites ---

    public Page<SiteResponse> listSites(Long customerId, String search, Pageable pageable) {
        findCustomerOrThrow(customerId);
        return siteRepo.searchByCustomer(customerId, search, pageable).map(SiteResponse::from);
    }

    public SiteResponse getSite(Long customerId, Long siteId) {
        Site site = findSiteOrThrow(siteId);
        if (!site.getCustomer().getId().equals(customerId)) {
            throw ApiException.notFound("Site not found for this customer");
        }
        return SiteResponse.from(site);
    }

    @Transactional
    public SiteResponse createSite(Long customerId, SiteRequest req) {
        Customer customer = findCustomerOrThrow(customerId);
        Site site = Site.builder()
                .customer(customer).name(req.name()).address(req.address())
                .city(req.city()).postcode(req.postcode()).build();
        return SiteResponse.from(siteRepo.save(site));
    }

    @Transactional
    public SiteResponse updateSite(Long customerId, Long siteId, SiteRequest req) {
        Site site = findSiteOrThrow(siteId);
        if (!site.getCustomer().getId().equals(customerId)) {
            throw ApiException.notFound("Site not found for this customer");
        }
        site.setName(req.name()); site.setAddress(req.address());
        site.setCity(req.city()); site.setPostcode(req.postcode());
        return SiteResponse.from(siteRepo.save(site));
    }

    // --- Internal helpers ---

    Customer findCustomerOrThrow(Long id) {
        return customerRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Customer not found: " + id));
    }

    public Site findSiteOrThrow(Long id) {
        return siteRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Site not found: " + id));
    }
}
