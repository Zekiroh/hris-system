using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class PhilHealthContributionRuleConfiguration : IEntityTypeConfiguration<PhilHealthContributionRule>
{
    public void Configure(EntityTypeBuilder<PhilHealthContributionRule> builder)
    {
        builder.HasKey(x => x.Id);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_PhilHealthContributionRule_AmountRange",
                "`ContributionRate` >= 0 AND `MinimumContribution` >= 0 AND `MaximumContribution` >= `MinimumContribution` AND `EmployeeSharePercent` >= 0 AND `EmployeeSharePercent` <= 1 AND `EmployerSharePercent` >= 0 AND `EmployerSharePercent` <= 1");

            t.HasCheckConstraint(
                "CK_PhilHealthContributionRule_EffectiveRange",
                "`EffectiveTo` IS NULL OR `EffectiveTo` >= `EffectiveFrom`");
        });

        builder.Property(x => x.ContributionRate)
            .HasPrecision(18, 6);

        builder.Property(x => x.MinimumContribution)
            .HasPrecision(18, 2);

        builder.Property(x => x.MaximumContribution)
            .HasPrecision(18, 2);

        builder.Property(x => x.EmployeeSharePercent)
            .HasPrecision(18, 6);

        builder.Property(x => x.EmployerSharePercent)
            .HasPrecision(18, 6);

        builder.HasIndex(x => new
        {
            x.EffectiveFrom,
            x.IsActive
        });
    }
}