f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
lines = open(f, encoding='utf-8').readlines()

new_section = '''
      {/* My DAR Submissions */}
      <SectionCard num={9} title="My DAR Submissions" delay={0.9}>
        {(() => {
          const submissions: Array<{ date: string; project: string; tasks: number; checklist: number; status: string; submittedAt: string }> =
            JSON.parse(localStorage.getItem("dar_submissions") || "[]");
          const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
            "Approved":           { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
            "Pending Review":     { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-400"  },
            "Revision Requested": { bg: "bg-blue-50",    text: "text-blue-700",    dot: "bg-blue-500"   },
            "Rejected":           { bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-500"   },
          };
          if (submissions.length === 0) {
            return (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <p className="text-sm font-medium">No submissions yet</p>
                <p className="text-xs mt-1">Your submitted reports will appear here</p>
              </div>
            );
          }
          return (
            <div className="overflow-x-auto rounded-xl border border-gray-100">
              <table className="pro-table" style={{ width: "100%" }}>
                <thead>
                  <tr>
                    {["#", "Date", "Project", "Tasks", "Checklist", "Submitted At", "Status"].map(h => (
                      <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {submissions.map((s, i) => {
                    const st = statusStyle[s.status] || statusStyle["Pending Review"];
                    return (
                      <tr key={i}>
                        <td className="text-center text-gray-400 text-xs font-semibold">{i + 1}</td>
                        <td className="text-xs font-medium text-gray-700">{s.date}</td>
                        <td className="text-xs text-gray-600">{s.project || "—"}</td>
                        <td className="text-center text-xs">{s.tasks}</td>
                        <td className="text-center text-xs">{s.checklist} / 6</td>
                        <td className="text-xs text-gray-500">{s.submittedAt}</td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </SectionCard>

'''

# Insert before closing </div>
lines.insert(819, new_section)
open(f, 'w', encoding='utf-8').writelines(lines)
print('Done!')
