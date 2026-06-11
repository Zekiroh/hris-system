f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add delete modal before the Submission View Modal
content = content.replace(
    '      {/* Submission View Modal */}',
    '''      {/* Delete Confirm Modal */}
      {deleteIdx !== null && (
        <div className="pro-modal-overlay" onClick={() => setDeleteIdx(null)}>
          <div className="pro-modal" style={{ maxWidth: "360px", width: "100%", textAlign: "center", padding: "2rem 1.75rem 1.5rem" }} onClick={e => e.stopPropagation()}>
            <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
              <X className="w-6 h-6" style={{ color: "#dc2626" }} />
            </div>
            <p style={{ fontSize: "17px", fontWeight: 600, marginBottom: "0.5rem", color: "#111827" }}>Delete Submission?</p>
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginBottom: "1.5rem" }}>This action cannot be undone. The submission will be permanently removed.</p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setDeleteIdx(null)}>Cancel</button>
              <button type="button" style={{ flex: 1, background: "#dc2626", color: "white", border: "none", borderRadius: "12px", padding: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }} onClick={() => {
                try {
                  const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
                  subs.splice(deleteIdx, 1);
                  localStorage.setItem("dar_submissions", JSON.stringify(subs));
                  setSubmissions(subs);
                } catch {}
                setDeleteIdx(null);
              }}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Submission View Modal */}'''
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
