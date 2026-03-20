using System.Data;
using Microsoft.Data.SqlClient;
using MouldService.src.Domain.Entities;
using MouldService.src.Domain.Interfaces;
using MouldService.src.Infrastructure.Data;

namespace MouldService.src.Infrastructure.Repositories;

public class MouldRepository : IMouldRepository
{
    private readonly DbConnectionFactory _db;

    public MouldRepository(DbConnectionFactory db) => _db = db;

    // ── GetAll with filter + pagination ──────────────────────────────────────
    public async Task<(IEnumerable<Mould> Items, int Total)> GetAllAsync(MouldFilter filter)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("Pr_Fetch_mould_mst", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Search",   (object?)filter.Search   ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Category", (object?)filter.Category ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Status",   (object?)filter.Status   ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Page",     filter.Page);
        cmd.Parameters.AddWithValue("@PageSize", filter.PageSize);

        var totalParam = new SqlParameter("@Total", SqlDbType.Int) { Direction = ParameterDirection.Output };
        cmd.Parameters.Add(totalParam);

        var moulds = new List<Mould>();
        await using var reader = await cmd.ExecuteReaderAsync();
        while (await reader.ReadAsync())
            moulds.Add(MapMould(reader));

        await reader.CloseAsync();
        int total = (int)(totalParam.Value == DBNull.Value ? 0 : totalParam.Value);
        return (moulds, total);
    }

    // ── GetById ───────────────────────────────────────────────────────────────
    public async Task<Mould?> GetByIdAsync(int id)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("Pr_Fetch_mould_mst_ById", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@ID", id);

        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapMould(reader) : null;
    }

    // ── Create ────────────────────────────────────────────────────────────────
    public async Task<int> CreateAsync(Mould m)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_insert_Mould_mst", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        AddMouldParams(cmd, m);

        var result = await cmd.ExecuteScalarAsync();
        return Convert.ToInt32(result);
    }

    // ── Update ────────────────────────────────────────────────────────────────
    public async Task<bool> UpdateAsync(Mould m)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_Update_Mould_mst", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id", m.Id);
        AddMouldParams(cmd, m);

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    // ── Delete ────────────────────────────────────────────────────────────────
    public async Task<bool> DeleteAsync(int id)
    {
        await using var conn = _db.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new SqlCommand("pr_Delete_Mould_mst", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.AddWithValue("@Id", id);

        var rows = await cmd.ExecuteNonQueryAsync();
        return rows > 0;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────
    private static void AddMouldParams(SqlCommand cmd, Mould m)
    {
        cmd.Parameters.AddWithValue("@Code",         m.Code);
        cmd.Parameters.AddWithValue("@Name",         m.Name);
        cmd.Parameters.AddWithValue("@Size",         m.Size);
        cmd.Parameters.AddWithValue("@Cavity",       m.Cavity);
        cmd.Parameters.AddWithValue("@OpeningShot",  m.OpeningShot);
        cmd.Parameters.AddWithValue("@LifeShot",     m.LifeShot);
        cmd.Parameters.AddWithValue("@CurrentShot",  m.CurrentShot);
        cmd.Parameters.AddWithValue("@Location",     m.Location);
        cmd.Parameters.AddWithValue("@Item",         m.ItemId);
        cmd.Parameters.AddWithValue("@UsedFrom",     m.UsedFrom);
        cmd.Parameters.AddWithValue("@Category",     m.Category);
        cmd.Parameters.AddWithValue("@Direction",    m.Direction);
        cmd.Parameters.AddWithValue("@PMFreq",       m.PMFreq);
        cmd.Parameters.AddWithValue("@PMFreqDays",   m.PMFreqDays);
        cmd.Parameters.AddWithValue("@PMFreqShots",  m.PMFreqShots);
        cmd.Parameters.AddWithValue("@Color",        m.Color);
        cmd.Parameters.AddWithValue("@BarCode",      m.BarCode);
        cmd.Parameters.AddWithValue("@Supplier",     m.Supplier);
        cmd.Parameters.AddWithValue("@Makersupplier",m.MakerSupplier);
        cmd.Parameters.AddWithValue("@Remarks",      m.Remarks);
        cmd.Parameters.AddWithValue("@CreatedBy",    m.CreatedBy);
    }

    private static Mould MapMould(SqlDataReader r)
    {
        int Ord(string n) => r.GetOrdinal(n);
        return new Mould
        {
            Id           = r.GetInt32(Ord("Id")),
            Code         = r.GetString(Ord("Code")),
            Name         = r.GetString(Ord("Name")),
            Size         = r.IsDBNull(Ord("Size"))         ? "" : r.GetString(Ord("Size")),
            Cavity       = r.GetInt32(Ord("Cavity")),
            OpeningShot  = r.GetInt64(Ord("OpeningShot")),
            LifeShot     = r.GetInt64(Ord("LifeShot")),
            CurrentShot  = r.GetInt64(Ord("CurrentShot")),
            Location     = r.IsDBNull(Ord("Location"))     ? "" : r.GetString(Ord("Location")),
            PartNo       = r.IsDBNull(Ord("PartNo"))       ? "" : r.GetString(Ord("PartNo")),
            UsedFrom     = r.IsDBNull(Ord("UsedFrom"))     ? DateTime.MinValue : r.GetDateTime(Ord("UsedFrom")),
            Category     = r.IsDBNull(Ord("Category"))     ? "C" : r.GetString(Ord("Category")),
            Direction    = r.IsDBNull(Ord("Direction"))    ? "F" : r.GetString(Ord("Direction")),
            PMFreq       = r.IsDBNull(Ord("PMFreq"))       ? "" : r.GetString(Ord("PMFreq")),
            PMFreqDays   = r.IsDBNull(Ord("PMFreqDays"))   ? 0  : r.GetInt32(Ord("PMFreqDays")),
            PMFreqShots  = r.IsDBNull(Ord("PMFreqShots"))  ? 0  : r.GetInt64(Ord("PMFreqShots")),
            Color        = r.IsDBNull(Ord("Color"))        ? "N/A" : r.GetString(Ord("Color")),
            BarCode      = r.IsDBNull(Ord("Barcode"))      ? "" : r.GetString(Ord("Barcode")),
            Supplier     = r.IsDBNull(Ord("Supplier"))     ? "" : r.GetString(Ord("Supplier")),
            MakerSupplier= r.IsDBNull(Ord("Makersupplier"))? "" : r.GetString(Ord("Makersupplier")),
            Remarks      = r.IsDBNull(Ord("Remarks"))      ? "" : r.GetString(Ord("Remarks")),
            Status       = r.IsDBNull(Ord("Status"))       ? "Active" : r.GetString(Ord("Status")),
        };
    }
}
