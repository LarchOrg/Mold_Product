using System.Data;
using Microsoft.Data.SqlClient;
using MouldService.src.Domain.Entities;
using MouldService.src.Domain.Interfaces;
using MouldService.src.Infrastructure.Data;

namespace MouldService.src.Infrastructure.Repositories;

public class PMPlanRepository : IPMPlanRepository
{
    private readonly DbConnectionFactory _db;

    public PMPlanRepository(DbConnectionFactory db) => _db = db;

    public async Task<IEnumerable<PMPlan>> GetAllAsync(int? rightsId = null)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_fetch_mould_PM_schedule", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@qstrId", (object?)rightsId ?? DBNull.Value);

        var plans = new List<PMPlan>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            plans.Add(MapPlan(reader));

        return plans;
    }

    public async Task<PMPlan?> GetByIdAsync(int id)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_fetch_mould_PM_scheduleBy_id", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@ID", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapPlan(reader) : null;
    }

    public async Task<(string ReportNo, bool Success)> CreateAsync(PMPlan plan)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("Pr_Insert_Mould_PM_Schedule", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Date",      plan.TargetDate.ToString("dd/MM/yyyy"));
        cmd.Parameters.AddWithValue("@Mould",     plan.MouldId);
        cmd.Parameters.AddWithValue("@PMFreq",    plan.PMFreqId);
        cmd.Parameters.AddWithValue("@CreatedBy", plan.CreatedBy);

        var result   = await cmd.ExecuteScalarAsync();
        var parts    = result?.ToString()?.Split(',') ?? [];
        var reportNo = parts.Length > 0 ? parts[0] : "";
        var success  = parts.Length > 1 && parts[1].Trim() == "True";
        return (reportNo, success);
    }

    public async Task<bool> UpdateTargetDateAsync(int id, DateTime targetDate)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_update_MouldPm_Targetdate", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@TransId",    id);
        cmd.Parameters.AddWithValue("@TargetDate", targetDate.ToString("dd/MM/yyyy"));

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("Pr_Delete_mouldPrev_plan", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@TransId", id);

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    private static PMPlan MapPlan(SqlDataReader r)
    {
        int Ord(string n) => r.GetOrdinal(n);
        return new PMPlan
        {
            Id         = r.GetInt32(Ord("TransId")),
            ReportNo   = r.IsDBNull(Ord("ReportNo")) ? "" : r.GetString(Ord("ReportNo")),
            MouldId    = r.IsDBNull(Ord("MouldId"))  ? 0  : r.GetInt32(Ord("MouldId")),
            MouldName  = r.IsDBNull(Ord("Mould"))     ? "" : r.GetString(Ord("Mould")),
            PartNo     = r.IsDBNull(Ord("PartNo"))    ? "" : r.GetString(Ord("PartNo")),
            Status     = r.IsDBNull(Ord("Status"))    ? "Pending" : r.GetString(Ord("Status")),
        };
    }
}
