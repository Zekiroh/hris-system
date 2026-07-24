using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRIS.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddGovernmentComplianceCheckConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddCheckConstraint(
                name: "CK_WithholdingTaxBracket_AmountRange",
                table: "WithholdingTaxBrackets",
                sql: "`CompensationFrom` >= 0 AND (`CompensationTo` IS NULL OR `CompensationTo` >= `CompensationFrom`) AND `BaseTax` >= 0 AND `ExcessOver` >= 0 AND `TaxRate` >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "CK_WithholdingTaxBracket_EffectiveRange",
                table: "WithholdingTaxBrackets",
                sql: "`EffectiveTo` IS NULL OR `EffectiveTo` >= `EffectiveFrom`");

            migrationBuilder.AddCheckConstraint(
                name: "CK_SssContributionBracket_AmountRange",
                table: "SssContributionBrackets",
                sql: "`SalaryFrom` >= 0 AND `EmployeeShare` >= 0 AND `EmployerShare` >= 0 AND (`SalaryTo` IS NULL OR `SalaryTo` >= `SalaryFrom`)");

            migrationBuilder.AddCheckConstraint(
                name: "CK_SssContributionBracket_EffectiveRange",
                table: "SssContributionBrackets",
                sql: "`EffectiveTo` IS NULL OR `EffectiveTo` >= `EffectiveFrom`");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PhilHealthContributionRule_AmountRange",
                table: "PhilHealthContributionRules",
                sql: "`ContributionRate` >= 0 AND `MinimumContribution` >= 0 AND `MaximumContribution` >= `MinimumContribution` AND `EmployeeSharePercent` >= 0 AND `EmployeeSharePercent` <= 1 AND `EmployerSharePercent` >= 0 AND `EmployerSharePercent` <= 1");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PhilHealthContributionRule_EffectiveRange",
                table: "PhilHealthContributionRules",
                sql: "`EffectiveTo` IS NULL OR `EffectiveTo` >= `EffectiveFrom`");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PagIbigContributionRule_AmountRange",
                table: "PagIbigContributionRules",
                sql: "`EmployeeRate` >= 0 AND `EmployerRate` >= 0 AND `MinimumContribution` >= 0 AND `MaximumContribution` >= `MinimumContribution`");

            migrationBuilder.AddCheckConstraint(
                name: "CK_PagIbigContributionRule_EffectiveRange",
                table: "PagIbigContributionRules",
                sql: "`EffectiveTo` IS NULL OR `EffectiveTo` >= `EffectiveFrom`");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_WithholdingTaxBracket_AmountRange",
                table: "WithholdingTaxBrackets");

            migrationBuilder.DropCheckConstraint(
                name: "CK_WithholdingTaxBracket_EffectiveRange",
                table: "WithholdingTaxBrackets");

            migrationBuilder.DropCheckConstraint(
                name: "CK_SssContributionBracket_AmountRange",
                table: "SssContributionBrackets");

            migrationBuilder.DropCheckConstraint(
                name: "CK_SssContributionBracket_EffectiveRange",
                table: "SssContributionBrackets");

            migrationBuilder.DropCheckConstraint(
                name: "CK_PhilHealthContributionRule_AmountRange",
                table: "PhilHealthContributionRules");

            migrationBuilder.DropCheckConstraint(
                name: "CK_PhilHealthContributionRule_EffectiveRange",
                table: "PhilHealthContributionRules");

            migrationBuilder.DropCheckConstraint(
                name: "CK_PagIbigContributionRule_AmountRange",
                table: "PagIbigContributionRules");

            migrationBuilder.DropCheckConstraint(
                name: "CK_PagIbigContributionRule_EffectiveRange",
                table: "PagIbigContributionRules");
        }
    }
}
