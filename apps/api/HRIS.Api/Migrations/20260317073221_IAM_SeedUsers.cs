using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class IAM_SeedUsers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "users",
                columns: new[] { "Id", "CreatedAt", "Email", "FullName", "IsActive", "NormalizedEmail", "PasswordHash", "PasswordResetToken", "PasswordResetTokenExpiresAt", "RoleId", "UpdatedAt" },
                values: new object[,]
                {
                    { 101L, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "superadmin@simplevia.com", "Super Admin", true, "SUPERADMIN@SIMPLEVIA.COM", "$2a$11$K4TnWy1Wt/NB5n3e2FxEk.dwwOLwp5j0/ChgeOeookyl8ApuV8yim", null, null, 1, null },
                    { 102L, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "admin@simplevia.com", "Admin User", true, "ADMIN@SIMPLEVIA.COM", "$2a$11$4.lJCnxOfMgrWWJ//6bRCOvH.5XGyyExoyx.bPOsEdRcXCTm6rCi2", null, null, 2, null },
                    { 103L, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), "user@simplevia.com", "Regular User", true, "USER@SIMPLEVIA.COM", "$2a$11$3w9FJ6ypCA1HkYL0J.z2AeoSJLavuSJRbXE3N3IZhD3pSZ4r86RsG", null, null, 3, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: 101L);

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: 102L);

            migrationBuilder.DeleteData(
                table: "users",
                keyColumn: "Id",
                keyValue: 103L);
        }
    }
}
