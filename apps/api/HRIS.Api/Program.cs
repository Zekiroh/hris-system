using HRIS.Api.Data;
using HRIS.Api.Features.IAM.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// =====================
// Services
// =====================

builder.Services.AddControllers();

// Swagger/OpenAPI + Bearer support
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
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

// CORS (tighten later)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ClientCors", policy =>
    {
        policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(_ => true);
    });
});

// Database
var connectionString = builder.Configuration.GetConnectionString("Default");
if (string.IsNullOrWhiteSpace(connectionString))
    throw new InvalidOperationException("ConnectionStrings:Default is missing. Set it via user-secrets.");

var serverVersion = new MySqlServerVersion(new Version(8, 0, 45));
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseMySql(connectionString, serverVersion);
});

// =====================
// IAM Services
// =====================

builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();
builder.Services.AddScoped<IActivityLogger, ActivityLogger>();

// JWT Auth (locked)
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
    throw new InvalidOperationException("Jwt:Key is missing. Set it via user-secrets.");

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false; // local dev
        options.SaveToken = true;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),

            ValidateIssuer = false,
            ValidateAudience = false,

            RequireExpirationTime = true,
            ValidateLifetime = true,

            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

// =====================
// Middleware
// =====================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// NOTE: Local dev runs on http://localhost:5169 (no https), so skip redirect.
// app.UseHttpsRedirection();

app.UseCors("ClientCors");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/", () => Results.Ok("HRIS API is running."));

app.Run();