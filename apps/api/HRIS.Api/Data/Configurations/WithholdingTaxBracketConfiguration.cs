using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class WithholdingTaxBracketConfiguration : IEntityTypeConfiguration<WithholdingTaxBracket>
{
    public void Configure(EntityTypeBuilder<WithholdingTaxBracket> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CompensationFrom)
            .HasPrecision(18, 2);

        builder.Property(x => x.CompensationTo)
            .HasPrecision(18, 2);

        builder.Property(x => x.BaseTax)
            .HasPrecision(18, 2);

        builder.Property(x => x.ExcessOver)
            .HasPrecision(18, 2);

        builder.Property(x => x.TaxRate)
            .HasPrecision(18, 6);

        builder.HasIndex(x => new
        {
            x.EffectiveFrom,
            x.IsActive
        });
    }
}