using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    public partial class EmployeeCore_Phase1_SeedEmployeePermissions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
        INSERT INTO permissions (RoleId, Module, CanView, CanCreate, CanUpdate, CanArchive, CreatedAt)
        VALUES
        (1, 'EMPLOYEES', 1, 1, 1, 1, UTC_TIMESTAMP()),
        (2, 'EMPLOYEES', 1, 1, 1, 1, UTC_TIMESTAMP()),
        (3, 'EMPLOYEES', 1, 0, 0, 0, UTC_TIMESTAMP());
        ");
        }

        // Leave Down() as is for now
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
DELETE FROM permissions
WHERE Module = 'EMPLOYEES';
");
        }
    }
}