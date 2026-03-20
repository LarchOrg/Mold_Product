using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MouldService.src.Application.DTOs;
using MouldService.src.Domain.Entities;
using MouldService.src.Domain.Interfaces;

namespace MouldService.src.Controllers;

[ApiController]
[Route("api/specs")]
[Authorize]
public class SpecController : ControllerBase
{
    private readonly ISpecRepository _repo;
    private readonly ILogger<SpecController> _logger;

    public SpecController(ISpecRepository repo, ILogger<SpecController> logger)
    {
        _repo   = repo;
        _logger = logger;
    }

    // GET /api/specs?mouldId=1&pmFreq=Monthly
    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int mouldId, [FromQuery] string? pmFreq)
    {
        var specs = await _repo.GetAllAsync(mouldId, pmFreq);
        return Ok(specs.Select(ToDto));
    }

    // GET /api/specs/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var spec = await _repo.GetByIdAsync(id);
        return spec is null ? NotFound(new { message = $"Spec {id} not found." }) : Ok(ToDto(spec));
    }

    // POST /api/specs
    [HttpPost]
    [Authorize(Policy = "SupervisorUp")]
    public async Task<IActionResult> Create([FromBody] CreateSpecRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var spec = new SpecEntry
        {
            MouldId           = req.MouldId,
            PMFreq            = req.PMFreq,
            CheckArea         = req.CheckArea,
            CheckPoint        = req.CheckPoint,
            CheckMethod       = req.CheckMethod,
            RequiredCondition = req.RequiredCondition,
            OrderBy           = req.OrderBy,
            ImageId           = req.ImageId,
            CreatedBy         = GetUserId(),
        };

        var newId = await _repo.CreateAsync(spec);
        return StatusCode(201, new { id = newId, message = "Spec entry created." });
    }

    // PUT /api/specs/{id}
    [HttpPut("{id:int}")]
    [Authorize(Policy = "SupervisorUp")]
    public async Task<IActionResult> Update(int id, [FromBody] UpdateSpecRequest req)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        var spec = new SpecEntry
        {
            Id                = id,
            PMFreq            = req.PMFreq,
            CheckArea         = req.CheckArea,
            CheckPoint        = req.CheckPoint,
            CheckMethod       = req.CheckMethod,
            RequiredCondition = req.RequiredCondition,
            OrderBy           = req.OrderBy,
            ImageId           = req.ImageId,
            CreatedBy         = GetUserId(),
        };

        var success = await _repo.UpdateAsync(spec);
        return success ? Ok(new { message = "Spec updated." }) : NotFound(new { message = $"Spec {id} not found." });
    }

    // DELETE /api/specs/{id}
    [HttpDelete("{id:int}")]
    [Authorize(Policy = "SupervisorUp")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _repo.DeleteAsync(id);
        return success ? Ok(new { message = "Spec deleted." }) : NotFound(new { message = $"Spec {id} not found." });
    }

    private int GetUserId() =>
        int.TryParse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value, out var id)
            ? id : 0;

    private static SpecDto ToDto(SpecEntry s) => new(
        Id:                s.Id,
        MouldId:           s.MouldId,
        MouldCode:         s.MouldCode,
        MouldName:         s.MouldName,
        PMFreq:            s.PMFreq,
        CheckArea:         s.CheckArea,
        CheckPoint:        s.CheckPoint,
        CheckMethod:       s.CheckMethod,
        RequiredCondition: s.RequiredCondition,
        OrderBy:           s.OrderBy,
        ImageId:           s.ImageId
    );
}
