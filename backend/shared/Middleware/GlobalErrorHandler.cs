using System.Net;
using System.Text.Json;

namespace Shared.Middleware;

/// <summary>
/// Global exception handler middleware — catches unhandled exceptions,
/// logs them, and returns a consistent JSON error response.
/// Register with: app.UseMiddleware&lt;GlobalErrorHandler&gt;();
/// </summary>
public class GlobalErrorHandler
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalErrorHandler> _logger;

    public GlobalErrorHandler(RequestDelegate next, ILogger<GlobalErrorHandler> logger)
    {
        _next   = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}",
                context.Request.Method, context.Request.Path);

            context.Response.StatusCode  = (int)HttpStatusCode.InternalServerError;
            context.Response.ContentType = "application/json";

            var error = new
            {
                message   = "An unexpected error occurred.",
                requestId = context.TraceIdentifier,
            };

            await context.Response.WriteAsync(JsonSerializer.Serialize(error));
        }
    }
}
