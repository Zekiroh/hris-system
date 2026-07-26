using System;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class GovernmentComplianceReportingCompletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Bir2316Trackings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    EmployeeId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    TaxYear = table.Column<int>(type: "int", nullable: false),
                    Status = table.Column<string>(type: "varchar(20)", maxLength: 20, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    EmployeeDocumentId = table.Column<Guid>(type: "char(36)", nullable: true, collation: "ascii_general_ci"),
                    PreparedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    ReleasedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    AcknowledgedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Bir2316Trackings", x => x.Id);
                    table.CheckConstraint("CK_Bir2316Tracking_Status", "`Status` IN ('Pending', 'Prepared', 'Released', 'Acknowledged')");
                    table.CheckConstraint("CK_Bir2316Tracking_TaxYear", "`TaxYear` >= 1900 AND `TaxYear` <= 9999");
                    table.ForeignKey(
                        name: "FK_Bir2316Trackings_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Bir2316Trackings_employee_documents_EmployeeDocumentId",
                        column: x => x.EmployeeDocumentId,
                        principalTable: "employee_documents",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateTable(
                name: "EmploymentStatusHistories",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("MySql:ValueGenerationStrategy", MySqlValueGenerationStrategy.IdentityColumn),
                    EmployeeId = table.Column<Guid>(type: "char(36)", nullable: false, collation: "ascii_general_ci"),
                    PreviousEmploymentStatus = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: true)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    NewEmploymentStatus = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false)
                        .Annotation("MySql:CharSet", "utf8mb4"),
                    PreviousIsActive = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    NewIsActive = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ChangedAtUtc = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    ChangedByUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmploymentStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_EmploymentStatusHistories_Employees_EmployeeId",
                        column: x => x.EmployeeId,
                        principalTable: "Employees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentStatusHistories_users_ChangedByUserId",
                        column: x => x.ChangedByUserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                })
                .Annotation("MySql:CharSet", "utf8mb4");

            migrationBuilder.CreateIndex(
                name: "IX_Bir2316Trackings_EmployeeDocumentId",
                table: "Bir2316Trackings",
                column: "EmployeeDocumentId");

            migrationBuilder.CreateIndex(
                name: "IX_Bir2316Trackings_EmployeeId_TaxYear",
                table: "Bir2316Trackings",
                columns: new[] { "EmployeeId", "TaxYear" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bir2316Trackings_Status",
                table: "Bir2316Trackings",
                column: "Status");

            migrationBuilder.CreateIndex(
                name: "IX_Bir2316Trackings_TaxYear",
                table: "Bir2316Trackings",
                column: "TaxYear");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentStatusHistories_ChangedAtUtc",
                table: "EmploymentStatusHistories",
                column: "ChangedAtUtc");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentStatusHistories_ChangedByUserId",
                table: "EmploymentStatusHistories",
                column: "ChangedByUserId");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentStatusHistories_EmployeeId",
                table: "EmploymentStatusHistories",
                column: "EmployeeId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Bir2316Trackings");

            migrationBuilder.DropTable(
                name: "EmploymentStatusHistories");
        }
    }
}
