using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPerformanceEvaluationConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_PerformanceEvaluations_EmployeeId_ReviewPeriod",
                table: "PerformanceEvaluations",
                columns: new[] { "EmployeeId", "ReviewPeriod" },
                unique: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_PerformanceEvaluations_ScoreRange",
                table: "PerformanceEvaluations",
                sql: "`Score` >= 0 AND `Score` <= 5");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_PerformanceEvaluations_EmployeeId_ReviewPeriod",
                table: "PerformanceEvaluations");

            migrationBuilder.DropCheckConstraint(
                name: "CK_PerformanceEvaluations_ScoreRange",
                table: "PerformanceEvaluations");
        }
    }
}
