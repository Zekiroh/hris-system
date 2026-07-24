using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class PagIbigContributionRuleConfiguration : IEntityTypeConfiguration<PagIbigContributionRule>
{
    public void Configure(EntityTypeBuilder<PagIbigContributionRule> builder)
    {
        builder.HasKey(x => x.Id);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_PagIbigContributionRule_AmountRange",
                "`EmployeeRate` >= 0 AND `EmployerRate` >= 0 AND `MinimumContribution` >= 0 AND `MaximumContribution` >= `MinimumContribution`");

            t.HasCheckConstraint(
                "CK_PagIbigContributionRule_EffectiveRange",
                "`EffectiveTo` IS NULL OR `EffectiveTo` >= `EffectiveFrom`");
        });

        builder.Property(x => x.EmployeeRate)
            .HasPrecision(18, 6);

        builder.Property(x => x.EmployerRate)
            .HasPrecision(18, 6);

        builder.Property(x => x.MinimumContribution)
            .HasPrecision(18, 2);

        builder.Property(x => x.MaximumContribution)
            .HasPrecision(18, 2);

        builder.HasIndex(x => new
        {
            x.EffectiveFrom,
            x.IsActive
        });
    }
}