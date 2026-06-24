using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class PerformanceEvaluationConfiguration : IEntityTypeConfiguration<PerformanceEvaluation>
{
    public void Configure(EntityTypeBuilder<PerformanceEvaluation> builder)
    {
        builder.ToTable("PerformanceEvaluations", table =>
        {
            table.HasCheckConstraint(
                "CK_PerformanceEvaluations_ScoreRange",
                "`Score` >= 0 AND `Score` <= 5");
        });

        builder.HasIndex(x => x.EmployeeId);
        builder.HasIndex(x => x.ReviewerUserId);
        builder.HasIndex(x => x.ReviewPeriod);

        builder.HasIndex(x => new
            {
                x.EmployeeId,
                x.ReviewPeriod
            })
            .IsUnique();

        builder.Property(x => x.ReviewPeriod)
            .HasMaxLength(100)
            .IsRequired();

        builder.Property(x => x.Rating)
            .HasMaxLength(50)
            .IsRequired();

        builder.Property(x => x.Remarks)
            .HasMaxLength(1000);

        builder.Property(x => x.Score)
            .HasPrecision(5, 2);

        builder.HasOne(x => x.Employee)
            .WithMany()
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.ReviewerUser)
            .WithMany()
            .HasForeignKey(x => x.ReviewerUserId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}