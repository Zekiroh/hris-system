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

    public GovernmentComplianceController(IGovernmentComplianceService governmentComplianceService)
    {
        _governmentComplianceService = governmentComplianceService;
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
}