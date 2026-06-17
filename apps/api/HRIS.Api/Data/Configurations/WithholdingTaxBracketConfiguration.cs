using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class WithholdingTaxBracketConfiguration : IEntityTypeConfiguration<WithholdingTaxBracket>
{
    public void Configure(EntityTypeBuilder<WithholdingTaxBracket> builder)
    {
        builder.HasKey(x => x.Id);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_WithholdingTaxBracket_AmountRange",
                "`CompensationFrom` >= 0 AND (`CompensationTo` IS NULL OR `CompensationTo` >= `CompensationFrom`) AND `BaseTax` >= 0 AND `ExcessOver` >= 0 AND `TaxRate` >= 0");

            t.HasCheckConstraint(
                "CK_WithholdingTaxBracket_EffectiveRange",
                "`EffectiveTo` IS NULL OR `EffectiveTo` >= `EffectiveFrom`");
        });

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