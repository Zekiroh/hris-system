using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyAccomplishmentReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "daily_reports",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    EmployeeId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    ReportDate = table.Column<DateOnly>(type: "date", nullable: false),
                    WorkArrangement = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SubmissionTime = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    Project = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SprintIteration = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TeamUnit = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SubmittedToUserId = table.Column<long>(type: "bigint", nullable: true),
                    TimeIn = table.Column<TimeOnly>(type: "time(6)", nullable: true),
                    TimeOut = table.Column<TimeOnly>(type: "time(6)", nullable: true),
                    BreakDurationMinutes = table.Column<int>(type: "int", nullable: false),
                    AttendedStandup = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ReachableViaComms = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    AvgResponseTime = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ConnectivityIssues = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CollaborationLog = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    KeyAccomplishments = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BlockersIssues = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    RisksEarlyWarnings = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PlanForTomorrow = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SupportEscalationNeeded = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CodeCommitted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TicketsUpdated = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    PullRequestCreated = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    DocumentationUpdated = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    TestsPassing = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ReportSubmittedOnTime = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    WorkArrangementTomorrow = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ExpectedTimeIn = table.Column<TimeOnly>(type: "time(6)", nullable: true),
                    LeaveAbsenceNotice = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    SupervisorNotes = table.Column<string>(type: "varchar(2000)", maxLength: 2000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PerformanceRating = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    FollowUpRequired = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ReviewDate = table.Column<DateOnly>(type: "date", nullable: true),
                    ManagerActionItems = table.Column<string>(type: "varchar(1000)", maxLength: 1000, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    ReviewedBy = table.Column<string>(type: "varchar(200)", maxLength: 200, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    DateReviewed = table.Column<DateOnly>(type: "date", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_daily_reports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_daily_reports_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_daily_reports_users_SubmittedToUserId",
                        column: x => x.SubmittedToUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "daily_report_tasks",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    DailyReportId = table.Column<int>(type: "int", nullable: false),
                    TaskNumber = table.Column<int>(type: "int", nullable: false),
                    IsCarryOver = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    Priority = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TaskType = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    TicketRefNo = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Description = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Module = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    Status = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PercentDone = table.Column<int>(type: "int", nullable: false),
                    EstimatedHours = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false),
                    ActualHours = table.Column<decimal>(type: "decimal(4,2)", precision: 4, scale: 2, nullable: false),
                    OutputDeliverable = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    CommitPrLink = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    BlockedByRemarks = table.Column<string>(type: "varchar(500)", maxLength: 500, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_daily_report_tasks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_daily_report_tasks_daily_reports_DailyReportId",
                        column: x => x.DailyReportId,
                        principalTable: "daily_reports",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_daily_report_tasks_DailyReportId_TaskNumber",
                table: "daily_report_tasks",
                columns: new[] { "DailyReportId", "TaskNumber" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_daily_reports_EmployeeId_ReportDate",
                table: "daily_reports",
                columns: new[] { "EmployeeId", "ReportDate" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_daily_reports_SubmittedToUserId",
                table: "daily_reports",
                column: "SubmittedToUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "daily_report_tasks");

            migrationBuilder.DropTable(
                name: "daily_reports");
        }
    }
}
