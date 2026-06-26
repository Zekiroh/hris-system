using HRIS.Api.Features.Payroll.DTOs;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HRIS.Api.Features.Payroll.Pdf;

public class PayslipPdfGenerator : IPayslipPdfGenerator
{
    public byte[] Generate(PayrollRecordDto payslip)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(32);
                page.DefaultTextStyle(text => text.FontSize(10));

                page.Header().Element(header => ComposeHeader(header, payslip));

                page.Content().PaddingTop(20).Column(column =>
                {
                    column.Spacing(16);

                    column.Item().Element(content => ComposeEmployeeDetails(content, payslip));
                    column.Item().Element(content => ComposePayrollSummary(content, payslip));
                    column.Item().Element(content => ComposeItems(content, "Earnings", payslip.Items.Where(item => item.Type == "Earning").ToList()));
                    column.Item().Element(content => ComposeItems(content, "Deductions", payslip.Items.Where(item => item.Type == "Deduction").ToList()));
                    column.Item().Element(content => ComposeNetPay(content, payslip));
                });

                page.Footer()
                    .AlignCenter()
                    .Text(text =>
                    {
                        text.Span("Generated on ");
                        text.Span(DateTime.UtcNow.ToString("yyyy-MM-dd HH:mm"));
                        text.Span(" UTC");
                    });
            });
        }).GeneratePdf();
    }

    private static void ComposeHeader(IContainer container, PayrollRecordDto payslip)
    {
        container
            .Background(Colors.Green.Darken2)
            .Padding(18)
            .Column(column =>
            {
                column.Item().AlignCenter().Text("SIMPLEVIA Technologies, Inc.")
                    .FontSize(18)
                    .Bold()
                    .FontColor(Colors.White);

                column.Item().AlignCenter().Text("Employee Payslip")
                    .FontSize(11)
                    .FontColor(Colors.White);
            });
    }

    private static void ComposeEmployeeDetails(IContainer container, PayrollRecordDto payslip)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn();
                columns.RelativeColumn();
            });

            table.Cell().Element(DetailCell).Column(column =>
            {
                column.Item().Text("Employee").FontColor(Colors.Grey.Darken1);
                column.Item().Text(payslip.EmployeeName).Bold();
            });

            table.Cell().Element(DetailCell).Column(column =>
            {
                column.Item().Text("Employee ID").FontColor(Colors.Grey.Darken1);
                column.Item().Text(payslip.EmployeeNumber).Bold();
            });

            table.Cell().Element(DetailCell).Column(column =>
            {
                column.Item().Text("Department").FontColor(Colors.Grey.Darken1);
                column.Item().Text(string.IsNullOrWhiteSpace(payslip.Department) ? "-" : payslip.Department).Bold();
            });

            table.Cell().Element(DetailCell).Column(column =>
            {
                column.Item().Text("Position").FontColor(Colors.Grey.Darken1);
                column.Item().Text(string.IsNullOrWhiteSpace(payslip.Position) ? "-" : payslip.Position).Bold();
            });

            table.Cell().Element(DetailCell).Column(column =>
            {
                column.Item().Text("Pay Period").FontColor(Colors.Grey.Darken1);
                column.Item().Text($"{FormatDate(payslip.PayrollPeriodStartDate)} - {FormatDate(payslip.PayrollPeriodEndDate)}").Bold();
            });

            table.Cell().Element(DetailCell).Column(column =>
            {
                column.Item().Text("Release Date").FontColor(Colors.Grey.Darken1);
                column.Item().Text(payslip.ReleasedAtUtc.HasValue ? payslip.ReleasedAtUtc.Value.ToString("MMM dd, yyyy") : "Not released").Bold();
            });
        });
    }

    private static void ComposePayrollSummary(IContainer container, PayrollRecordDto payslip)
    {
        container.Table(table =>
        {
            table.ColumnsDefinition(columns =>
            {
                columns.RelativeColumn();
                columns.RelativeColumn();
                columns.RelativeColumn();
            });

            table.Cell().Element(SummaryCell).Column(column =>
            {
                column.Item().Text("Gross Pay").FontColor(Colors.Grey.Darken1);
                column.Item().Text(FormatMoney(payslip.GrossPay)).FontSize(14).Bold();
            });

            table.Cell().Element(SummaryCell).Column(column =>
            {
                column.Item().Text("Total Deductions").FontColor(Colors.Grey.Darken1);
                column.Item().Text(FormatMoney(payslip.TotalDeductions)).FontSize(14).Bold().FontColor(Colors.Red.Darken1);
            });

            table.Cell().Element(SummaryCell).Column(column =>
            {
                column.Item().Text("Net Pay").FontColor(Colors.Grey.Darken1);
                column.Item().Text(FormatMoney(payslip.NetPay)).FontSize(14).Bold().FontColor(Colors.Green.Darken2);
            });
        });
    }

    private static void ComposeItems(IContainer container, string title, IReadOnlyCollection<PayrollRecordItemDto> items)
    {
        container.Column(column =>
        {
            column.Spacing(6);

            column.Item().Text(title).FontSize(12).Bold();

            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn();
                });

                table.Header(header =>
                {
                    header.Cell().Element(TableHeader).Text("Description");
                    header.Cell().Element(TableHeader).AlignRight().Text("Amount");
                });

                if (items.Count == 0)
                {
                    table.Cell().ColumnSpan(2).Element(TableCell).Text("No records.");
                    return;
                }

                foreach (var item in items)
                {
                    table.Cell().Element(TableCell).Text(item.Description);
                    table.Cell().Element(TableCell).AlignRight().Text(FormatMoney(item.Amount));
                }
            });
        });
    }

    private static void ComposeNetPay(IContainer container, PayrollRecordDto payslip)
    {
        container
            .Background(Colors.Green.Darken2)
            .Padding(14)
            .Row(row =>
            {
                row.RelativeItem().Text("NET TAKE HOME PAY").Bold().FontColor(Colors.White);
                row.ConstantItem(180).AlignRight().Text(FormatMoney(payslip.NetPay)).FontSize(18).Bold().FontColor(Colors.White);
            });
    }

    private static IContainer DetailCell(IContainer container)
    {
        return container.PaddingVertical(8).PaddingHorizontal(6);
    }

    private static IContainer SummaryCell(IContainer container)
    {
        return container
            .Border(1)
            .BorderColor(Colors.Grey.Lighten2)
            .Padding(12);
    }

    private static IContainer TableHeader(IContainer container)
    {
        return container
            .Background(Colors.Green.Darken2)
            .Padding(8)
            .DefaultTextStyle(text => text.Bold().FontColor(Colors.White));
    }

    private static IContainer TableCell(IContainer container)
    {
        return container
            .BorderBottom(1)
            .BorderColor(Colors.Grey.Lighten3)
            .Padding(8);
    }

    private static string FormatMoney(decimal amount)
    {
        return $"PHP {amount:N2}";
    }

    private static string FormatDate(DateOnly date)
    {
        return date.ToString("MMM dd, yyyy");
    }
}