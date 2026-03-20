namespace AuthService.src.Application.DTOs;

public record LoginRequest(string Email, string Password);

public record LoginResponse(
    string Token,
    UserDto User
);

public record UserDto(
    int    Id,
    string Name,
    string Email,
    string Role
);
