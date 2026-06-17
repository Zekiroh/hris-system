using HRIS.Api.Features.GovernmentCompliance.DTOs;

namespace HRIS.Api.Features.GovernmentCompliance.Services;

public interface IGovernmentComplianceService
{
    Task<GovernmentComplianceCalculationResult> CalculateAsync(
        decimal grossPay,
        DateOnly payrollDate,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SssContributionBracketDto>> GetSssBracketsAsync(
        CancellationToken cancellationToken = default);

    Task<SssContributionBracketDto> CreateSssBracketAsync(
        CreateSssContributionBracketRequest request,
        CancellationToken cancellationToken = default);

    Task<SssContributionBracketDto?> UpdateSssBracketAsync(
        int id,
        UpdateSssContributionBracketRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PhilHealthContributionRuleDto>> GetPhilHealthRulesAsync(
        CancellationToken cancellationToken = default);

    Task<PhilHealthContributionRuleDto> CreatePhilHealthRuleAsync(
        CreatePhilHealthContributionRuleRequest request,
        CancellationToken cancellationToken = default);

    Task<PhilHealthContributionRuleDto?> UpdatePhilHealthRuleAsync(
        int id,
        UpdatePhilHealthContributionRuleRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<PagIbigContributionRuleDto>> GetPagIbigRulesAsync(
        CancellationToken cancellationToken = default);

    Task<PagIbigContributionRuleDto> CreatePagIbigRuleAsync(
        CreatePagIbigContributionRuleRequest request,
        CancellationToken cancellationToken = default);

    Task<PagIbigContributionRuleDto?> UpdatePagIbigRuleAsync(
        int id,
        UpdatePagIbigContributionRuleRequest request,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<WithholdingTaxBracketDto>> GetWithholdingTaxBracketsAsync(
        CancellationToken cancellationToken = default);

    Task<WithholdingTaxBracketDto> CreateWithholdingTaxBracketAsync(
        CreateWithholdingTaxBracketRequest request,
        CancellationToken cancellationToken = default);

    Task<WithholdingTaxBracketDto?> UpdateWithholdingTaxBracketAsync(
        int id,
        UpdateWithholdingTaxBracketRequest request,
        CancellationToken cancellationToken = default);
}