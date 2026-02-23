using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> e)
    {
        e.ToTable("users");

        e.HasKey(u => u.Id);

        e.Property(u => u.Email)
            .HasMaxLength(120)
            .IsRequired();

        e.Property(u => u.NormalizedEmail)
            .HasMaxLength(120)
            .IsRequired();

        e.HasIndex(u => u.NormalizedEmail).IsUnique();

        e.Property(u => u.FullName)
            .HasMaxLength(120)
            .IsRequired();

        e.Property(u => u.PasswordHash)
            .HasMaxLength(255)
            .IsRequired();

        e.Property(u => u.IsActive)
            .IsRequired();

        e.Property(u => u.CreatedAt)
            .IsRequired();

        e.Property(u => u.UpdatedAt);

        e.HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}