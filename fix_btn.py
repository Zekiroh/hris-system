f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

old = '''                    <td style={{ width: "36px" }} className="text-center">
                      <button type="button" onClick={() => updateTask(task.id, "_expanded", !task._expanded)}
                        className="border border-gray-200 rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 transition-all flex items-center gap-1">
                        <span style={{ display: "inline-block", transform: task._expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                      </button>
                    </td>'''

new = '''                    <td style={{ width: "90px" }} className="text-center">
                      {(() => {
                        const filled = task.percentDone && task.actualHrs && task.output;
                        return (
                          <button type="button" onClick={() => updateTask(task.id, "_expanded", !task._expanded)}
                            className={`rounded px-2 py-1 text-xs transition-all flex items-center gap-1 border ${filled ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100"}`}>
                            <span>{filled ? "Details \u2713" : "Fill Details"}</span>
                            <span style={{ display: "inline-block", transform: task._expanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>▼</span>
                          </button>
                        );
                      })()}
                    </td>'''

content = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
