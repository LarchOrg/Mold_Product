namespace MouldService.src.Domain.Entities;

public class Mould
{
    public int     Id          { get; set; }
    public string  Code        { get; set; } = string.Empty;
    public string  Name        { get; set; } = string.Empty;
    public string  Size        { get; set; } = string.Empty;
    public int     Cavity      { get; set; }
    public long    OpeningShot { get; set; }
    public long    LifeShot    { get; set; }
    public long    CurrentShot { get; set; }
    public string  Location    { get; set; } = string.Empty;
    public int     ItemId      { get; set; }
    public string  PartNo      { get; set; } = string.Empty;
    public DateTime UsedFrom   { get; set; }
    public string  Category    { get; set; } = "C";   // A | B | C
    public string  Direction   { get; set; } = "F";   // F | R
    public string  PMFreq      { get; set; } = string.Empty;
    public int     PMFreqDays  { get; set; }
    public long    PMFreqShots { get; set; }
    public string  Color       { get; set; } = "N/A";
    public string  BarCode     { get; set; } = string.Empty;
    public string  Supplier    { get; set; } = string.Empty;
    public string  MakerSupplier { get; set; } = string.Empty;
    public string  Remarks     { get; set; } = string.Empty;
    public string  Status      { get; set; } = "Active";
    public int     CreatedBy   { get; set; }
    public DateTime CreatedAt  { get; set; }
    public int?    UpdatedBy   { get; set; }
    public DateTime? UpdatedAt { get; set; }
}

public class PMPlan
{
    public int      Id        { get; set; }
    public string   ReportNo  { get; set; } = string.Empty;
    public int      MouldId   { get; set; }
    public string   MouldName { get; set; } = string.Empty;
    public string   PartNo    { get; set; } = string.Empty;
    public int      PMFreqId  { get; set; }
    public string   PMFreq    { get; set; } = string.Empty;
    public DateTime TargetDate { get; set; }
    public string   Status    { get; set; } = "Pending";
    public int      CreatedBy { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class SpecEntry
{
    public int    Id               { get; set; }
    public int    MouldId          { get; set; }
    public string MouldCode        { get; set; } = string.Empty;
    public string MouldName        { get; set; } = string.Empty;
    public string PMFreq           { get; set; } = string.Empty;
    public string CheckArea        { get; set; } = string.Empty;
    public string CheckPoint       { get; set; } = string.Empty;
    public string CheckMethod      { get; set; } = string.Empty;
    public string RequiredCondition { get; set; } = string.Empty;
    public int    OrderBy          { get; set; }
    public int?   ImageId          { get; set; }
    public int    CreatedBy        { get; set; }
}
