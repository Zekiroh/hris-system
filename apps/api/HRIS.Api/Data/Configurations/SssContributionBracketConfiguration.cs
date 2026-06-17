using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class SssContributionBracketConfiguration : IEntityTypeConfiguration<SssContributionBracket>
{
    public void Configure(EntityTypeBuilder<SssContributionBracket> builder)
    {
        builder.HasKey(x => x.Id);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_SssContributionBracket_AmountRange",
                "`SalaryFrom` >= 0 AND `EmployeeShare` >= 0 AND `EmployerShare` >= 0 AND (`SalaryTo` IS NULL OR `SalaryTo` >= `SalaryFrom`)");

            t.HasCheckConstraint(
                "CK_SssContributionBracket_EffectiveRange",
                "`EffectiveTo` IS NULL OR `EffectiveTo` >= `EffectiveFrom`");
        });

        builder.Property(x => x.SalaryFrom)
            .HasPrecision(18, 2);

        builder.Property(x => x.SalaryTo)
            .HasPrecision(18, 2);

        builder.Property(x => x.EmployeeShare)
            .HasPrecision(18, 2);

        builder.Property(x => x.EmployerShare)
            .HasPrecision(18, 2);

        builder.HasIndex(x => new
        {
            x.EffectiveFrom,
            x.IsActive
        });
    }
}