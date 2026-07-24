package com.meridian.keystone.service;

import com.meridian.keystone.domain.Part;
import com.meridian.keystone.dto.part.PartRequest;
import com.meridian.keystone.dto.part.PartResponse;
import com.meridian.keystone.exception.ApiException;
import com.meridian.keystone.repository.PartRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PartService {

    private final PartRepository partRepo;

    public PartService(PartRepository partRepo) {
        this.partRepo = partRepo;
    }

    public Page<PartResponse> list(String search, Pageable pageable) {
        return partRepo.search(search, pageable).map(PartResponse::from);
    }

    public PartResponse getById(Long id) {
        return PartResponse.from(findOrThrow(id));
    }

    @Transactional
    public PartResponse create(PartRequest req) {
        Part p = Part.builder()
                .name(req.name()).partNumber(req.partNumber())
                .unitCost(req.unitCost()).stockQuantity(req.stockQuantity()).build();
        return PartResponse.from(partRepo.save(p));
    }

    @Transactional
    public PartResponse update(Long id, PartRequest req) {
        Part p = findOrThrow(id);
        p.setName(req.name()); p.setPartNumber(req.partNumber());
        p.setUnitCost(req.unitCost()); p.setStockQuantity(req.stockQuantity());
        return PartResponse.from(partRepo.save(p));
    }

    @Transactional
    public void delete(Long id) {
        partRepo.delete(findOrThrow(id));
    }

    private Part findOrThrow(Long id) {
        return partRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("Part not found: " + id));
    }
}
