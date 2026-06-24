using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class AssetReturnRequestConfiguration : IEntityTypeConfiguration<AssetReturnRequest>
{
    public void Configure(EntityTypeBuilder<AssetReturnRequest> builder)
    {
        builder.HasIndex(arr => arr.AssetAssignmentId);

        builder.HasIndex(arr => arr.Status);

        builder.HasOne(arr => arr.AssetAssignment)
            .WithMany()
            .HasForeignKey(arr => arr.AssetAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(arr => arr.Employee)
            .WithMany()
            .HasForeignKey(arr => arr.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(arr => arr.ReviewedByUser)
            .WithMany()
            .HasForeignKey(arr => arr.ReviewedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(arr => arr.Reason)
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(arr => arr.Status)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(arr => arr.ReviewRemarks)
            .HasMaxLength(500);
    }
}