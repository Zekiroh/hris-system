using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class LeaveBalanceConfiguration : IEntityTypeConfiguration<LeaveBalance>
{
    public void Configure(EntityTypeBuilder<LeaveBalance> builder)
    {
        builder.HasIndex(x => x.EmployeeId);

        builder.HasIndex(x => new { x.EmployeeId, x.LeaveType })
            .IsUnique();

        builder.Property(x => x.LeaveType)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.TotalCredits)
            .HasPrecision(6, 2);

        builder.Property(x => x.UsedCredits)
            .HasPrecision(6, 2);

        builder.Property(x => x.RemainingCredits)
            .HasPrecision(6, 2);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Transactions)
            .WithOne(x => x.LeaveBalance)
            .HasForeignKey(x => x.LeaveBalanceId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}