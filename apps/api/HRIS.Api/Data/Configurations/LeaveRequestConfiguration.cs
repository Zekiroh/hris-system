using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class LeaveRequestConfiguration : IEntityTypeConfiguration<LeaveRequest>
{
    public void Configure(EntityTypeBuilder<LeaveRequest> builder)
    {
        builder.HasIndex(x => x.EmployeeId);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.LeaveType);
        builder.HasIndex(x => new { x.EmployeeId, x.StartDate, x.EndDate });

        builder.Property(x => x.LeaveType)
            .HasMaxLength(30)
            .IsRequired();

        builder.Property(x => x.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.DaysRequested)
            .HasPrecision(6, 2);

        builder.Property(x => x.Reason)
            .HasMaxLength(500);

        builder.Property(x => x.ReviewRemarks)
            .HasMaxLength(500);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ReviewedByUser)
            .WithMany()
            .HasForeignKey(x => x.ReviewedByUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}