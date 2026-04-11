using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class EmployeeDocumentConfiguration : IEntityTypeConfiguration<EmployeeDocument>
{
    public void Configure(EntityTypeBuilder<EmployeeDocument> e)
    {
        e.ToTable("employee_documents");

        e.HasKey(d => d.Id);

        e.Property(d => d.DocumentType)
            .HasMaxLength(50)
            .IsRequired();

        e.Property(d => d.OriginalFileName)
            .HasMaxLength(255)
            .IsRequired();

        e.Property(d => d.StoredFileName)
            .HasMaxLength(255)
            .IsRequired();

        e.Property(d => d.ContentType)
            .HasMaxLength(100)
            .IsRequired();

        e.Property(d => d.FileSize)
            .IsRequired();

        e.Property(d => d.StoragePath)
            .HasMaxLength(500)
            .IsRequired();

        e.Property(d => d.UploadedAtUtc)
            .IsRequired();

        e.HasOne(d => d.Employee)
            .WithMany(e => e.Documents)
            .HasForeignKey(d => d.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        e.HasIndex(d => d.EmployeeId);
        e.HasIndex(d => d.DocumentType);
    }
}