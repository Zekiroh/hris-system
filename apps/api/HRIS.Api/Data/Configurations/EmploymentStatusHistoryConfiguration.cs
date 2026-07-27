using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class EmploymentStatusHistoryConfiguration : IEntityTypeConfiguration<EmploymentStatusHistory>
{
    public void Configure(EntityTypeBuilder<EmploymentStatusHistory> builder)
    {
        builder.HasKey(x => x.Id);

        builder.Property(x => x.PreviousEmploymentStatus)
            .HasMaxLength(50);

        builder.Property(x => x.NewEmploymentStatus)
            .HasMaxLength(50)
            .IsRequired();

        builder.HasIndex(x => x.EmployeeId);
        builder.HasIndex(x => x.ChangedAtUtc);
        builder.HasIndex(x => x.ChangedByUserId);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ChangedByUser)
            .WithMany()
            .HasForeignKey(x => x.ChangedByUserId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
