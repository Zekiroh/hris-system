f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

old = '''                          <button type="button" onClick={() => updateTask(task.id, "_expanded", !task._expanded)}
                            className={`rounded px-2 py-1 text-xs transition-all flex items-center gap-1 border ${filled ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                            <span>{filled ? "Details \u2713" : "Fill Details"}</span>
                            <span style={{ display: "inline-block", transform: task._expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                          </button>'''

new = '''                          <button type="button" onClick={() => updateTask(task.id, "_expanded", !task._expanded)}
                            className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all flex items-center gap-1.5 border ${filled ? "border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700" : "border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                            <span>{filled ? "Details \u2713" : "Fill Details"}</span>
                            <span style={{ display: "inline-block", transform: task._expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                          </button>'''

content = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
