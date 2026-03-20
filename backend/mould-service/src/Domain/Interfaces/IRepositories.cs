using MouldService.src.Domain.Entities;

namespace MouldService.src.Domain.Interfaces;

public interface IMouldRepository
{
    Task<(IEnumerable<Mould> Items, int Total)> GetAllAsync(MouldFilter filter);
    Task<Mould?> GetByIdAsync(int id);
    Task<int>    CreateAsync(Mould mould);
    Task<bool>   UpdateAsync(Mould mould);
    Task<bool>   DeleteAsync(int id);
}

public interface IPMPlanRepository
{
    Task<IEnumerable<PMPlan>> GetAllAsync(int? rightsId = null);
    Task<PMPlan?> GetByIdAsync(int id);
    Task<(string ReportNo, bool Success)> CreateAsync(PMPlan plan);
    Task<bool> UpdateTargetDateAsync(int id, DateTime targetDate);
    Task<bool> DeleteAsync(int id);
}

public interface ISpecRepository
{
    Task<IEnumerable<SpecEntry>> GetAllAsync(int mouldId, string? pmFreq);
    Task<SpecEntry?> GetByIdAsync(int id);
    Task<int>  CreateAsync(SpecEntry spec);
    Task<bool> UpdateAsync(SpecEntry spec);
    Task<bool> DeleteAsync(int id);
}

// Filter object for mould queries
public class MouldFilter
{
    public string? Search   { get; set; }
    public string? Category { get; set; }
    public string? Status   { get; set; }
    public int Page         { get; set; } = 1;
    public int PageSize     { get; set; } = 15;
}
