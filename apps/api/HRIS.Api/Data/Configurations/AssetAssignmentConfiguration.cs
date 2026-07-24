using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class AssetAssignmentConfiguration : IEntityTypeConfiguration<AssetAssignment>
{
    public void Configure(EntityTypeBuilder<AssetAssignment> builder)
    {
        builder.HasIndex(aa => new { aa.AssetId, aa.IsActive });

        builder.HasOne(aa => aa.Asset)
            .WithMany(a => a.Assignments)
            .HasForeignKey(aa => aa.AssetId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(aa => aa.Employee)
            .WithMany()
            .HasForeignKey(aa => aa.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(aa => aa.AssignedByUser)
            .WithMany()
            .HasForeignKey(aa => aa.AssignedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(aa => aa.Remarks).HasMaxLength(500);
    }
}