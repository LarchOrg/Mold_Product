using Microsoft.Data.SqlClient;
using AuthService.src.Domain.Entities;
using AuthService.src.Domain.Interfaces;
using AuthService.src.Infrastructure.Data;

namespace AuthService.src.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DbConnectionFactory _db;

    public UserRepository(DbConnectionFactory db) => _db = db;

    public async Task<User?> GetByEmailAsync(string email)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_GetUserByEmail", conn)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Email", email);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return MapUser(reader);
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_GetUserById", conn)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        if (!await reader.ReadAsync()) return null;

        return MapUser(reader);
    }

    public async Task<int> CreateAsync(User user)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_CreateUser", conn)
        {
            CommandType = System.Data.CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Name",         user.Name);
        cmd.Parameters.AddWithValue("@Email",        user.Email);
        cmd.Parameters.AddWithValue("@PasswordHash", user.PasswordHash);
        cmd.Parameters.AddWithValue("@Role",         user.Role);

        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    private static User MapUser(SqlDataReader r) => new()
    {
        Id           = r.GetInt32(r.GetOrdinal("Id")),
        Name         = r.GetString(r.GetOrdinal("Name")),
        Email        = r.GetString(r.GetOrdinal("Email")),
        PasswordHash = r.GetString(r.GetOrdinal("PasswordHash")),
        Role         = r.GetString(r.GetOrdinal("Role")),
        IsActive     = r.GetBoolean(r.GetOrdinal("IsActive")),
    };
}
