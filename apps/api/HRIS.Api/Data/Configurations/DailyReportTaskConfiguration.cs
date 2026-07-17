using HRIS.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HRIS.Api.Data.Configurations;

public class DailyReportTaskConfiguration : IEntityTypeConfiguration<DailyReportTask>
{
    public void Configure(EntityTypeBuilder<DailyReportTask> builder)
    {
        builder.ToTable("daily_report_tasks");
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Priority).HasMaxLength(20).IsRequired();
        builder.Property(x => x.TaskType).HasMaxLength(50).IsRequired();
        builder.Property(x => x.TicketRefNo).HasMaxLength(100);
        builder.Property(x => x.Description).HasMaxLength(500).IsRequired();
        builder.Property(x => x.Module).HasMaxLength(100);
        builder.Property(x => x.Status).HasMaxLength(50).IsRequired();
        builder.Property(x => x.EstimatedHours).HasPrecision(4, 2);
        builder.Property(x => x.ActualHours).HasPrecision(4, 2);
        builder.Property(x => x.OutputDeliverable).HasMaxLength(500);
        builder.Property(x => x.CommitPrLink).HasMaxLength(500);
        builder.Property(x => x.BlockedByRemarks).HasMaxLength(500);
        builder.HasIndex(x => new { x.DailyReportId, x.TaskNumber }).IsUnique();
    }
}
