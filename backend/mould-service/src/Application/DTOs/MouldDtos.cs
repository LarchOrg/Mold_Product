namespace MouldService.src.Application.DTOs;

// ── Mould ─────────────────────────────────────────────────────────────────────
public record MouldDto(
    int      Id,
    string   Code,
    string   Name,
    string   Size,
    int      Cavity,
    long     OpeningShot,
    long     LifeShot,
    long     CurrentShot,
    string   Location,
    string   PartNo,
    string   UsedFrom,
    string   Category,
    string   Direction,
    string   PMFreq,
    int      PMFreqDays,
    long     PMFreqShots,
    string   Color,
    string   BarCode,
    string   Supplier,
    string   MakerSupplier,
    string   Remarks,
    string   Status
);

public record CreateMouldRequest(
    string   Code,
    string   Name,
    string   Size,
    int      Cavity,
    long     OpeningShot,
    long     LifeShot,
    string   Location,
    int      ItemId,
    string   UsedFrom,
    string   Category,
    string   Direction,
    string   PMFreq,
    int      PMFreqDays,
    long     PMFreqShots,
    string   Color,
    string   BarCode,
    string   Supplier,
    string   MakerSupplier,
    string   Remarks
);

public record UpdateMouldRequest(
    string   Code,
    string   Name,
    string   Size,
    int      Cavity,
    long     OpeningShot,
    long     LifeShot,
    long     CurrentShot,
    string   Location,
    int      ItemId,
    string   UsedFrom,
    string   Category,
    string   Direction,
    string   PMFreq,
    int      PMFreqDays,
    long     PMFreqShots,
    string   Color,
    string   BarCode,
    string   Supplier,
    string   MakerSupplier,
    string   Remarks
);

public record PagedResult<T>(
    IEnumerable<T> Items,
    int            Total,
    int            Page,
    int            PageSize
);

// ── PM Plan ───────────────────────────────────────────────────────────────────
public record PMPlanDto(
    int    Id,
    string ReportNo,
    int    MouldId,
    string Mould,
    string PartNo,
    string Freq,
    string Date,
    string Status
);

public record CreatePMPlanRequest(
    int      MouldId,
    int      PMFreqId,
    string   Date
);

public record UpdatePMPlanRequest(
    string   TargetDate
);

// ── Spec Entry ────────────────────────────────────────────────────────────────
public record SpecDto(
    int    Id,
    int    MouldId,
    string MouldCode,
    string MouldName,
    string PMFreq,
    string CheckArea,
    string CheckPoint,
    string CheckMethod,
    string RequiredCondition,
    int    OrderBy,
    int?   ImageId
);

public record CreateSpecRequest(
    int    MouldId,
    string PMFreq,
    string CheckArea,
    string CheckPoint,
    string CheckMethod,
    string RequiredCondition,
    int    OrderBy,
    int?   ImageId
);

public record UpdateSpecRequest(
    string PMFreq,
    string CheckArea,
    string CheckPoint,
    string CheckMethod,
    string RequiredCondition,
    int    OrderBy,
    int?   ImageId
);

// ── Dashboard ─────────────────────────────────────────────────────────────────
public record DashboardDto(
    int TotalMoulds,
    int ActiveMoulds,
    int PMDueCount,
    int CriticalCount,
    int CompletedPMCount,
    double AvgShotLifePercent,
    IEnumerable<CategorySplit> CategorySplit,
    IEnumerable<MonthlyPM>     MonthlyActivity
);

public record CategorySplit(string Category, int Count);
public record MonthlyPM(string Month, int Planned, int Completed);
