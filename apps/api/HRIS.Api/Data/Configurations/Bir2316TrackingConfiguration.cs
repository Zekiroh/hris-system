using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class Bir2316TrackingConfiguration : IEntityTypeConfiguration<Bir2316Tracking>
{
    public void Configure(EntityTypeBuilder<Bir2316Tracking> builder)
    {
        builder.HasKey(x => x.Id);

        builder.ToTable(t =>
        {
            t.HasCheckConstraint(
                "CK_Bir2316Tracking_TaxYear",
                "`TaxYear` >= 1900 AND `TaxYear` <= 9999");

            t.HasCheckConstraint(
                "CK_Bir2316Tracking_Status",
                "`Status` IN ('Pending', 'Prepared', 'Released', 'Acknowledged')");
        });

        builder.Property(x => x.Status)
            .HasMaxLength(20)
            .IsRequired();

        builder.HasIndex(x => new
        {
            x.EmployeeId,
            x.TaxYear
        })
        .IsUnique();

        builder.HasIndex(x => x.TaxYear);
        builder.HasIndex(x => x.Status);
        builder.HasIndex(x => x.EmployeeDocumentId);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.EmployeeDocument)
            .WithMany()
            .HasForeignKey(x => x.EmployeeDocumentId)
            .OnDelete(DeleteBehavior.SetNull);
    }
}
