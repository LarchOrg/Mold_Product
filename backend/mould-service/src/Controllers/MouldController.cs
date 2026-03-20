using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MouldService.src.Application.DTOs;
using MouldService.src.Domain.Entities;
using MouldService.src.Domain.Interfaces;

namespace MouldService.src.Controllers;

[ApiController]
[Route("api/moulds")]
[Authorize]
public class MouldController : ControllerBase
{
    private readonly IMouldRepository _repo;
    private readonly ILogger<MouldController> _logger;

    public MouldController(IMouldRepository repo, ILogger<MouldController> logger)
    {
        _repo   = repo;
        _logger = logger;
    }

    // GET /api/moulds?search=&category=A&status=Active&page=1&pageSize=15
    [HttpGet]
    [ProducesResponseType(typeof(PagedResult<MouldDto>), 200)]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? search,
        [FromQuery] string? category,
        [FromQuery] string? status,
        [FromQuery] int page     = 1,
        [FromQuery] int pageSize = 15)
    {
        var filter = new MouldFilter
        {
            Search   = search,
            Category = category,
            Status   = status,
            Page     = Math.Max(1, page),
            PageSize = Math.Clamp(pageSize, 5, 100),
        };

        var (items, total) = await _repo.GetAllAsync(filter);

        return Ok(new PagedResult<MouldDto>(
            Items:    items.Select(ToDto),
            Total:    total,
            Page:     filter.Page,
            PageSize: filter.PageSize
        ));
    }

    // GET /api/moulds/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(MouldDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var mould = await _repo.GetByIdAsync(id);
        return mould is null ? NotFound(new { message = $"Mould {id} not found." }) : Ok(ToDto(mould));
    }

    // POST /api/moulds
    [HttpPost]
    [Authorize(Policy = "SupervisorUp")]
    [ProducesResponseType(typeof(object), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateMouldRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var userId = GetUserId();
        var mould  = new Mould
        {
            Code         = req.Code,
            Name         = req.Name,
            Size         = req.Size,
            Cavity       = req.Cavity,
            OpeningShot  = req.OpeningShot,
            LifeShot     = req.LifeShot,
            CurrentShot  = req.OpeningShot,
            Location     = req.Location,
            ItemId       = req.ItemId,
            UsedFrom     = DateTime.Parse(req.UsedFrom),
            Category     = req.Category,
            Direction    = req.Direction,
            PMFreq       = req.PMFreq,
            PMFreqDays   = req.PMFreqDays,
            PMFreqShots  = req.PMFreqShots,
            Color        = req.Color,
            BarCode      = req.BarCode,
            Supplier     = req.Supplier,
            MakerSupplier= req.MakerSupplier,
            Remarks      = req.Remarks,
            CreatedBy    = userId,
        };

        var newId = await _repo.CreateAsync(mould);
        _logger.LogInformation("Mould created: {Code} by user {UserId}", req.Code, userId);

        return CreatedAtAction(nameof(GetById), new { id = newId }, new { id = newId, message = "Mould created." });
    }

    // PUT /api/moulds/{id}
    [HttpPut("{id:int}")]
    [Authorize(Policy = "SupervisorUp")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateMouldRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var existing = await _repo.GetByIdAsync(id);
        if (existing is null) return NotFound(new { message = $"Mould {id} not found." });

        existing.Code         = req.Code;
        existing.Name         = req.Name;
        existing.Size         = req.Size;
        existing.Cavity       = req.Cavity;
        existing.OpeningShot  = req.OpeningShot;
        existing.LifeShot     = req.LifeShot;
        existing.CurrentShot  = req.CurrentShot;
        existing.Location     = req.Location;
        existing.ItemId       = req.ItemId;
        existing.UsedFrom     = DateTime.Parse(req.UsedFrom);
        existing.Category     = req.Category;
        existing.Direction    = req.Direction;
        existing.PMFreq       = req.PMFreq;
        existing.PMFreqDays   = req.PMFreqDays;
        existing.PMFreqShots  = req.PMFreqShots;
        existing.Color        = req.Color;
        existing.BarCode      = req.BarCode;
        existing.Supplier     = req.Supplier;
        existing.MakerSupplier= req.MakerSupplier;
        existing.Remarks      = req.Remarks;
        existing.UpdatedBy    = GetUserId();

        await _repo.UpdateAsync(existing);
        return Ok(new { message = "Mould updated." });
    }

    // DELETE /api/moulds/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "AdminOnly")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _repo.DeleteAsync(id);
        if (!success) return NotFound(new { message = $"Mould {id} not found." });

        _logger.LogInformation("Mould {Id} deleted by user {UserId}", id, GetUserId());
        return Ok(new { message = "Mould deleted." });
    }

    // ── Helpers ────────────────────────────────────────────────────────────────
    private int GetUserId() =>
        int.TryParse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id : 0;

    private static MouldDto ToDto(Mould m) => new(
        Id:           m.Id,
        Code:         m.Code,
        Name:         m.Name,
        Size:         m.Size,
        Cavity:       m.Cavity,
        OpeningShot:  m.OpeningShot,
        LifeShot:     m.LifeShot,
        CurrentShot:  m.CurrentShot,
        Location:     m.Location,
        PartNo:       m.PartNo,
        UsedFrom:     m.UsedFrom.ToString("yyyy-MM-dd"),
        Category:     m.Category,
        Direction:    m.Direction,
        PMFreq:       m.PMFreq,
        PMFreqDays:   m.PMFreqDays,
        PMFreqShots:  m.PMFreqShots,
        Color:        m.Color,
        BarCode:      m.BarCode,
        Supplier:     m.Supplier,
        MakerSupplier:m.MakerSupplier,
        Remarks:      m.Remarks,
        Status:       m.Status
    );
}
