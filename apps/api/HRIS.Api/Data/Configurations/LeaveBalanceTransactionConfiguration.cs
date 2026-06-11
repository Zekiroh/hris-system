using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class LeaveBalanceTransactionConfiguration : IEntityTypeConfiguration<LeaveBalanceTransaction>
{
    public void Configure(EntityTypeBuilder<LeaveBalanceTransaction> builder)
    {
        builder.HasIndex(x => x.EmployeeId);
        builder.HasIndex(x => x.LeaveBalanceId);
        builder.HasIndex(x => x.LeaveType);
        builder.HasIndex(x => x.TransactionType);
        builder.HasIndex(x => x.CreatedAtUtc);

        builder.Property(x => x.LeaveType)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.TransactionType)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Days)
            .HasPrecision(6, 2);

        builder.Property(x => x.Remarks)
            .HasMaxLength(500);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.CreatedByUser)
            .WithMany()
            .HasForeignKey(x => x.CreatedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}