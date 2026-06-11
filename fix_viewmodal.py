f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add selectedSub state after showSuccess
content = content.replace(
    'const [showSuccess, setShowSuccess] = useState(false);',
    'const [showSuccess, setShowSuccess] = useState(false);\n  const [selectedSub, setSelectedSub] = React.useState<any>(null);'
)

# Update eye button to set selectedSub
content = content.replace(
    '''<button type="button" title="View" className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg p-1.5 transition-all">
                                <Eye className="w-4 h-4" />
                              </button>''',
    '''<button type="button" title="View" onClick={() => setSelectedSub(s)} className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg p-1.5 transition-all">
                                <Eye className="w-4 h-4" />
                              </button>'''
)

# Add submission view modal before closing </div>
modal = '''
      {/* Submission View Modal */}
      {selectedSub && (
        <div className="pro-modal-overlay" onClick={() => setSelectedSub(null)}>
          <div className="pro-modal" style={{ maxWidth: "760px", width: "100%", maxHeight: "90vh", display: "flex", flexDirection: "column" }} onClick={e => e.stopPropagation()}>
            <div className="pro-modal-header">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <h3>DAR — {selectedSub.date}</h3>
              </div>
              <button onClick={() => setSelectedSub(null)} className="btn-ghost btn-icon">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="pro-modal-body overflow-y-auto" style={{ flex: 1 }}>

              {/* Header Banner */}
              <div className="rounded-xl p-5 mb-4 text-white" style={{ background: "linear-gradient(135deg, #064e3b 0%, #047857 100%)" }}>
                <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300 mb-1">SIMPLEVIA HRIS</p>
                <h2 className="text-lg font-bold">Daily Accomplishment Report</h2>
                <div className="flex flex-wrap gap-4 mt-2 text-xs text-emerald-100">
                  <span>{selectedSub.date}</span>
                  <span>{selectedSub.devName || "—"}</span>
                  <span>{selectedSub.workArr}</span>
                  <span>{selectedSub.project || "—"}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedSub.status === "Approved" ? "bg-emerald-500 text-white" :
                    selectedSub.status === "Rejected" ? "bg-rose-500 text-white" :
                    selectedSub.status === "Revision Requested" ? "bg-blue-500 text-white" :
                    "bg-amber-400 text-white"
                  }`}>{selectedSub.status}</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  ["Developer", selectedSub.devName],
                  ["Sprint", selectedSub.sprint],
                  ["Team", selectedSub.team],
                  ["Submitted To", selectedSub.submittedTo],
                  ["Time In", selectedSub.timeIn],
                  ["Time Out", selectedSub.timeOut],
                  ["Gross Hours", selectedSub.gross],
                  ["Net Hours", selectedSub.net],
                  ["Standup", selectedSub.standup],
                  ["Reachable", selectedSub.reachable],
                  ["Submitted At", selectedSub.submittedAt],
                  ["Work Arrangement", selectedSub.workArr],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-medium">{lbl}</p>
                    <p className="text-gray-800 font-semibold text-xs mt-0.5">{val || "—"}</p>
                  </div>
                ))}
              </div>

              {/* Tasks */}
              {selectedSub.taskDetails && selectedSub.taskDetails.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-2">Tasks & Activities</p>
                  <div className="overflow-x-auto rounded-xl border border-gray-100">
                    <table className="pro-table text-xs">
                      <thead>
                        <tr>{["#","Type","Ticket","Description","Module","Status","% Done","Est.","Actual","Output"].map(h => <th key={h}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {selectedSub.taskDetails.filter((t: any) => t.description || t.ticketRef || t.status).map((t: any) => (
                          <tr key={t.id}>
                            <td className="text-center text-gray-400">{t.id}</td>
                            <td>{t.taskType || "—"}</td>
                            <td className="font-mono">{t.ticketRef || "—"}</td>
                            <td>{t.description || "—"}</td>
                            <td>{t.module || "—"}</td>
                            <td>{t.status ? <span className={`badge ${statusBadge[t.status]}`}><span className="badge-dot"/>{statusLabel[t.status]}</span> : "—"}</td>
                            <td className="text-center">{t.percentDone ? t.percentDone+"%" : "—"}</td>
                            <td className="text-center">{t.estHrs || "—"}</td>
                            <td className="text-center">{t.actualHrs || "—"}</td>
                            <td>{t.output || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {[
                  ["Key Accomplishments", selectedSub.keyAccomp],
                  ["Blockers / Issues", selectedSub.blockers],
                  ["Risks / Early Warnings", selectedSub.risks],
                  ["Plan for Tomorrow", selectedSub.planTmr],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{lbl}</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{val || <span className="text-gray-300 italic">Not provided</span>}</p>
                  </div>
                ))}
              </div>

            </div>
            <div className="pro-modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setSelectedSub(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

'''

content = content.replace('      {/* Preview Modal */}', modal + '      {/* Preview Modal */}')
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
