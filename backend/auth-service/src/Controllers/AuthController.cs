using Microsoft.AspNetCore.Mvc;
using AuthService.src.Application.Commands;
using AuthService.src.Application.DTOs;

namespace AuthService.src.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly LoginCommand _loginCommand;
    private readonly ILogger<AuthController> _logger;

    public AuthController(LoginCommand loginCommand, ILogger<AuthController> logger)
    {
        _loginCommand = loginCommand;
        _logger       = logger;
    }

    /// <summary>Authenticate user and return JWT token.</summary>
    [HttpPost("login")]
    [ProducesResponseType(typeof(LoginResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        try
        {
            var result = await _loginCommand.ExecuteAsync(request);
            if (result is null)
                return Unauthorized(new { message = "Invalid email or password." });

            _logger.LogInformation("User {Email} logged in at {Time}", request.Email, DateTime.UtcNow);
            return Ok(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Login error for {Email}", request.Email);
            return StatusCode(500, new { message = "An error occurred during login." });
        }
    }

    /// <summary>Health check endpoint.</summary>
    [HttpGet("health")]
    public IActionResult Health() => Ok(new { status = "auth-service OK", timestamp = DateTime.UtcNow });
}
