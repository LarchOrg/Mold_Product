using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MouldService.src.Application.DTOs;
using MouldService.src.Domain.Entities;
using MouldService.src.Domain.Interfaces;

namespace MouldService.src.Controllers;

[ApiController]
[Route("api/pm-plans")]
[Authorize]
public class PMPlanController : ControllerBase
{
    private readonly IPMPlanRepository _repo;
    private readonly ILogger<PMPlanController> _logger;

    public PMPlanController(IPMPlanRepository repo, ILogger<PMPlanController> logger)
    {
        _repo   = repo;
        _logger = logger;
    }

    // GET /api/pm-plans
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<PMPlanDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] int? rightsId)
    {
        var plans = await _repo.GetAllAsync(rightsId);
        return Ok(plans.Select(ToDto));
    }

    // GET /api/pm-plans/{id}
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(PMPlanDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(int id)
    {
        var plan = await _repo.GetByIdAsync(id);
        return plan is null ? NotFound(new { message = $"PM Plan {id} not found." }) : Ok(ToDto(plan));
    }

    // POST /api/pm-plans
    [HttpPost]
    [Authorize(Policy = "SupervisorUp")]
    [ProducesResponseType(201)]
    public async Task<IActionResult> Create([FromBody] CreatePMPlanRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var plan = new PMPlan
        {
            MouldId    = req.MouldId,
            PMFreqId   = req.PMFreqId,
            TargetDate = DateTime.Parse(req.Date),
            CreatedBy  = GetUserId(),
        };

        var (reportNo, success) = await _repo.CreateAsync(plan);
        if (!success) return BadRequest(new { message = "Failed to create PM plan." });

        _logger.LogInformation("PM Plan {ReportNo} created", reportNo);
        return StatusCode(201, new { reportNo, message = "PM Plan created." });
    }

    // PUT /api/pm-plans/{id}
    [HttpPut("{id:int}")]
    [Authorize(Policy = "SupervisorUp")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(int id, [FromBody] UpdatePMPlanRequest req)
    {
        if (!DateTime.TryParse(req.TargetDate, out var targetDate))
            return BadRequest(new { message = "Invalid target date format." });

        var success = await _repo.UpdateTargetDateAsync(id, targetDate);
        return success ? Ok(new { message = "PM Plan updated." }) : NotFound(new { message = $"PM Plan {id} not found." });
    }

    // DELETE /api/pm-plans/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "SupervisorUp")]
    [ProducesResponseType(200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _repo.DeleteAsync(id);
        return success ? Ok(new { message = "PM Plan deleted." }) : NotFound(new { message = $"PM Plan {id} not found." });
    }

    private int GetUserId() =>
        int.TryParse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id : 0;

    private static PMPlanDto ToDto(PMPlan p) => new(
        Id:       p.Id,
        ReportNo: p.ReportNo,
        MouldId:  p.MouldId,
        Mould:    p.MouldName,
        PartNo:   p.PartNo,
        Freq:     p.PMFreq,
        Date:     p.TargetDate == default ? "" : p.TargetDate.ToString("yyyy-MM-dd"),
        Status:   p.Status
    );
}
