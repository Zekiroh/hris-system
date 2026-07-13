using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDailyReportSections4to8 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BlockersIssues",
                table: "daily_reports",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "CodeCommitted",
                table: "daily_reports",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DateReviewed",
                table: "daily_reports",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "DocumentationUpdated",
                table: "daily_reports",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<TimeOnly>(
                name: "ExpectedTimeIn",
                table: "daily_reports",
                type: "time(6)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "FollowUpRequired",
                table: "daily_reports",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "KeyAccomplishments",
                table: "daily_reports",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "LeaveAbsenceNotice",
                table: "daily_reports",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "ManagerActionItems",
                table: "daily_reports",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PerformanceRating",
                table: "daily_reports",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "PlanForTomorrow",
                table: "daily_reports",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "PullRequestCreated",
                table: "daily_reports",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "ReportSubmittedOnTime",
                table: "daily_reports",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateOnly>(
                name: "ReviewDate",
                table: "daily_reports",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewedBy",
                table: "daily_reports",
                type: "varchar(200)",
                maxLength: 200,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "RisksEarlyWarnings",
                table: "daily_reports",
                type: "varchar(1000)",
                maxLength: 1000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "SupervisorNotes",
                table: "daily_reports",
                type: "varchar(2000)",
                maxLength: 2000,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<string>(
                name: "SupportEscalationNeeded",
                table: "daily_reports",
                type: "varchar(500)",
                maxLength: 500,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.AddColumn<bool>(
                name: "TestsPassing",
                table: "daily_reports",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "TicketsUpdated",
                table: "daily_reports",
                type: "tinyint(1)",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "WorkArrangementTomorrow",
                table: "daily_reports",
                type: "varchar(50)",
                maxLength: 50,
                nullable: true)
                .Annotation("MySql:CharSet", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BlockersIssues",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "CodeCommitted",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "DateReviewed",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "DocumentationUpdated",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "ExpectedTimeIn",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "FollowUpRequired",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "KeyAccomplishments",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "LeaveAbsenceNotice",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "ManagerActionItems",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "PerformanceRating",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "PlanForTomorrow",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "PullRequestCreated",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "ReportSubmittedOnTime",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "ReviewDate",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "ReviewedBy",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "RisksEarlyWarnings",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "SupervisorNotes",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "SupportEscalationNeeded",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "TestsPassing",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "TicketsUpdated",
                table: "daily_reports");

            migrationBuilder.DropColumn(
                name: "WorkArrangementTomorrow",
                table: "daily_reports");
        }
    }
}
