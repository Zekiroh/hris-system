using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class AssetConfiguration : IEntityTypeConfiguration<Asset>
{
    public void Configure(EntityTypeBuilder<Asset> builder)
    {
        builder.HasIndex(a => a.AssetCode).IsUnique();

        builder.Property(a => a.AssetCode).HasMaxLength(50).IsRequired();
        builder.Property(a => a.AssetName).HasMaxLength(150).IsRequired();
        builder.Property(a => a.Category).HasMaxLength(100).IsRequired();
        builder.Property(a => a.Brand).HasMaxLength(100);
        builder.Property(a => a.Model).HasMaxLength(100);
        builder.Property(a => a.SerialNumber).HasMaxLength(100);
        builder.Property(a => a.Status).HasMaxLength(50).IsRequired();
        builder.Property(a => a.Notes).HasMaxLength(500);
    }
}