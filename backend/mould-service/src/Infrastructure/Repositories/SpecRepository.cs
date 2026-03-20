using System.Data;
using Microsoft.Data.SqlClient;
using MouldService.src.Domain.Entities;
using MouldService.src.Domain.Interfaces;
using MouldService.src.Infrastructure.Data;

namespace MouldService.src.Infrastructure.Repositories;

public class SpecRepository : ISpecRepository
{
    private readonly DbConnectionFactory _db;

    public SpecRepository(DbConnectionFactory db) => _db = db;

    public async Task<IEnumerable<SpecEntry>> GetAllAsync(int mouldId, string? pmFreq)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_fetch_Maintenance_Spec_Entry_mst", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@qstrMType",    2);   // 2 = Mould type
        cmd.Parameters.AddWithValue("@qstrMMoption", mouldId);
        cmd.Parameters.AddWithValue("@qstrPMFreq",   (object?)pmFreq ?? DBNull.Value);

        var specs = new List<SpecEntry>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            specs.Add(MapSpec(reader));

        return specs;
    }

    public async Task<SpecEntry?> GetByIdAsync(int id)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_fetch_Maintenance_Spec_Entry_mst_byId", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@ID", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapSpec(reader) : null;
    }

    public async Task<int> CreateAsync(SpecEntry spec)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_insert_Maintenance_Spec_Entry_Mst", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        AddSpecParams(cmd, spec);

        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    public async Task<bool> UpdateAsync(SpecEntry spec)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_update_Specc_entry_Mst", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id",                 spec.Id);
        cmd.Parameters.AddWithValue("@PmFreq",             spec.PMFreq);
        cmd.Parameters.AddWithValue("@CheckAreas",         spec.CheckArea);
        cmd.Parameters.AddWithValue("@CheckPoint",         spec.CheckPoint);
        cmd.Parameters.AddWithValue("@CheckMethod",        spec.CheckMethod);
        cmd.Parameters.AddWithValue("@RequiredCondition",  spec.RequiredCondition);
        cmd.Parameters.AddWithValue("@Orderby",            spec.OrderBy);
        cmd.Parameters.AddWithValue("@Image",              (object?)spec.ImageId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@UpdatedBy",          spec.CreatedBy);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_delete_Maintenance_Spec_Entry", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@ID", id);

        return await cmd.ExecuteNonQueryAsync() > 0;
    }

    private static void AddSpecParams(SqlCommand cmd, SpecEntry s)
    {
        cmd.Parameters.AddWithValue("@MaintenanceId",     2); // Mould type = 2
        cmd.Parameters.AddWithValue("@MouldMachineId",    s.MouldId);
        cmd.Parameters.AddWithValue("@PMFreq",            s.PMFreq);
        cmd.Parameters.AddWithValue("@CheckAreas",        s.CheckArea);
        cmd.Parameters.AddWithValue("@CheckItem",         s.CheckPoint);
        cmd.Parameters.AddWithValue("@CheckMethod",       s.CheckMethod);
        cmd.Parameters.AddWithValue("@Result",            s.RequiredCondition);
        cmd.Parameters.AddWithValue("@Orderby",           s.OrderBy);
        cmd.Parameters.AddWithValue("@ImageId",           (object?)s.ImageId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CreatedBy",         s.CreatedBy);
    }

    private static SpecEntry MapSpec(SqlDataReader r)
    {
        int Ord(string n) => r.GetOrdinal(n);
        return new SpecEntry
        {
            Id                = r.GetInt32(Ord("Id")),
            MouldId           = r.IsDBNull(Ord("MouldMachineId"))  ? 0  : r.GetInt32(Ord("MouldMachineId")),
            MouldCode         = r.IsDBNull(Ord("MouldMachineCode")) ? "" : r.GetString(Ord("MouldMachineCode")),
            MouldName         = r.IsDBNull(Ord("MouldMachineName")) ? "" : r.GetString(Ord("MouldMachineName")),
            PMFreq            = r.IsDBNull(Ord("PMFreq"))           ? "" : r.GetString(Ord("PMFreq")),
            CheckArea         = r.IsDBNull(Ord("CheckAreas"))       ? "" : r.GetString(Ord("CheckAreas")),
            CheckPoint        = r.IsDBNull(Ord("CheckPoint"))       ? "" : r.GetString(Ord("CheckPoint")),
            CheckMethod       = r.IsDBNull(Ord("CheckMethod"))      ? "" : r.GetString(Ord("CheckMethod")),
            RequiredCondition = r.IsDBNull(Ord("Result"))           ? "" : r.GetString(Ord("Result")),
            OrderBy           = r.IsDBNull(Ord("orderby"))          ? 0  : r.GetInt32(Ord("orderby")),
        };
    }
}
