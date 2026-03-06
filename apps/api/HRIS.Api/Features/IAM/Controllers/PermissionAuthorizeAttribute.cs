using HRIS.Api.Data;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace HRIS.Api.Features.IAM.Controllers;

public class PermissionAuthorizeAttribute : Attribute, IAsyncAuthorizationFilter
{
    private readonly string _module;
    private readonly string _action; // View/Create/Update/Archive

    public PermissionAuthorizeAttribute(string module, string action)
    {
        _module = module;
        _action = action;
    }

    public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
    {
        var http = context.HttpContext;

        if (http.User?.Identity?.IsAuthenticated != true)
        {
            context.Result = new Microsoft.AspNetCore.Mvc.UnauthorizedResult();
            return;
        }

        // NEW: read roleId from JWT instead of hardcoding role->id mapping
        var roleIdRaw = http.User.FindFirstValue("roleId");
        if (string.IsNullOrWhiteSpace(roleIdRaw) || !int.TryParse(roleIdRaw, out var roleId) || roleId <= 0)
        {
            context.Result = new Microsoft.AspNetCore.Mvc.ForbidResult();
            return;
        }

        var db = http.RequestServices.GetRequiredService<AppDbContext>();

        var p = await db.Permissions
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.RoleId == roleId && x.Module == _module);

        if (p is null)
        {
            context.Result = new Microsoft.AspNetCore.Mvc.ForbidResult();
            return;
        }

        var allowed = _action switch
        {
            "View" => p.CanView,
            "Create" => p.CanCreate,
            "Update" => p.CanUpdate,
            "Archive" => p.CanArchive,
            _ => false
        };

        if (!allowed)
            context.Result = new Microsoft.AspNetCore.Mvc.ForbidResult();
    }
}