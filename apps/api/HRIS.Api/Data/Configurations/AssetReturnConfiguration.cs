using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class AssetReturnConfiguration : IEntityTypeConfiguration<AssetReturn>
{
    public void Configure(EntityTypeBuilder<AssetReturn> builder)
    {
        builder.HasIndex(ar => ar.AssetAssignmentId).IsUnique();

        builder.HasOne(ar => ar.AssetAssignment)
            .WithMany(aa => aa.Returns)
            .HasForeignKey(ar => ar.AssetAssignmentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(ar => ar.ReceivedByUser)
            .WithMany()
            .HasForeignKey(ar => ar.ReceivedByUserId)
            .OnDelete(DeleteBehavior.SetNull);

        builder.Property(ar => ar.Condition).HasMaxLength(50).IsRequired();
        builder.Property(ar => ar.Remarks).HasMaxLength(500);
    }
}