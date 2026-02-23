using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class IAMv1_SeedPermissions : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "permissions",
                columns: new[] { "Id", "CanArchive", "CanCreate", "CanUpdate", "CanView", "CreatedAt", "Module", "RoleId", "UpdatedAt" },
                values: new object[,]
                {
                    { 1, true, true, true, true, new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "IAM", 1, null },
                    { 2, true, true, true, true, new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "EMPLOYEE", 1, null },
                    { 3, true, true, true, true, new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "IAM", 2, null },
                    { 4, true, true, true, true, new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "EMPLOYEE", 2, null },
                    { 5, false, false, false, true, new DateTime(2026, 2, 23, 0, 0, 0, 0, DateTimeKind.Utc), "EMPLOYEE", 3, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "permissions",
                keyColumn: "Id",
                keyValue: 5);
        }
    }
}
