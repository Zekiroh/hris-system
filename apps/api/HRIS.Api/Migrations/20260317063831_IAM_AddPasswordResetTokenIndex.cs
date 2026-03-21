using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class IAM_AddPasswordResetTokenIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_users_PasswordResetToken",
                table: "users",
                column: "PasswordResetToken");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_users_PasswordResetToken",
                table: "users");
        }
    }
}
