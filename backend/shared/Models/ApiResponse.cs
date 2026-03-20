namespace Shared.Models;

/// <summary>Standard API response envelope used across all microservices.</summary>
public class ApiResponse<T>
{
    public bool   Success { get; init; }
    public string Message { get; init; } = string.Empty;
    public T?     Data    { get; init; }
    public object? Errors { get; init; }

    public static ApiResponse<T> Ok(T data, string message = "Success") =>
        new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message, object? errors = null) =>
        new() { Success = false, Message = message, Errors = errors };
}

/// <summary>Paginated response wrapper.</summary>
public class PagedApiResponse<T>
{
    public bool              Success  { get; init; }
    public IEnumerable<T>    Items    { get; init; } = [];
    public int               Total    { get; init; }
    public int               Page     { get; init; }
    public int               PageSize { get; init; }
    public int               Pages    => (int)Math.Ceiling((double)Total / PageSize);
}
