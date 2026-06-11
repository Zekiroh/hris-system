f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

old = '''      {/* My DAR Submissions */}
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
      </SectionCard>'''

new = '''      {/* My DAR Submissions */}
      <SectionCard num={9} title="My DAR Submissions" delay={0.9}>
        {(() => {
          const [subSearch, setSubSearch] = React.useState("");
          const [subFilter, setSubFilter] = React.useState("All Status");
          const submissions: Array<{ date: string; project: string; tasks: number; checklist: number; status: string; submittedAt: string; workArr?: string }> =
            JSON.parse(localStorage.getItem("dar_submissions") || "[]");

          const statusStyle: Record<string, { bg: string; text: string; dot: string }> = {
            "Approved":           { bg: "bg-emerald-50 border border-emerald-200", text: "text-emerald-700", dot: "bg-emerald-500" },
            "Pending Review":     { bg: "bg-amber-50 border border-amber-200",     text: "text-amber-700",   dot: "bg-amber-400"  },
            "Revision Requested": { bg: "bg-blue-50 border border-blue-200",       text: "text-blue-700",    dot: "bg-blue-500"   },
            "Rejected":           { bg: "bg-rose-50 border border-rose-200",       text: "text-rose-700",    dot: "bg-rose-500"   },
          };

          const arrStyle: Record<string, string> = {
            "On-site": "bg-emerald-50 text-emerald-700 border border-emerald-200",
            "Remote":  "bg-blue-50 text-blue-700 border border-blue-200",
            "Hybrid":  "bg-amber-50 text-amber-700 border border-amber-200",
          };

          const filtered = submissions.filter(s => {
            const matchSearch = s.date.includes(subSearch) || (s.project || "").toLowerCase().includes(subSearch.toLowerCase());
            const matchFilter = subFilter === "All Status" || s.status === subFilter;
            return matchSearch && matchFilter;
          });

          return (
            <div>
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <input
                    className="pro-input pl-9 text-sm"
                    placeholder="Search by date or project..."
                    value={subSearch}
                    onChange={e => setSubSearch(e.target.value)}
                  />
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"/></svg>
                </div>
                <select className="pro-select text-sm" value={subFilter} onChange={e => setSubFilter(e.target.value)} style={{ width: "160px" }}>
                  {["All Status","Approved","Pending Review","Revision Requested","Rejected"].map(s => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <FileText className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-sm font-medium text-gray-500">No submissions yet</p>
                  <p className="text-xs mt-1 text-gray-400">Your submitted reports will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="pro-table" style={{ width: "100%" }}>
                    <thead>
                      <tr>
                        {["#","Date","Project","Arrangement","Tasks","Checklist","Submitted At","Status",""].map(h => (
                          <th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((s, i) => {
                        const st = statusStyle[s.status] || statusStyle["Pending Review"];
                        const ar = arrStyle[s.workArr || "On-site"] || arrStyle["On-site"];
                        return (
                          <tr key={i} className="hover:bg-gray-50 transition-colors">
                            <td className="text-center text-gray-400 text-xs font-semibold" style={{ width: "36px" }}>{i + 1}</td>
                            <td className="text-xs font-semibold text-gray-700" style={{ width: "100px" }}>{s.date}</td>
                            <td className="text-xs text-gray-600" style={{ minWidth: "120px" }}>{s.project || "—"}</td>
                            <td style={{ width: "120px" }}>
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ar}`}>
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                                {s.workArr || "On-site"}
                              </span>
                            </td>
                            <td className="text-center text-xs text-gray-600" style={{ width: "60px" }}>{s.tasks}</td>
                            <td className="text-center text-xs text-gray-600" style={{ width: "80px" }}>{s.checklist} / 6</td>
                            <td className="text-xs text-gray-500" style={{ width: "100px" }}>{s.submittedAt}</td>
                            <td style={{ width: "160px" }}>
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                                {s.status}
                              </span>
                            </td>
                            <td className="text-center" style={{ width: "40px" }}>
                              <button type="button" title="View" className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg p-1.5 transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="px-4 py-2 border-t border-gray-100 text-xs text-gray-400">
                    Showing {filtered.length} of {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>
          );
        })()}
      </SectionCard>'''

content = content.replace(old, new)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
