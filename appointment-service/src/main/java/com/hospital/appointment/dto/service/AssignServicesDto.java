package com.hospital.appointment.dto.service;

import jakarta.validation.constraints.NotNull;

import java.util.List;

public record AssignServicesDto(
        @NotNull Integer doctorId,
        @NotNull List<Integer> serviceIds
) {}
