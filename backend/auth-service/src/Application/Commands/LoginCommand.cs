using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using AuthService.src.Application.DTOs;
using AuthService.src.Domain.Interfaces;

namespace AuthService.src.Application.Commands;

public class LoginCommand
{
    private readonly IUserRepository _users;
    private readonly IConfiguration  _config;

    public LoginCommand(IUserRepository users, IConfiguration config)
    {
        _users  = users;
        _config = config;
    }

    public async Task<LoginResponse?> ExecuteAsync(LoginRequest request)
    {
        var user = await _users.GetByEmailAsync(request.Email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return null;

        var token = GenerateJwt(user);

        return new LoginResponse(
            Token: token,
            User:  new UserDto(user.Id, user.Name, user.Email, user.Role)
        );
    }

    private string GenerateJwt(Domain.Entities.User user)
    {
        var secret  = _config["Jwt:Secret"]!;
        var issuer  = _config["Jwt:Issuer"]!;
        var audience= _config["Jwt:Audience"]!;
        var expiry  = int.Parse(_config["Jwt:ExpiryMinutes"] ?? "480");

        var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub,   user.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(ClaimTypes.Name,               user.Name),
            new Claim(ClaimTypes.Role,               user.Role),
            new Claim(JwtRegisteredClaimNames.Jti,   Guid.NewGuid().ToString()),
        };

        var token = new JwtSecurityToken(
            issuer:             issuer,
            audience:           audience,
            claims:             claims,
            expires:            DateTime.UtcNow.AddMinutes(expiry),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
