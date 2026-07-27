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
        decimal monthlyGrossPay,
        DateOnly payrollDate,
        CancellationToken cancellationToken = default)
    {
        var sssBracket = await _context.SssContributionBrackets
            .AsNoTracking()
            .Where(b =>
                b.IsActive &&
                b.EffectiveFrom <= payrollDate &&
                (b.EffectiveTo == null || b.EffectiveTo >= payrollDate) &&
                monthlyGrossPay >= b.SalaryFrom &&
                (b.SalaryTo == null || monthlyGrossPay <= b.SalaryTo))
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

        var missingRules = new List<string>();

        if (sssBracket is null)
        {
            missingRules.Add("SSS bracket");
        }

        if (philHealthRule is null)
        {
            missingRules.Add("PhilHealth rule");
        }

        if (pagIbigRule is null)
        {
            missingRules.Add("Pag-IBIG rule");
        }

        if (missingRules.Count > 0)
        {
            throw new InvalidOperationException(
                $"Missing active compliance configuration for {payrollDate:yyyy-MM-dd}: {string.Join(", ", missingRules)}.");
        }

        var activeSssBracket = sssBracket!;
        var activePhilHealthRule = philHealthRule!;
        var activePagIbigRule = pagIbigRule!;
        var result = new GovernmentComplianceCalculationResult
        {
            SssEmployeeShare = RoundMoney(activeSssBracket.EmployeeShare),
            SssEmployerShare = RoundMoney(activeSssBracket.EmployerShare)
        };

        var totalPhilHealthContribution = monthlyGrossPay * activePhilHealthRule.ContributionRate;

        totalPhilHealthContribution = Math.Max(
            activePhilHealthRule.MinimumContribution,
            totalPhilHealthContribution);

        totalPhilHealthContribution = Math.Min(
            activePhilHealthRule.MaximumContribution,
            totalPhilHealthContribution);

        result.PhilHealthEmployeeShare = RoundMoney(
            totalPhilHealthContribution * activePhilHealthRule.EmployeeSharePercent);

        result.PhilHealthEmployerShare = RoundMoney(
            totalPhilHealthContribution * activePhilHealthRule.EmployerSharePercent);

        var employeeShare = monthlyGrossPay * activePagIbigRule.EmployeeRate;
        var employerShare = monthlyGrossPay * activePagIbigRule.EmployerRate;

        result.PagIbigEmployeeShare = RoundMoney(
            Math.Clamp(
                employeeShare,
                activePagIbigRule.MinimumContribution,
                activePagIbigRule.MaximumContribution));

        result.PagIbigEmployerShare = RoundMoney(
            Math.Clamp(
                employerShare,
                activePagIbigRule.MinimumContribution,
                activePagIbigRule.MaximumContribution));

        var monthlyTaxableCompensation = Math.Max(
            0m,
            monthlyGrossPay -
            result.SssEmployeeShare -
            result.PhilHealthEmployeeShare -
            result.PagIbigEmployeeShare);

        var taxBracket = await _context.WithholdingTaxBrackets
            .AsNoTracking()
            .Where(b =>
                b.IsActive &&
                b.EffectiveFrom <= payrollDate &&
                (b.EffectiveTo == null || b.EffectiveTo >= payrollDate) &&
                monthlyTaxableCompensation >= b.CompensationFrom &&
                (b.CompensationTo == null || monthlyTaxableCompensation <= b.CompensationTo))
            .OrderByDescending(b => b.EffectiveFrom)
            .FirstOrDefaultAsync(cancellationToken);

        if (taxBracket is null)
        {
            throw new InvalidOperationException(
                $"Missing active withholding tax bracket for taxable compensation on {payrollDate:yyyy-MM-dd}.");
        }

        result.WithholdingTax = RoundMoney(
            taxBracket.BaseTax +
            ((monthlyTaxableCompensation - taxBracket.ExcessOver) * taxBracket.TaxRate));

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
        await ValidateSssBracketAsync(
            request.SalaryFrom,
            request.SalaryTo,
            request.EmployeeShare,
            request.EmployerShare,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.IsActive,
            null,
            cancellationToken);

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

        await ValidateSssBracketAsync(
            request.SalaryFrom,
            request.SalaryTo,
            request.EmployeeShare,
            request.EmployerShare,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.IsActive,
            id,
            cancellationToken);

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
        await ValidatePhilHealthRuleAsync(
            request.ContributionRate,
            request.MinimumContribution,
            request.MaximumContribution,
            request.EmployeeSharePercent,
            request.EmployerSharePercent,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.IsActive,
            null,
            cancellationToken);

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

        await ValidatePhilHealthRuleAsync(
            request.ContributionRate,
            request.MinimumContribution,
            request.MaximumContribution,
            request.EmployeeSharePercent,
            request.EmployerSharePercent,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.IsActive,
            id,
            cancellationToken);

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
        await ValidatePagIbigRuleAsync(
            request.EmployeeRate,
            request.EmployerRate,
            request.MinimumContribution,
            request.MaximumContribution,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.IsActive,
            null,
            cancellationToken);

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

        await ValidatePagIbigRuleAsync(
            request.EmployeeRate,
            request.EmployerRate,
            request.MinimumContribution,
            request.MaximumContribution,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.IsActive,
            id,
            cancellationToken);

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
        await ValidateWithholdingTaxBracketAsync(
            request.CompensationFrom,
            request.CompensationTo,
            request.BaseTax,
            request.ExcessOver,
            request.TaxRate,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.IsActive,
            null,
            cancellationToken);

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

        await ValidateWithholdingTaxBracketAsync(
            request.CompensationFrom,
            request.CompensationTo,
            request.BaseTax,
            request.ExcessOver,
            request.TaxRate,
            request.EffectiveFrom,
            request.EffectiveTo,
            request.IsActive,
            id,
            cancellationToken);

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

    private async Task ValidateSssBracketAsync(
        decimal salaryFrom,
        decimal? salaryTo,
        decimal employeeShare,
        decimal employerShare,
        DateOnly effectiveFrom,
        DateOnly? effectiveTo,
        bool isActive,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        if (salaryFrom < 0)
        {
            throw new ArgumentException("SalaryFrom must be greater than or equal to zero.");
        }

        if (salaryTo is not null && salaryTo < salaryFrom)
        {
            throw new ArgumentException("SalaryTo must be greater than or equal to SalaryFrom.");
        }

        if (employeeShare < 0 || employerShare < 0)
        {
            throw new ArgumentException("SSS employee and employer shares must be greater than or equal to zero.");
        }

        ValidateEffectiveRange(effectiveFrom, effectiveTo);

        if (!isActive)
        {
            return;
        }

        var effectiveEnd = effectiveTo ?? DateOnly.MaxValue;
        var salaryEnd = salaryTo ?? decimal.MaxValue;

        var hasOverlap = await _context.SssContributionBrackets
            .AsNoTracking()
            .AnyAsync(x =>
                x.IsActive &&
                (!excludedId.HasValue || x.Id != excludedId.Value) &&
                x.EffectiveFrom <= effectiveEnd &&
                (x.EffectiveTo == null || x.EffectiveTo >= effectiveFrom) &&
                x.SalaryFrom <= salaryEnd &&
                (x.SalaryTo == null || x.SalaryTo >= salaryFrom),
                cancellationToken);

        if (hasOverlap)
        {
            throw new InvalidOperationException("Overlapping active SSS bracket detected.");
        }
    }

    private async Task ValidatePhilHealthRuleAsync(
        decimal contributionRate,
        decimal minimumContribution,
        decimal maximumContribution,
        decimal employeeSharePercent,
        decimal employerSharePercent,
        DateOnly effectiveFrom,
        DateOnly? effectiveTo,
        bool isActive,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        if (contributionRate < 0)
        {
            throw new ArgumentException("ContributionRate must be greater than or equal to zero.");
        }

        if (minimumContribution < 0 || maximumContribution < minimumContribution)
        {
            throw new ArgumentException("PhilHealth contribution range is invalid.");
        }

        if (employeeSharePercent < 0 || employeeSharePercent > 1 ||
            employerSharePercent < 0 || employerSharePercent > 1)
        {
            throw new ArgumentException("PhilHealth share percentages must be between 0 and 1.");
        }

        ValidateEffectiveRange(effectiveFrom, effectiveTo);

        if (!isActive)
        {
            return;
        }

        var effectiveEnd = effectiveTo ?? DateOnly.MaxValue;

        var hasOverlap = await _context.PhilHealthContributionRules
            .AsNoTracking()
            .AnyAsync(x =>
                x.IsActive &&
                (!excludedId.HasValue || x.Id != excludedId.Value) &&
                x.EffectiveFrom <= effectiveEnd &&
                (x.EffectiveTo == null || x.EffectiveTo >= effectiveFrom),
                cancellationToken);

        if (hasOverlap)
        {
            throw new InvalidOperationException("Overlapping active PhilHealth rule detected.");
        }
    }

    private async Task ValidatePagIbigRuleAsync(
        decimal employeeRate,
        decimal employerRate,
        decimal minimumContribution,
        decimal maximumContribution,
        DateOnly effectiveFrom,
        DateOnly? effectiveTo,
        bool isActive,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        if (employeeRate < 0 || employerRate < 0)
        {
            throw new ArgumentException("Pag-IBIG employee and employer rates must be greater than or equal to zero.");
        }

        if (minimumContribution < 0 || maximumContribution < minimumContribution)
        {
            throw new ArgumentException("Pag-IBIG contribution range is invalid.");
        }

        ValidateEffectiveRange(effectiveFrom, effectiveTo);

        if (!isActive)
        {
            return;
        }

        var effectiveEnd = effectiveTo ?? DateOnly.MaxValue;

        var hasOverlap = await _context.PagIbigContributionRules
            .AsNoTracking()
            .AnyAsync(x =>
                x.IsActive &&
                (!excludedId.HasValue || x.Id != excludedId.Value) &&
                x.EffectiveFrom <= effectiveEnd &&
                (x.EffectiveTo == null || x.EffectiveTo >= effectiveFrom),
                cancellationToken);

        if (hasOverlap)
        {
            throw new InvalidOperationException("Overlapping active Pag-IBIG rule detected.");
        }
    }

    private async Task ValidateWithholdingTaxBracketAsync(
        decimal compensationFrom,
        decimal? compensationTo,
        decimal baseTax,
        decimal excessOver,
        decimal taxRate,
        DateOnly effectiveFrom,
        DateOnly? effectiveTo,
        bool isActive,
        int? excludedId,
        CancellationToken cancellationToken)
    {
        if (compensationFrom < 0)
        {
            throw new ArgumentException("CompensationFrom must be greater than or equal to zero.");
        }

        if (compensationTo is not null && compensationTo < compensationFrom)
        {
            throw new ArgumentException("CompensationTo must be greater than or equal to CompensationFrom.");
        }

        if (baseTax < 0 || excessOver < 0 || taxRate < 0)
        {
            throw new ArgumentException("Withholding tax values must be greater than or equal to zero.");
        }

        ValidateEffectiveRange(effectiveFrom, effectiveTo);

        if (!isActive)
        {
            return;
        }

        var effectiveEnd = effectiveTo ?? DateOnly.MaxValue;
        var compensationEnd = compensationTo ?? decimal.MaxValue;

        var hasOverlap = await _context.WithholdingTaxBrackets
            .AsNoTracking()
            .AnyAsync(x =>
                x.IsActive &&
                (!excludedId.HasValue || x.Id != excludedId.Value) &&
                x.EffectiveFrom <= effectiveEnd &&
                (x.EffectiveTo == null || x.EffectiveTo >= effectiveFrom) &&
                x.CompensationFrom <= compensationEnd &&
                (x.CompensationTo == null || x.CompensationTo >= compensationFrom),
                cancellationToken);

        if (hasOverlap)
        {
            throw new InvalidOperationException("Overlapping active withholding tax bracket detected.");
        }
    }

    private static void ValidateEffectiveRange(DateOnly effectiveFrom, DateOnly? effectiveTo)
    {
        if (effectiveTo is not null && effectiveTo < effectiveFrom)
        {
            throw new ArgumentException("EffectiveTo must be greater than or equal to EffectiveFrom.");
        }
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
