using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class SssContributionBracketConfiguration : IEntityTypeConfiguration<SssContributionBracket>
{
    public void Configure(EntityTypeBuilder<SssContributionBracket> builder)
    {
        builder.HasKey(x => x.Id);

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