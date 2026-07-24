using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class EmployeeClearanceActivityConfiguration : IEntityTypeConfiguration<EmployeeClearanceActivity>
{
    public void Configure(EntityTypeBuilder<EmployeeClearanceActivity> builder)
    {
        builder.HasIndex(x => x.EmployeeClearanceId);
        builder.HasIndex(x => x.ActorUserId);

        builder.Property(x => x.Action)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Remarks)
            .HasMaxLength(500);

        builder.HasOne(x => x.EmployeeClearance)
            .WithMany(x => x.Activities)
            .HasForeignKey(x => x.EmployeeClearanceId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.ActorUser)
            .WithMany()
            .HasForeignKey(x => x.ActorUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}