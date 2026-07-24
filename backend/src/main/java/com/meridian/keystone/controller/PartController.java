package com.meridian.keystone.controller;

import com.meridian.keystone.dto.part.PartRequest;
import com.meridian.keystone.dto.part.PartResponse;
import com.meridian.keystone.service.PartService;
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
@RequestMapping("/api/parts")
@Tag(name = "Parts", description = "Parts inventory management")
@SecurityRequirement(name = "bearerAuth")
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','TECHNICIAN')")
    @Operation(summary = "List parts (searchable, paginated)")
    public Page<PartResponse> list(@RequestParam(required = false) String search,
                                    @PageableDefault(size = 20) Pageable pageable) {
        return partService.list(search, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER','TECHNICIAN')")
    @Operation(summary = "Get a part by ID")
    public PartResponse getById(@PathVariable Long id) {
        return partService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Create a part (Manager only)")
    public ResponseEntity<PartResponse> create(@Valid @RequestBody PartRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Update a part")
    public PartResponse update(@PathVariable Long id, @Valid @RequestBody PartRequest req) {
        return partService.update(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Delete a part")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        partService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
