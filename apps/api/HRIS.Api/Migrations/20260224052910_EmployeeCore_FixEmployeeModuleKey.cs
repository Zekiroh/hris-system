using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class EmployeeCore_FixEmployeeModuleKey : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- remove rows that would conflict with existing EMPLOYEES rows
                DELETE p
                FROM permissions p
                INNER JOIN permissions keepRow
                    ON keepRow.RoleId = p.RoleId
                   AND keepRow.Module = 'EMPLOYEES'
                WHERE p.Module = 'EMPLOYEE';

                -- normalize remaining EMPLOYEE rows to EMPLOYEES
                UPDATE permissions
                SET Module = 'EMPLOYEES'
                WHERE Module = 'EMPLOYEE';
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                UPDATE permissions
                SET Module = 'EMPLOYEE'
                WHERE Module = 'EMPLOYEES';
            ");
        }
    }
}