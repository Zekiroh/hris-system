using HRIS.Api.Data;
using Microsoft.EntityFrameworkCore;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// =====================
// Services
// =====================

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Database
var connectionString = builder.Configuration.GetConnectionString("Default");
// Hard fail if connection string is missing
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("ConnectionStrings:Default is missing. Set it via user-secrets.");


var serverVersion = new MySqlServerVersion(new Version(8, 0, 45));

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion);
});

var app = builder.Build();

// =====================
// Middleware
// =====================

// Enable Swagger in development environment
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// =====================
// Test Endpoints
// =====================

app.MapGet("/", () => Results.Ok("HRIS API is running."));

app.Run();