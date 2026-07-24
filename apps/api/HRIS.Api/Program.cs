using System.Text;
using HRIS.Api.Configuration;
using HRIS.Api.Data;
using HRIS.Api.Features.AnnouncementManagement.Services;
using HRIS.Api.Features.AssetManagement.Services;
using HRIS.Api.Features.Attendance.Services;
using HRIS.Api.Features.Attendance.Services.Validation;
using HRIS.Api.Features.ClearanceManagement.Services;
using HRIS.Api.Features.Dashboard.Services;
using HRIS.Api.Features.Employees.Services;
using HRIS.Api.Features.GovernmentCompliance.Services;
using HRIS.Api.Features.IAM.Services;
using HRIS.Api.Features.LeaveManagement.Services;
using HRIS.Api.Features.Payroll.Pdf;
using HRIS.Api.Features.Payroll.Services;
using HRIS.Api.Features.PerformanceManagement.Services;
using HRIS.Api.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using QuestPDF.Infrastructure;

QuestPDF.Settings.License = LicenseType.Community;

var builder = WebApplication.CreateBuilder(args);
var jwtOptions = JwtOptions.FromConfiguration(builder.Configuration);
var allowedCorsOrigins = CorsOptions.GetAllowedOrigins(builder.Configuration, builder.Environment);

// =====================
// Services
// =====================

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(o =>
{
    o.SwaggerDoc("v1", new() { Title = "HRIS API", Version = "v1" });

    o.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter: Bearer {your JWT token}"
    });

    o.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientCors", policy =>
    {
        policy
            .WithOrigins(allowedCorsOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("ConnectionStrings:Default is missing. Set it via user-secrets.");

var serverVersion = new MySqlServerVersion(new Version(8, 0, 45));
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion);
});

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IActivityLogger, ActivityLogger>();
builder.Services.AddScoped<IAdminUsersService, AdminUsersService>();

builder.Services.AddHttpContextAccessor();

builder.Services.AddScoped<EmployeesService>();

builder.Services.AddScoped<IShiftValidationService, ShiftValidationService>();
builder.Services.AddScoped<IShiftsService, ShiftsService>();
builder.Services.AddScoped<IShiftAssignmentsService, ShiftAssignmentsService>();
builder.Services.AddScoped<IAttendanceHolidayProvider, AttendanceHolidayProvider>();
builder.Services.AddScoped<IAttendanceLogsService, AttendanceLogsService>();
builder.Services.AddScoped<OvertimeRequestService>();

builder.Services.AddScoped<ILeaveBalanceInitializer, LeaveBalanceInitializer>();
builder.Services.AddScoped<ILeaveManagementService, LeaveManagementService>();

builder.Services.AddScoped<IEmployeeCompensationService, EmployeeCompensationService>();
builder.Services.AddScoped<IPayslipPdfGenerator, PayslipPdfGenerator>();
builder.Services.AddScoped<IPayrollService, PayrollService>();

builder.Services.AddScoped<IGovernmentComplianceService, GovernmentComplianceService>();

builder.Services.AddScoped<IAssetService, AssetService>();

builder.Services.AddScoped<IClearanceService, ClearanceService>();

builder.Services.AddScoped<IPerformanceEvaluationService, PerformanceEvaluationService>();

builder.Services.AddScoped<IAnnouncementService, AnnouncementService>();
// Daily Reports
builder.Services.AddScoped<IDailyReportsService, DailyReportsService>();

// =====================
// Dashboard Services
// =====================

builder.Services.AddScoped<IDashboardService, DashboardService>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtOptions.Key)),
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,
            RequireExpirationTime = true,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();

    var swaggerAssetsPath = Path.Combine(app.Environment.ContentRootPath, "SwaggerAssets");

    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = new PhysicalFileProvider(swaggerAssetsPath),
        RequestPath = "/swagger-assets"
    });

    app.UseSwaggerUI(options =>
    {
        options.InjectStylesheet("/swagger-assets/SwaggerDark.css");
    });
}

app.UseCors("ClientCors");

app.UseMiddleware<ExceptionMiddleware>();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => Results.Ok("HRIS API is running."));

app.Run();
