package com.meridian.keystone.dto.workorder;

import jakarta.validation.constraints.NotNull;

public record AssignRequest(@NotNull Long technicianId) {}
