using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class PagIbigContributionRuleConfiguration : IEntityTypeConfiguration<PagIbigContributionRule>
{
    public void Configure(EntityTypeBuilder<PagIbigContributionRule> builder)
    {
        builder.HasKey(x => x.Id);

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