f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add delete confirm state after selectedSub
content = content.replace(
    'const [selectedSub, setSelectedSub] = React.useState<any>(null);',
    'const [selectedSub, setSelectedSub] = React.useState<any>(null);\n  const [deleteIdx, setDeleteIdx] = React.useState<number | null>(null);'
)

# Replace window.confirm with custom modal trigger
content = content.replace(
    '''onClick={() => {
                                  if (!window.confirm("Delete this submission?")) return;
                                  try {
                                    const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
                                    subs.splice(idx, 1);
                                    localStorage.setItem("dar_submissions", JSON.stringify(subs));
                                    setSubmissions(subs);
                                  } catch {}
                                }}''',
    'onClick={() => setDeleteIdx(idx)}'
)

# Add delete confirm modal before closing </div> of the component (before last SectionCard closing)
content = content.replace(
    '      {/* ── View Submission Modal */}',
    '''      {/* ── Delete Confirm Modal */}
      {deleteIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                <X className="w-6 h-6 text-rose-600" />
              </div>
              <h3 className="text-base font-bold text-gray-800">Delete Submission?</h3>
              <p className="text-sm text-gray-500">This action cannot be undone. The submission will be permanently removed.</p>
            </div>
            <div className="flex gap-3 mt-1">
              <button type="button" onClick={() => setDeleteIdx(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={() => {
                try {
                  const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
                  subs.splice(deleteIdx, 1);
                  localStorage.setItem("dar_submissions", JSON.stringify(subs));
                  setSubmissions(subs);
                } catch {}
                setDeleteIdx(null);
              }}
                className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Submission Modal */}'''
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
