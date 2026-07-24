package com.meridian.keystone.controller;

import com.meridian.keystone.dto.user.CreateUserRequest;
import com.meridian.keystone.dto.user.UserResponse;
import com.meridian.keystone.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@Tag(name = "Users", description = "User management (Manager only)")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "List all users")
    public List<UserResponse> listAll() {
        return userService.listAll();
    }

    @GetMapping("/technicians")
    @PreAuthorize("hasAnyRole('MANAGER','DISPATCHER')")
    @Operation(summary = "List all active technicians")
    public List<UserResponse> listTechnicians() {
        return userService.listTechnicians();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Get user by ID")
    public UserResponse getById(@PathVariable Long id) {
        return userService.getById(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Create a new user")
    public ResponseEntity<UserResponse> create(@Valid @RequestBody CreateUserRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(req));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('MANAGER')")
    @Operation(summary = "Enable or disable a user account")
    public UserResponse toggleEnabled(@PathVariable Long id) {
        return userService.toggleEnabled(id);
    }
}
