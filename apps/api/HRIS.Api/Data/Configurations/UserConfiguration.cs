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

        // Forgot Password fields
        e.Property(u => u.PasswordResetToken)
            .HasMaxLength(255);

        e.Property(u => u.PasswordResetTokenExpiresAt);

        e.HasIndex(u => u.PasswordResetToken);

        e.HasOne(u => u.Role)
            .WithMany(r => r.Users)
            .HasForeignKey(u => u.RoleId)
            .OnDelete(DeleteBehavior.Restrict);

        // Seed initial credentials (for testing purposes)
        e.HasData(
            new User
            {
                Id = 101,
                FullName = "Super Admin",
                Email = "superadmin@simplevia.com",
                NormalizedEmail = "SUPERADMIN@SIMPLEVIA.COM",
                PasswordHash = "$2a$11$K4TnWy1Wt/NB5n3e2FxEk.dwwOLwp5j0/ChgeOeookyl8ApuV8yim", 
                RoleId = 1,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1)
            },
            new User
            {
                Id = 102,
                FullName = "Admin User",
                Email = "admin@simplevia.com",
                NormalizedEmail = "ADMIN@SIMPLEVIA.COM",
                PasswordHash = "$2a$11$4.lJCnxOfMgrWWJ//6bRCOvH.5XGyyExoyx.bPOsEdRcXCTm6rCi2", 
                RoleId = 2,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1)
            },
            new User
            {
                Id = 103,
                FullName = "Regular User",
                Email = "user@simplevia.com",
                NormalizedEmail = "USER@SIMPLEVIA.COM",
                PasswordHash = "$2a$11$3w9FJ6ypCA1HkYL0J.z2AeoSJLavuSJRbXE3N3IZhD3pSZ4r86RsG", 
                RoleId = 3,
                IsActive = true,
                CreatedAt = new DateTime(2026, 1, 1)
            }
        );
    }
}