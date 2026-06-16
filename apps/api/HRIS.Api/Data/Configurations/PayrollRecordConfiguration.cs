using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class PayrollRecordConfiguration : IEntityTypeConfiguration<PayrollRecord>
{
    public void Configure(EntityTypeBuilder<PayrollRecord> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.GrossPay)
            .HasPrecision(18, 2);

        builder.Property(x => x.TotalDeductions)
            .HasPrecision(18, 2);

        builder.Property(x => x.NetPay)
            .HasPrecision(18, 2);

        builder.Property(x => x.Status)
            .HasMaxLength(20);

        builder.HasIndex(x => new
        {
            x.PayrollPeriodId,
            x.EmployeeId
        })
        .IsUnique();

        builder.HasOne(x => x.PayrollPeriod)
            .WithMany(x => x.PayrollRecords)
            .HasForeignKey(x => x.PayrollPeriodId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}