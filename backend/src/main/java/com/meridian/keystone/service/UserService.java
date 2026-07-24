package com.meridian.keystone.service;

import com.meridian.keystone.domain.Role;
import com.meridian.keystone.domain.User;
import com.meridian.keystone.dto.user.CreateUserRequest;
import com.meridian.keystone.dto.user.UserResponse;
import com.meridian.keystone.exception.ApiException;
import com.meridian.keystone.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepo;
    private final PasswordEncoder encoder;

    public UserService(UserRepository userRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.encoder  = encoder;
    }

    public List<UserResponse> listAll() {
        return userRepo.findAll().stream().map(UserResponse::from).toList();
    }

    public List<UserResponse> listTechnicians() {
        return userRepo.findAllByRole(Role.TECHNICIAN).stream().map(UserResponse::from).toList();
    }

    public UserResponse getById(Long id) {
        return UserResponse.from(findOrThrow(id));
    }

    @Transactional
    public UserResponse create(CreateUserRequest req) {
        if (userRepo.existsByEmail(req.email())) {
            throw ApiException.conflict("Email already in use: " + req.email());
        }
        User user = User.builder()
                .name(req.name())
                .email(req.email())
                .password(encoder.encode(req.password()))
                .role(req.role())
                .build();
        return UserResponse.from(userRepo.save(user));
    }

    @Transactional
    public UserResponse toggleEnabled(Long id) {
        User user = findOrThrow(id);
        user.setEnabled(!user.isEnabled());
        return UserResponse.from(userRepo.save(user));
    }

    User findOrThrow(Long id) {
        return userRepo.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found: " + id));
    }
}
