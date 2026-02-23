using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class ActivityLogConfiguration : IEntityTypeConfiguration<ActivityLog>
{
    public void Configure(EntityTypeBuilder<ActivityLog> e)
    {
        e.ToTable("activity_logs");

        e.HasKey(a => a.Id);

        e.Property(a => a.ActorEmail)
            .HasMaxLength(255)
            .IsRequired();

        e.Property(a => a.ActorRole)
            .HasMaxLength(50)
            .IsRequired();

        e.Property(a => a.Action)
            .HasMaxLength(100)
            .IsRequired();

        e.Property(a => a.Module)
            .HasMaxLength(50)
            .IsRequired();

        e.Property(a => a.TargetType)
            .HasMaxLength(50);

        e.Property(a => a.TargetId)
            .HasMaxLength(64);

        // Snapshot shows longtext for these.
        e.Property(a => a.Summary)
            .HasColumnType("longtext");

        e.Property(a => a.MetadataJson)
            .HasColumnType("longtext");

        e.Property(a => a.IpAddress)
            .HasMaxLength(45);

        e.Property(a => a.UserAgent)
            .HasMaxLength(512);

        e.Property(a => a.CreatedAt)
            .IsRequired();

        // Fast filtering for the UI
        e.HasIndex(a => a.CreatedAt);
        e.HasIndex(a => new { a.Module, a.CreatedAt });
        e.HasIndex(a => a.ActorUserId);
    }
}