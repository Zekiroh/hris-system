using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class DailyReportConfiguration : IEntityTypeConfiguration<DailyReport>
{
    public void Configure(EntityTypeBuilder<DailyReport> builder)
    {
        builder.ToTable("daily_reports");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.WorkArrangement).HasMaxLength(50).IsRequired();
        builder.Property(x => x.Project).HasMaxLength(200).IsRequired();
        builder.Property(x => x.SprintIteration).HasMaxLength(100);
        builder.Property(x => x.TeamUnit).HasMaxLength(100);
        builder.Property(x => x.AvgResponseTime).HasMaxLength(50);
        builder.Property(x => x.ConnectivityIssues).HasMaxLength(500);
        builder.Property(x => x.CollaborationLog).HasMaxLength(1000);

        builder.Property(x => x.KeyAccomplishments).HasMaxLength(2000);
        builder.Property(x => x.BlockersIssues).HasMaxLength(1000);
        builder.Property(x => x.RisksEarlyWarnings).HasMaxLength(1000);
        builder.Property(x => x.PlanForTomorrow).HasMaxLength(1000);
        builder.Property(x => x.SupportEscalationNeeded).HasMaxLength(500);
        builder.Property(x => x.WorkArrangementTomorrow).HasMaxLength(50);
        builder.Property(x => x.LeaveAbsenceNotice).HasMaxLength(500);
        builder.Property(x => x.SupervisorNotes).HasMaxLength(2000);
        builder.Property(x => x.PerformanceRating).HasMaxLength(50);
        builder.Property(x => x.ManagerActionItems).HasMaxLength(1000);
        builder.Property(x => x.ReviewedBy).HasMaxLength(200);

        builder.HasOne(x => x.Employee)
               .WithMany()
               .HasForeignKey(x => x.EmployeeId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(x => x.SubmittedTo)
               .WithMany()
               .HasForeignKey(x => x.SubmittedToUserId)
               .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Tasks)
               .WithOne(x => x.DailyReport)
               .HasForeignKey(x => x.DailyReportId)
               .OnDelete(DeleteBehavior.Cascade);

        builder.HasIndex(x => new { x.EmployeeId, x.ReportDate }).IsUnique();
    }
}
