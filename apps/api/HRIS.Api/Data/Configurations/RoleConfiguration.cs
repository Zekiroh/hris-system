using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> e)
    {
        e.ToTable("roles");

        e.HasKey(r => r.Id);

        e.Property(r => r.Name)
            .HasMaxLength(50)
            .IsRequired();

        e.Property(r => r.NormalizedName)
            .HasMaxLength(50)
            .IsRequired();

        e.Property(r => r.IsSystem)
            .IsRequired();

        e.HasIndex(r => r.NormalizedName).IsUnique();

        e.HasData(
            new Role { Id = 1, Name = "Super Admin", NormalizedName = "SUPER_ADMIN", IsSystem = true },
            new Role { Id = 2, Name = "Admin", NormalizedName = "ADMIN", IsSystem = true },
            new Role { Id = 3, Name = "User", NormalizedName = "USER", IsSystem = true }
        );
    }
}