using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // roles table
        modelBuilder.Entity<Role>(e =>
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

            // seed initial system roles
            e.HasData(
                new Role { Id = 1, Name = "Super Admin", NormalizedName = "SUPER_ADMIN", IsSystem = true },
                new Role { Id = 2, Name = "Admin",      NormalizedName = "ADMIN",       IsSystem = true },
                new Role { Id = 3, Name = "User",       NormalizedName = "USER",        IsSystem = true }
            );
        });

        // users table
        modelBuilder.Entity<User>(e =>
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
        });
    }
}