using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class PayrollRecordItemConfiguration : IEntityTypeConfiguration<PayrollRecordItem>
{
    public void Configure(EntityTypeBuilder<PayrollRecordItem> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Type)
            .HasMaxLength(50);

        builder.Property(x => x.Description)
            .HasMaxLength(200);

        builder.Property(x => x.Amount)
            .HasPrecision(18, 2);

        builder.HasOne(x => x.PayrollRecord)
            .WithMany(x => x.Items)
            .HasForeignKey(x => x.PayrollRecordId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}