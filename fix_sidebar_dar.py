f = 'apps/web/src/components/layout/Sidebar.tsx'
content = open(f, encoding='utf-8').read()

# Add to admin nav (after Attendance Log)
content = content.replace(
    '{ icon: Clock, label: "Attendance Log", path: "/dashboard/attendance" },',
    '{ icon: Clock, label: "Attendance Log", path: "/dashboard/attendance" },\n    { icon: FileText, label: "Daily Accomplishment", path: "/dashboard/daily-accomplishment-admin" },'
)

# Add to user nav (after Attendance Log)
content = content.replace(
    '{ icon: Clock, label: "Attendance Log", path: "/dashboard/my-attendance" },',
    '{ icon: Clock, label: "Attendance Log", path: "/dashboard/my-attendance" },\n    { icon: FileText, label: "Daily Accomplishment", path: "/dashboard/daily-accomplishment" },'
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
