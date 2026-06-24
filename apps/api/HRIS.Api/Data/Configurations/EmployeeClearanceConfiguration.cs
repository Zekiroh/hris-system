using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class EmployeeClearanceConfiguration : IEntityTypeConfiguration<EmployeeClearance>
{
    public void Configure(EntityTypeBuilder<EmployeeClearance> builder)
    {
        builder.HasIndex(x => x.EmployeeId);
        builder.HasIndex(x => x.Status);

        builder.Property(x => x.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.Property(x => x.Remarks)
            .HasMaxLength(500);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}