f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

content = content.replace(
    '''                            <td className="text-center" style={{ width: "40px" }}>
                              <button type="button" title="View" onClick={() => setSelectedSub(s)} className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg p-1.5 transition-all">
                                <Eye className="w-4 h-4" />
                              </button>
                            </td>''',
    '''                            <td className="text-center" style={{ width: "80px" }}>
                              <div className="flex items-center justify-center gap-1">
                                <button type="button" title="View" onClick={() => setSelectedSub(s)} className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg p-1.5 transition-all">
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button type="button" title="Delete" onClick={() => {
                                  if (!window.confirm("Delete this submission?")) return;
                                  try {
                                    const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
                                    subs.splice(idx, 1);
                                    localStorage.setItem("dar_submissions", JSON.stringify(subs));
                                    setSubmissions(subs);
                                  } catch {}
                                }} className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-all">
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </td>'''
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
