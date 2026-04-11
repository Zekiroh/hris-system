using System.Text;
using HRIS.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace HRIS.Api.Features.IAM.Controllers;

[ApiController]
[Route("admin/activity-logs")]
[Authorize(Roles = "SUPER_ADMIN,ADMIN")]
public class AdminActivityLogsController : ControllerBase
{
    private readonly AppDbContext _db;

    public AdminActivityLogsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> List(
        [FromQuery] string? module,
        [FromQuery] string? action,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 20;

        var query = _db.ActivityLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(module))
            query = query.Where(a => a.Module == module);

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmedSearch = search.Trim().ToLower();

            query = query.Where(a =>
                (a.ActorEmail != null && a.ActorEmail.ToLower().Contains(trimmedSearch)) ||
                (a.Action != null && a.Action.ToLower().Contains(trimmedSearch)) ||
                (a.Summary != null && a.Summary.ToLower().Contains(trimmedSearch))
            );
        }

        var totalCount = await query.CountAsync();

        var logs = await query
            .OrderByDescending(a => a.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(a => new
            {
                id = a.Id,
                actorUserId = a.ActorUserId,
                actorEmail = a.ActorEmail,
                actorRole = a.ActorRole,
                action = a.Action,
                module = a.Module,
                targetType = a.TargetType,
                targetId = a.TargetId,
                summary = a.Summary,
                createdAt = a.CreatedAt
            })
            .ToListAsync();

        return Ok(new
        {
            page,
            pageSize,
            totalCount,
            data = logs
        });
    }

    [HttpGet("export")]
    public async Task<IActionResult> Export(
        [FromQuery] string? module,
        [FromQuery] string? action,
        [FromQuery] string? search)
    {
        var query = _db.ActivityLogs.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(module))
            query = query.Where(a => a.Module == module);

        if (!string.IsNullOrWhiteSpace(action))
            query = query.Where(a => a.Action == action);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var trimmedSearch = search.Trim().ToLower();

            query = query.Where(a =>
                (a.ActorEmail != null && a.ActorEmail.ToLower().Contains(trimmedSearch)) ||
                (a.Action != null && a.Action.ToLower().Contains(trimmedSearch)) ||
                (a.Summary != null && a.Summary.ToLower().Contains(trimmedSearch))
            );
        }

        var usersByEmail = await _db.Users
            .AsNoTracking()
            .Where(u => u.Email != null && u.Email != "")
            .Select(u => new
            {
                Email = u.Email,
                FullName = u.FullName
            })
            .ToDictionaryAsync(
                u => u.Email.ToLower(),
                u => u.FullName
            );

        var rows = await query
            .OrderByDescending(a => a.Id)
            .Take(5000)
            .Select(a => new
            {
                a.ActorUserId,
                a.ActorEmail,
                a.ActorRole,
                a.Action,
                a.Module,
                a.TargetType,
                a.TargetId,
                a.Summary,
                a.CreatedAt
            })
            .ToListAsync();

        static string Esc(string? s)
        {
            s ??= "";
            s = s.Replace("\"", "\"\"");
            return $"\"{s}\"";
        }

        static string FormatActionLabel(string action)
        {
            return action switch
            {
                "LOGIN" => "Logged in",
                "LOGIN_FAILED" => "Login Failed",
                "LOGOUT" => "Logged out",
                "USER_CREATE" => "Created User",
                "USER_UPDATE" => "Updated User",
                "USER_STATUS_UPDATE" => "Updated Status",
                "USER_PASSWORD_RESET" => "Reset Password",
                "PERMISSION_UPDATE" => "Updated Permission",
                "EMPLOYEE_CREATED" => "Created Employee",
                "EMPLOYEE_UPDATED" => "Updated Employee",
                "EMPLOYEE_STATUS_UPDATED" => "Updated Status",
                _ => string.Join(
                    " ",
                    action
                        .ToLower()
                        .Split('_', StringSplitOptions.RemoveEmptyEntries)
                        .Select(word => char.ToUpper(word[0]) + word[1..])
                )
            };
        }

        static string FormatRoleLabel(string? role)
        {
            if (string.IsNullOrWhiteSpace(role)) return "—";

            var normalized = role.Trim().ToUpperInvariant();

            return normalized switch
            {
                "SUPER_ADMIN" => "Super Admin",
                "ADMIN" => "Admin",
                "USER" => "User",
                _ => string.Join(
                    " ",
                    normalized
                        .ToLower()
                        .Split('_', StringSplitOptions.RemoveEmptyEntries)
                        .Select(word => char.ToUpper(word[0]) + word[1..])
                )
            };
        }

        string ResolveUserLabel(string? actorEmail, int actorUserId)
        {
            if (!string.IsNullOrWhiteSpace(actorEmail))
            {
                var normalizedEmail = actorEmail.Trim().ToLower();
                if (usersByEmail.TryGetValue(normalizedEmail, out var fullName) &&
                    !string.IsNullOrWhiteSpace(fullName))
                {
                    return fullName.Trim();
                }

                return actorEmail.Trim();
            }

            return $"User #{actorUserId}";
        }

        string PrettifyDetails(dynamic row)
        {
            var summary = (row.Summary as string)?.Trim();

            if (string.IsNullOrWhiteSpace(summary))
            {
                if (row.TargetType != null && row.TargetId != null)
                    return $"{row.TargetType} #{row.TargetId}";

                if (row.TargetType != null)
                    return row.TargetType.ToString() ?? "—";

                return "—";
            }

            var actorName = ResolveUserLabel(row.ActorEmail, row.ActorUserId);

            if (row.Action == "LOGIN")
                return $"{actorName} signed in successfully";

            if (row.Action == "LOGIN_FAILED")
            {
                var marker = "Failed login attempt for ";
                var index = summary.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

                if (index >= 0)
                {
                    var rawEmail = summary[(index + marker.Length)..].Trim();
                    if (!string.IsNullOrWhiteSpace(rawEmail))
                    {
                        var normalizedEmail = rawEmail.ToLower();
                        if (usersByEmail.TryGetValue(normalizedEmail, out var fullName) &&
                            !string.IsNullOrWhiteSpace(fullName))
                        {
                            return $"Failed login attempt for {fullName.Trim()}";
                        }

                        return $"Failed login attempt for {rawEmail}";
                    }
                }

                return "Failed login attempt";
            }

            if (row.Action == "LOGOUT")
                return $"{actorName} logged out";

            if (row.Action == "USER_PASSWORD_RESET")
            {
                var marker = "Reset password for user ";
                var index = summary.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

                if (index >= 0)
                {
                    var rawEmail = summary[(index + marker.Length)..].Trim();
                    if (!string.IsNullOrWhiteSpace(rawEmail))
                    {
                        var normalizedEmail = rawEmail.ToLower();
                        if (usersByEmail.TryGetValue(normalizedEmail, out var fullName) &&
                            !string.IsNullOrWhiteSpace(fullName))
                        {
                            return $"Password was reset for {fullName.Trim()}";
                        }

                        return $"Password was reset for {rawEmail}";
                    }
                }

                return "Password was reset";
            }

            if (row.Action == "USER_STATUS_UPDATE")
            {
                var setUserPrefix = "Set user ";
                var isActiveTrue = " IsActive=True";
                var isActiveFalse = " IsActive=False";

                var startIndex = summary.IndexOf(setUserPrefix, StringComparison.OrdinalIgnoreCase);
                if (startIndex >= 0)
                {
                    var afterPrefix = summary[(startIndex + setUserPrefix.Length)..];

                    if (afterPrefix.Contains(isActiveTrue, StringComparison.OrdinalIgnoreCase) ||
                        afterPrefix.Contains(isActiveFalse, StringComparison.OrdinalIgnoreCase))
                    {
                        var splitToken = afterPrefix.Contains(isActiveTrue, StringComparison.OrdinalIgnoreCase)
                            ? isActiveTrue
                            : isActiveFalse;

                        var emailPart = afterPrefix.Split(splitToken, StringSplitOptions.None)[0].Trim();
                        var normalizedEmail = emailPart.ToLower();
                        var resolvedName = usersByEmail.TryGetValue(normalizedEmail, out var fullName) &&
                                           !string.IsNullOrWhiteSpace(fullName)
                            ? fullName.Trim()
                            : emailPart;

                        var isActive = splitToken.Equals(isActiveTrue, StringComparison.OrdinalIgnoreCase);

                        return isActive
                            ? $"{resolvedName} was activated"
                            : $"{resolvedName} was deactivated";
                    }
                }

                return "User status was updated";
            }

            if (row.Action == "USER_UPDATE")
            {
                var marker = "Updated user ";
                var roleMarker = " (RoleId=";
                var startIndex = summary.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

                if (startIndex >= 0)
                {
                    var afterMarker = summary[(startIndex + marker.Length)..];
                    var roleIndex = afterMarker.IndexOf(roleMarker, StringComparison.OrdinalIgnoreCase);

                    if (roleIndex >= 0)
                    {
                        var emailPart = afterMarker[..roleIndex].Trim();
                        var normalizedEmail = emailPart.ToLower();
                        var resolvedName = usersByEmail.TryGetValue(normalizedEmail, out var fullName) &&
                                           !string.IsNullOrWhiteSpace(fullName)
                            ? fullName.Trim()
                            : emailPart;

                        return $"{resolvedName}'s account details were updated";
                    }
                }

                return "User account details were updated";
            }

            if (row.Action == "USER_CREATE")
            {
                var marker = "Created user ";
                var roleMarker = " (RoleId=";
                var startIndex = summary.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

                if (startIndex >= 0)
                {
                    var afterMarker = summary[(startIndex + marker.Length)..];
                    var roleIndex = afterMarker.IndexOf(roleMarker, StringComparison.OrdinalIgnoreCase);

                    if (roleIndex >= 0)
                    {
                        var emailPart = afterMarker[..roleIndex].Trim();
                        var normalizedEmail = emailPart.ToLower();
                        var resolvedName = usersByEmail.TryGetValue(normalizedEmail, out var fullName) &&
                                           !string.IsNullOrWhiteSpace(fullName)
                            ? fullName.Trim()
                            : emailPart;

                        return $"{resolvedName} account was created";
                    }
                }

                return "A new user account was created";
            }

            if (row.Action == "EMPLOYEE_CREATED")
            {
                var marker = "Created employee ";
                var startIndex = summary.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

                if (startIndex >= 0)
                {
                    var afterMarker = summary[(startIndex + marker.Length)..].Trim();

                    var openParenIndex = afterMarker.LastIndexOf('(');
                    var closeParenIndex = afterMarker.LastIndexOf(')');

                    if (openParenIndex > 0 && closeParenIndex > openParenIndex)
                    {
                        var employeeNumber = afterMarker[..openParenIndex].Trim();
                        var employeeName = afterMarker[(openParenIndex + 1)..closeParenIndex].Trim();

                        if (!string.IsNullOrWhiteSpace(employeeNumber) &&
                            !string.IsNullOrWhiteSpace(employeeName))
                        {
                            return $"{employeeName} was onboarded ({employeeNumber})";
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(afterMarker))
                    {
                        return $"Employee {afterMarker} was created";
                    }
                }

                return "A new employee record was created";
            }

            if (row.Action == "EMPLOYEE_UPDATED")
            {
                var marker = "Updated employee ";
                var startIndex = summary.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

                if (startIndex >= 0)
                {
                    var afterMarker = summary[(startIndex + marker.Length)..].Trim();

                    var openParenIndex = afterMarker.LastIndexOf('(');
                    var closeParenIndex = afterMarker.LastIndexOf(')');

                    if (openParenIndex > 0 && closeParenIndex > openParenIndex)
                    {
                        var employeeNumber = afterMarker[..openParenIndex].Trim();
                        var employeeName = afterMarker[(openParenIndex + 1)..closeParenIndex].Trim();

                        if (!string.IsNullOrWhiteSpace(employeeNumber) &&
                            !string.IsNullOrWhiteSpace(employeeName))
                        {
                            return $"Employee record for {employeeName} was updated ({employeeNumber})";
                        }
                    }

                    if (!string.IsNullOrWhiteSpace(afterMarker))
                    {
                        return $"Employee {afterMarker} was updated";
                    }
                }

                return "An employee record was updated";
            }

            if (row.Action == "EMPLOYEE_STATUS_UPDATED")
            {
                var marker = "Updated employee status ";
                var startIndex = summary.IndexOf(marker, StringComparison.OrdinalIgnoreCase);

                if (startIndex >= 0)
                {
                    var afterMarker = summary[(startIndex + marker.Length)..].Trim();
                    var arrowIndex = afterMarker.LastIndexOf("->", StringComparison.OrdinalIgnoreCase);

                    if (arrowIndex > 0)
                    {
                        var leftPart = afterMarker[..arrowIndex].Trim();
                        var statusPart = afterMarker[(arrowIndex + 2)..].Trim();

                        var openParenIndex = leftPart.LastIndexOf('(');
                        var closeParenIndex = leftPart.LastIndexOf(')');

                        if (openParenIndex > 0 && closeParenIndex > openParenIndex)
                        {
                            var employeeNumber = leftPart[..openParenIndex].Trim();
                            var employeeName = leftPart[(openParenIndex + 1)..closeParenIndex].Trim();

                            if (!string.IsNullOrWhiteSpace(employeeNumber) &&
                                !string.IsNullOrWhiteSpace(employeeName) &&
                                !string.IsNullOrWhiteSpace(statusPart))
                            {
                                return $"{employeeName} was marked {statusPart.ToLowerInvariant()} ({employeeNumber})";
                            }
                        }

                        if (!string.IsNullOrWhiteSpace(leftPart) && !string.IsNullOrWhiteSpace(statusPart))
                        {
                            return $"Employee {leftPart} was marked {statusPart.ToLowerInvariant()}";
                        }
                    }
                }

                return "Employee status was updated";
            }

            if (row.Action == "PERMISSION_UPDATE")
                return "Access permissions were updated";

            return summary
                .Replace("RoleId=", "", StringComparison.OrdinalIgnoreCase)
                .Replace("()", "", StringComparison.OrdinalIgnoreCase)
                .Trim();
        }

        var manilaTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Manila");

        var sb = new StringBuilder();
        sb.AppendLine("Date,Time,User,Role,Action,Details");

        foreach (var row in rows)
        {
            var manilaDateTime = TimeZoneInfo.ConvertTimeFromUtc(row.CreatedAt, manilaTimeZone);
            var userLabel = ResolveUserLabel(row.ActorEmail, row.ActorUserId);
            var roleLabel = FormatRoleLabel(row.ActorRole);
            var actionLabel = FormatActionLabel(row.Action);
            var details = PrettifyDetails(row);

            sb.Append(Esc(manilaDateTime.ToString("MMMM d, yyyy"))).Append(',');
            sb.Append(Esc(manilaDateTime.ToString("hh:mm tt"))).Append(',');
            sb.Append(Esc(userLabel)).Append(',');
            sb.Append(Esc(roleLabel)).Append(',');
            sb.Append(Esc(actionLabel)).Append(',');
            sb.Append(Esc(details));
            sb.AppendLine();
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv", "activity-logs.csv");
    }
}