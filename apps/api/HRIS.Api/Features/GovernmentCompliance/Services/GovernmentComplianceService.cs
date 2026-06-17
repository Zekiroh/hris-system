using HRIS.Api.Data;
using HRIS.Api.Features.GovernmentCompliance.DTOs;
using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.GovernmentCompliance.Services;

public sealed class GovernmentComplianceService : IGovernmentComplianceService
{
    private readonly AppDbContext _context;

    public GovernmentComplianceService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<GovernmentComplianceCalculationResult> CalculateAsync(
        decimal grossPay,
        DateOnly payrollDate,
        CancellationToken cancellationToken = default)
    {
        var sssBracket = await _context.SssContributionBrackets
            .AsNoTracking()
            .Where(b =>
                b.IsActive &&
                b.EffectiveFrom <= payrollDate &&
                (b.EffectiveTo == null || b.EffectiveTo >= payrollDate) &&
                grossPay >= b.SalaryFrom &&
                (b.SalaryTo == null || grossPay <= b.SalaryTo))
            .OrderByDescending(b => b.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        var philHealthRule = await _context.PhilHealthContributionRules
            .AsNoTracking()
            .Where(r =>
                r.IsActive &&
                r.EffectiveFrom <= payrollDate &&
                (r.EffectiveTo == null || r.EffectiveTo >= payrollDate))
            .OrderByDescending(r => r.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        var pagIbigRule = await _context.PagIbigContributionRules
            .AsNoTracking()
            .Where(r =>
                r.IsActive &&
                r.EffectiveFrom <= payrollDate &&
                (r.EffectiveTo == null || r.EffectiveTo >= payrollDate))
            .OrderByDescending(r => r.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        var taxBracket = await _context.WithholdingTaxBrackets
            .AsNoTracking()
            .Where(b =>
                b.IsActive &&
                b.EffectiveFrom <= payrollDate &&
                (b.EffectiveTo == null || b.EffectiveTo >= payrollDate) &&
                grossPay >= b.CompensationFrom &&
                (b.CompensationTo == null || grossPay <= b.CompensationTo))
            .OrderByDescending(b => b.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        var result = new GovernmentComplianceCalculationResult();

        if (sssBracket is not null)
        {
            result.SssEmployeeShare = RoundMoney(sssBracket.EmployeeShare);
            result.SssEmployerShare = RoundMoney(sssBracket.EmployerShare);
        }

        if (philHealthRule is not null)
        {
            var totalPhilHealthContribution = grossPay * philHealthRule.ContributionRate;

            totalPhilHealthContribution = Math.Max(
                philHealthRule.MinimumContribution,
                totalPhilHealthContribution);

            totalPhilHealthContribution = Math.Min(
                philHealthRule.MaximumContribution,
                totalPhilHealthContribution);

            result.PhilHealthEmployeeShare = RoundMoney(
                totalPhilHealthContribution * philHealthRule.EmployeeSharePercent);

            result.PhilHealthEmployerShare = RoundMoney(
                totalPhilHealthContribution * philHealthRule.EmployerSharePercent);
        }

        if (pagIbigRule is not null)
        {
            var employeeShare = grossPay * pagIbigRule.EmployeeRate;
            var employerShare = grossPay * pagIbigRule.EmployerRate;

            result.PagIbigEmployeeShare = RoundMoney(
                Math.Clamp(
                    employeeShare,
                    pagIbigRule.MinimumContribution,
                    pagIbigRule.MaximumContribution));

            result.PagIbigEmployerShare = RoundMoney(
                Math.Clamp(
                    employerShare,
                    pagIbigRule.MinimumContribution,
                    pagIbigRule.MaximumContribution));
        }

        if (taxBracket is not null)
        {
            result.WithholdingTax = RoundMoney(
                taxBracket.BaseTax +
                ((grossPay - taxBracket.ExcessOver) * taxBracket.TaxRate));
        }

        return result;
    }

    public async Task<IReadOnlyList<SssContributionBracketDto>> GetSssBracketsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.SssContributionBrackets
            .AsNoTracking()
            .OrderBy(x => x.SalaryFrom)
            .ThenByDescending(x => x.EffectiveFrom)
            .Select(x => ToSssContributionBracketDto(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<SssContributionBracketDto> CreateSssBracketAsync(
        CreateSssContributionBracketRequest request,
        CancellationToken cancellationToken = default)
    {
        var bracket = new SssContributionBracket
        {
            SalaryFrom = request.SalaryFrom,
            SalaryTo = request.SalaryTo,
            EmployeeShare = request.EmployeeShare,
            EmployerShare = request.EmployerShare,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            IsActive = request.IsActive
        };

        _context.SssContributionBrackets.Add(bracket);
        await _context.SaveChangesAsync(cancellationToken);

        return ToSssContributionBracketDto(bracket);
    }

    public async Task<SssContributionBracketDto?> UpdateSssBracketAsync(
        int id,
        UpdateSssContributionBracketRequest request,
        CancellationToken cancellationToken = default)
    {
        var bracket = await _context.SssContributionBrackets
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (bracket is null)
        {
            return null;
        }

        bracket.SalaryFrom = request.SalaryFrom;
        bracket.SalaryTo = request.SalaryTo;
        bracket.EmployeeShare = request.EmployeeShare;
        bracket.EmployerShare = request.EmployerShare;
        bracket.EffectiveFrom = request.EffectiveFrom;
        bracket.EffectiveTo = request.EffectiveTo;
        bracket.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return ToSssContributionBracketDto(bracket);
    }

    public async Task<IReadOnlyList<PhilHealthContributionRuleDto>> GetPhilHealthRulesAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.PhilHealthContributionRules
            .AsNoTracking()
            .OrderByDescending(x => x.EffectiveFrom)
            .Select(x => ToPhilHealthContributionRuleDto(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<PhilHealthContributionRuleDto> CreatePhilHealthRuleAsync(
        CreatePhilHealthContributionRuleRequest request,
        CancellationToken cancellationToken = default)
    {
        var rule = new PhilHealthContributionRule
        {
            ContributionRate = request.ContributionRate,
            MinimumContribution = request.MinimumContribution,
            MaximumContribution = request.MaximumContribution,
            EmployeeSharePercent = request.EmployeeSharePercent,
            EmployerSharePercent = request.EmployerSharePercent,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            IsActive = request.IsActive
        };

        _context.PhilHealthContributionRules.Add(rule);
        await _context.SaveChangesAsync(cancellationToken);

        return ToPhilHealthContributionRuleDto(rule);
    }

    public async Task<PhilHealthContributionRuleDto?> UpdatePhilHealthRuleAsync(
        int id,
        UpdatePhilHealthContributionRuleRequest request,
        CancellationToken cancellationToken = default)
    {
        var rule = await _context.PhilHealthContributionRules
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (rule is null)
        {
            return null;
        }

        rule.ContributionRate = request.ContributionRate;
        rule.MinimumContribution = request.MinimumContribution;
        rule.MaximumContribution = request.MaximumContribution;
        rule.EmployeeSharePercent = request.EmployeeSharePercent;
        rule.EmployerSharePercent = request.EmployerSharePercent;
        rule.EffectiveFrom = request.EffectiveFrom;
        rule.EffectiveTo = request.EffectiveTo;
        rule.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return ToPhilHealthContributionRuleDto(rule);
    }

    public async Task<IReadOnlyList<PagIbigContributionRuleDto>> GetPagIbigRulesAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.PagIbigContributionRules
            .AsNoTracking()
            .OrderByDescending(x => x.EffectiveFrom)
            .Select(x => ToPagIbigContributionRuleDto(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<PagIbigContributionRuleDto> CreatePagIbigRuleAsync(
        CreatePagIbigContributionRuleRequest request,
        CancellationToken cancellationToken = default)
    {
        var rule = new PagIbigContributionRule
        {
            EmployeeRate = request.EmployeeRate,
            EmployerRate = request.EmployerRate,
            MinimumContribution = request.MinimumContribution,
            MaximumContribution = request.MaximumContribution,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            IsActive = request.IsActive
        };

        _context.PagIbigContributionRules.Add(rule);
        await _context.SaveChangesAsync(cancellationToken);

        return ToPagIbigContributionRuleDto(rule);
    }

    public async Task<PagIbigContributionRuleDto?> UpdatePagIbigRuleAsync(
        int id,
        UpdatePagIbigContributionRuleRequest request,
        CancellationToken cancellationToken = default)
    {
        var rule = await _context.PagIbigContributionRules
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (rule is null)
        {
            return null;
        }

        rule.EmployeeRate = request.EmployeeRate;
        rule.EmployerRate = request.EmployerRate;
        rule.MinimumContribution = request.MinimumContribution;
        rule.MaximumContribution = request.MaximumContribution;
        rule.EffectiveFrom = request.EffectiveFrom;
        rule.EffectiveTo = request.EffectiveTo;
        rule.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return ToPagIbigContributionRuleDto(rule);
    }

    public async Task<IReadOnlyList<WithholdingTaxBracketDto>> GetWithholdingTaxBracketsAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.WithholdingTaxBrackets
            .AsNoTracking()
            .OrderBy(x => x.CompensationFrom)
            .ThenByDescending(x => x.EffectiveFrom)
            .Select(x => ToWithholdingTaxBracketDto(x))
            .ToListAsync(cancellationToken);
    }

    public async Task<WithholdingTaxBracketDto> CreateWithholdingTaxBracketAsync(
        CreateWithholdingTaxBracketRequest request,
        CancellationToken cancellationToken = default)
    {
        var bracket = new WithholdingTaxBracket
        {
            CompensationFrom = request.CompensationFrom,
            CompensationTo = request.CompensationTo,
            BaseTax = request.BaseTax,
            ExcessOver = request.ExcessOver,
            TaxRate = request.TaxRate,
            EffectiveFrom = request.EffectiveFrom,
            EffectiveTo = request.EffectiveTo,
            IsActive = request.IsActive
        };

        _context.WithholdingTaxBrackets.Add(bracket);
        await _context.SaveChangesAsync(cancellationToken);

        return ToWithholdingTaxBracketDto(bracket);
    }

    public async Task<WithholdingTaxBracketDto?> UpdateWithholdingTaxBracketAsync(
        int id,
        UpdateWithholdingTaxBracketRequest request,
        CancellationToken cancellationToken = default)
    {
        var bracket = await _context.WithholdingTaxBrackets
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        if (bracket is null)
        {
            return null;
        }

        bracket.CompensationFrom = request.CompensationFrom;
        bracket.CompensationTo = request.CompensationTo;
        bracket.BaseTax = request.BaseTax;
        bracket.ExcessOver = request.ExcessOver;
        bracket.TaxRate = request.TaxRate;
        bracket.EffectiveFrom = request.EffectiveFrom;
        bracket.EffectiveTo = request.EffectiveTo;
        bracket.IsActive = request.IsActive;

        await _context.SaveChangesAsync(cancellationToken);

        return ToWithholdingTaxBracketDto(bracket);
    }

    private static SssContributionBracketDto ToSssContributionBracketDto(
        SssContributionBracket bracket)
    {
        return new SssContributionBracketDto
        {
            Id = bracket.Id,
            SalaryFrom = bracket.SalaryFrom,
            SalaryTo = bracket.SalaryTo,
            EmployeeShare = bracket.EmployeeShare,
            EmployerShare = bracket.EmployerShare,
            EffectiveFrom = bracket.EffectiveFrom,
            EffectiveTo = bracket.EffectiveTo,
            IsActive = bracket.IsActive
        };
    }

    private static PhilHealthContributionRuleDto ToPhilHealthContributionRuleDto(
        PhilHealthContributionRule rule)
    {
        return new PhilHealthContributionRuleDto
        {
            Id = rule.Id,
            ContributionRate = rule.ContributionRate,
            MinimumContribution = rule.MinimumContribution,
            MaximumContribution = rule.MaximumContribution,
            EmployeeSharePercent = rule.EmployeeSharePercent,
            EmployerSharePercent = rule.EmployerSharePercent,
            EffectiveFrom = rule.EffectiveFrom,
            EffectiveTo = rule.EffectiveTo,
            IsActive = rule.IsActive
        };
    }

    private static PagIbigContributionRuleDto ToPagIbigContributionRuleDto(
        PagIbigContributionRule rule)
    {
        return new PagIbigContributionRuleDto
        {
            Id = rule.Id,
            EmployeeRate = rule.EmployeeRate,
            EmployerRate = rule.EmployerRate,
            MinimumContribution = rule.MinimumContribution,
            MaximumContribution = rule.MaximumContribution,
            EffectiveFrom = rule.EffectiveFrom,
            EffectiveTo = rule.EffectiveTo,
            IsActive = rule.IsActive
        };
    }

    private static WithholdingTaxBracketDto ToWithholdingTaxBracketDto(
        WithholdingTaxBracket bracket)
    {
        return new WithholdingTaxBracketDto
        {
            Id = bracket.Id,
            CompensationFrom = bracket.CompensationFrom,
            CompensationTo = bracket.CompensationTo,
            BaseTax = bracket.BaseTax,
            ExcessOver = bracket.ExcessOver,
            TaxRate = bracket.TaxRate,
            EffectiveFrom = bracket.EffectiveFrom,
            EffectiveTo = bracket.EffectiveTo,
            IsActive = bracket.IsActive
        };
    }

    private static decimal RoundMoney(decimal amount)
    {
        return Math.Round(amount, 2, MidpointRounding.AwayFromZero);
    }
}