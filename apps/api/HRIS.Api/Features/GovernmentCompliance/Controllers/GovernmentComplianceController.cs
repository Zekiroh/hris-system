using HRIS.Api.Features.GovernmentCompliance.DTOs;
using HRIS.Api.Features.GovernmentCompliance.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HRIS.Api.Features.GovernmentCompliance.Controllers;

[ApiController]
[Route("government-compliance")]
[Authorize(Roles = "ADMIN,SUPER_ADMIN")]
public sealed class GovernmentComplianceController : ControllerBase
{
    private readonly IGovernmentComplianceService _governmentComplianceService;
    private readonly IGovernmentComplianceReportingService _governmentComplianceReportingService;

    public GovernmentComplianceController(
        IGovernmentComplianceService governmentComplianceService,
        IGovernmentComplianceReportingService governmentComplianceReportingService)
    {
        _governmentComplianceService = governmentComplianceService;
        _governmentComplianceReportingService = governmentComplianceReportingService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<CompliancePeriodSummaryDto?>> GetComplianceSummary(
        [FromQuery] int? payrollPeriodId,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var summary = await _governmentComplianceReportingService.GetComplianceSummaryAsync(
            payrollPeriodId,
            search,
            cancellationToken);

        return Ok(summary);
    }

    [HttpGet("sss")]
    public async Task<ActionResult<IReadOnlyList<SssContributionBracketDto>>> GetSssBrackets(
        CancellationToken cancellationToken)
    {
        var brackets = await _governmentComplianceService.GetSssBracketsAsync(cancellationToken);

        return Ok(brackets);
    }

    [HttpPost("sss")]
    public async Task<ActionResult<SssContributionBracketDto>> CreateSssBracket(
        CreateSssContributionBracketRequest request,
        CancellationToken cancellationToken)
    {
        var bracket = await _governmentComplianceService.CreateSssBracketAsync(
            request,
            cancellationToken);

        return Ok(bracket);
    }

    [HttpPut("sss/{id:int}")]
    public async Task<ActionResult<SssContributionBracketDto>> UpdateSssBracket(
        int id,
        UpdateSssContributionBracketRequest request,
        CancellationToken cancellationToken)
    {
        var bracket = await _governmentComplianceService.UpdateSssBracketAsync(
            id,
            request,
            cancellationToken);

        if (bracket is null)
        {
            return NotFound();
        }

        return Ok(bracket);
    }

    [HttpGet("sss/monitoring")]
    public async Task<ActionResult<ComplianceMonitoringResponseDto>> GetSssMonitoring(
        [FromQuery] int? payrollPeriodId,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var result = await _governmentComplianceReportingService.GetSssMonitoringAsync(
            payrollPeriodId,
            search,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("philhealth")]
    public async Task<ActionResult<IReadOnlyList<PhilHealthContributionRuleDto>>> GetPhilHealthRules(
        CancellationToken cancellationToken)
    {
        var rules = await _governmentComplianceService.GetPhilHealthRulesAsync(cancellationToken);

        return Ok(rules);
    }

    [HttpPost("philhealth")]
    public async Task<ActionResult<PhilHealthContributionRuleDto>> CreatePhilHealthRule(
        CreatePhilHealthContributionRuleRequest request,
        CancellationToken cancellationToken)
    {
        var rule = await _governmentComplianceService.CreatePhilHealthRuleAsync(
            request,
            cancellationToken);

        return Ok(rule);
    }

    [HttpGet("philhealth/monitoring")]
    public async Task<ActionResult<ComplianceMonitoringResponseDto>> GetPhilHealthMonitoring(
        [FromQuery] int? payrollPeriodId,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var result = await _governmentComplianceReportingService.GetPhilHealthMonitoringAsync(
            payrollPeriodId,
            search,
            cancellationToken);

        return Ok(result);
    }

    [HttpPut("philhealth/{id:int}")]
    public async Task<ActionResult<PhilHealthContributionRuleDto>> UpdatePhilHealthRule(
        int id,
        UpdatePhilHealthContributionRuleRequest request,
        CancellationToken cancellationToken)
    {
        var rule = await _governmentComplianceService.UpdatePhilHealthRuleAsync(
            id,
            request,
            cancellationToken);

        if (rule is null)
        {
            return NotFound();
        }

        return Ok(rule);
    }

    [HttpGet("pagibig/monitoring")]
    public async Task<ActionResult<ComplianceMonitoringResponseDto>> GetPagIbigMonitoring(
        [FromQuery] int? payrollPeriodId,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var result = await _governmentComplianceReportingService.GetPagIbigMonitoringAsync(
            payrollPeriodId,
            search,
            cancellationToken);

        return Ok(result);
    }

    [HttpGet("pagibig")]
    public async Task<ActionResult<IReadOnlyList<PagIbigContributionRuleDto>>> GetPagIbigRules(
        CancellationToken cancellationToken)
    {
        var rules = await _governmentComplianceService.GetPagIbigRulesAsync(cancellationToken);

        return Ok(rules);
    }

    [HttpPost("pagibig")]
    public async Task<ActionResult<PagIbigContributionRuleDto>> CreatePagIbigRule(
        CreatePagIbigContributionRuleRequest request,
        CancellationToken cancellationToken)
    {
        var rule = await _governmentComplianceService.CreatePagIbigRuleAsync(
            request,
            cancellationToken);

        return Ok(rule);
    }

    [HttpPut("pagibig/{id:int}")]
    public async Task<ActionResult<PagIbigContributionRuleDto>> UpdatePagIbigRule(
        int id,
        UpdatePagIbigContributionRuleRequest request,
        CancellationToken cancellationToken)
    {
        var rule = await _governmentComplianceService.UpdatePagIbigRuleAsync(
            id,
            request,
            cancellationToken);

        if (rule is null)
        {
            return NotFound();
        }

        return Ok(rule);
    }

    [HttpGet("tax")]
    public async Task<ActionResult<IReadOnlyList<WithholdingTaxBracketDto>>> GetWithholdingTaxBrackets(
        CancellationToken cancellationToken)
    {
        var brackets = await _governmentComplianceService.GetWithholdingTaxBracketsAsync(
            cancellationToken);

        return Ok(brackets);
    }

    [HttpPost("tax")]
    public async Task<ActionResult<WithholdingTaxBracketDto>> CreateWithholdingTaxBracket(
        CreateWithholdingTaxBracketRequest request,
        CancellationToken cancellationToken)
    {
        var bracket = await _governmentComplianceService.CreateWithholdingTaxBracketAsync(
            request,
            cancellationToken);

        return Ok(bracket);
    }

    [HttpPut("tax/{id:int}")]
    public async Task<ActionResult<WithholdingTaxBracketDto>> UpdateWithholdingTaxBracket(
        int id,
        UpdateWithholdingTaxBracketRequest request,
        CancellationToken cancellationToken)
    {
        var bracket = await _governmentComplianceService.UpdateWithholdingTaxBracketAsync(
            id,
            request,
            cancellationToken);

        if (bracket is null)
        {
            return NotFound();
        }

        return Ok(bracket);
    }

    [HttpGet("bir-2316")]
    public async Task<ActionResult<IReadOnlyList<Bir2316TrackingDto>>> GetBir2316Trackings(
        [FromQuery] int taxYear,
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        var result = await _governmentComplianceReportingService.GetBir2316TrackingsAsync(
            taxYear,
            search,
            cancellationToken);

        return Ok(result);
    }

    [HttpPut("bir-2316/{id:int}")]
    public async Task<ActionResult<Bir2316TrackingDto>> UpdateBir2316Tracking(
        int id,
        UpdateBir2316TrackingRequest request,
        CancellationToken cancellationToken)
    {
        var result = await _governmentComplianceReportingService.UpdateBir2316TrackingAsync(
            id,
            request,
            cancellationToken);

        if (result is null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpGet("employment-history")]
    public async Task<ActionResult<IReadOnlyList<EmploymentStatusHistoryDto>>> GetEmploymentStatusHistory(
        [FromQuery] Guid? employeeId,
        [FromQuery] string? search,
        [FromQuery] DateOnly? dateFrom,
        [FromQuery] DateOnly? dateTo,
        CancellationToken cancellationToken)
    {
        var result = await _governmentComplianceReportingService.GetEmploymentStatusHistoryAsync(
            employeeId,
            search,
            dateFrom,
            dateTo,
            cancellationToken);

        return Ok(result);
    }
}
