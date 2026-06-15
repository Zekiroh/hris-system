using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class PayrollPeriodConfiguration : IEntityTypeConfiguration<PayrollPeriod>
{
    public void Configure(EntityTypeBuilder<PayrollPeriod> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Status)
            .HasMaxLength(20);

        builder.HasIndex(x => new
        {
            x.StartDate,
            x.EndDate
        });
    }
}