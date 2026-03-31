using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class Employee_C2_GovernmentFields_UniqueIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "TINNumber",
                table: "Employees",
                newName: "TinNumber");

            migrationBuilder.RenameColumn(
                name: "SSSNumber",
                table: "Employees",
                newName: "SssNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_PagIbigNumber",
                table: "Employees",
                column: "PagIbigNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_PhilHealthNumber",
                table: "Employees",
                column: "PhilHealthNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_SssNumber",
                table: "Employees",
                column: "SssNumber",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_TinNumber",
                table: "Employees",
                column: "TinNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Employees_PagIbigNumber",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_PhilHealthNumber",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_SssNumber",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_TinNumber",
                table: "Employees");

            migrationBuilder.RenameColumn(
                name: "TinNumber",
                table: "Employees",
                newName: "TINNumber");

            migrationBuilder.RenameColumn(
                name: "SssNumber",
                table: "Employees",
                newName: "SSSNumber");
        }
    }
}
