using System;
using System.IO;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace HRIS.Api.Data
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var config = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: true)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddUserSecrets<Program>(optional: true)
                .AddEnvironmentVariables()
                .Build();

            var cs = config.GetConnectionString("Default");

            if (string.IsNullOrWhiteSpace(cs))
                throw new InvalidOperationException("ConnectionStrings:Default is missing.");

            // Ensure the connection string contains a Database=... or Initial Catalog=... entry
            if (!cs.Split(';', StringSplitOptions.RemoveEmptyEntries)
                   .Any(p => p.TrimStart().StartsWith("Database=", StringComparison.OrdinalIgnoreCase) ||
                             p.TrimStart().StartsWith("Initial Catalog=", StringComparison.OrdinalIgnoreCase)))
            {
                throw new InvalidOperationException($"Connection string is missing Database=... Value: {Mask(cs)}");
            }

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            var serverVersion = ServerVersion.Parse("8.0.45-mysql");

            optionsBuilder.UseMySql(cs, serverVersion);

            return new AppDbContext(optionsBuilder.Options);
        }

        private static string Mask(string cs)
        {
            var parts = cs.Split(';', StringSplitOptions.RemoveEmptyEntries)
                          .Select(p => p.Trim())
                          .Select(p => p.StartsWith("Password=", StringComparison.OrdinalIgnoreCase)
                                       ? "Password=***"
                                       : p);

            return string.Join(';', parts) + ";";
        }
    }
}