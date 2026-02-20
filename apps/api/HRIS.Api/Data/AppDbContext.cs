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

            e.HasIndex(r => r.Name).IsUnique();
        });

        // users table
        modelBuilder.Entity<User>(e =>
        {
            e.ToTable("users");

            e.HasKey(u => u.Id);

            e.Property(u => u.Email)
                .HasMaxLength(120)
                .IsRequired();

            e.HasIndex(u => u.Email).IsUnique();

            e.Property(u => u.FullName)
                .HasMaxLength(120)
                .IsRequired();

            e.Property(u => u.PasswordHash)
                .HasMaxLength(255)
                .IsRequired();

            e.Property(u => u.CreatedAt)
                .IsRequired();

            e.HasOne(u => u.Role)
                .WithMany(r => r.Users)
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}