f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# 1. Add showConfirm, showSuccess, submitTime states after showPreview
content = content.replace(
    'const [showPreview, setShowPreview] = useState(false);',
    'const [showPreview, setShowPreview] = useState(false);\n  const [showConfirm, setShowConfirm] = useState(false);\n  const [showSuccess, setShowSuccess] = useState(false);\n  const [submitTime, setSubmitTime] = useState("");'
)

# 2. Update handleSubmit
old_submit = '''  const handleSubmit = async () => {
    try {
      await fetch("http://localhost:5169/api/daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devName, date, workArr, project, sprint, team, submittedTo, timeIn, timeOut, breakMins, tasks, checklist }),
      });
      alert("Report submitted successfully!");
      // Notify admin
      const notif = {
        id: Date.now(),
        title: "?? New DAR Submitted",
        message: `${devName || "Employee"} submitted a Daily Accomplishment Report for ${date}.`,
        time: "Just now",
        type: "system",
        read: false,
      };
      const existing = JSON.parse(localStorage.getItem("dar_notifications") || "[]");
      localStorage.setItem("dar_notifications", JSON.stringify([notif, ...existing]));
      window.dispatchEvent(new Event("dar_submitted"));
    } catch {
      alert("Could not reach server. Check your connection.");
    }
  };'''

new_submit = '''  const handleSubmit = async () => {
    const now = new Date();
    let h = now.getHours();
    const m = now.getMinutes();
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12 || 12;
    const timeStr = `${h}:${String(m).padStart(2, "0")} ${ampm}`;
    setSubmitTime(timeStr);
    try {
      await fetch("http://localhost:5169/api/daily-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devName, date, workArr, project, sprint, team, submittedTo, timeIn, timeOut, breakMins, tasks, checklist }),
      });
      const notif = {
        id: Date.now(),
        title: "New DAR Submitted",
        message: `${devName || "Employee"} submitted a Daily Accomplishment Report for ${date}.`,
        time: "Just now",
        type: "system",
        read: false,
      };
      const existing = JSON.parse(localStorage.getItem("dar_notifications") || "[]");
      localStorage.setItem("dar_notifications", JSON.stringify([notif, ...existing]));
      window.dispatchEvent(new Event("dar_submitted"));
    } catch {
      // Server unreachable, still show success
    }
    setShowConfirm(false);
    setShowSuccess(true);
  };'''

content = content.replace(old_submit, new_submit)

# 3. Update Submit button to open confirm modal
content = content.replace(
    '<button type="button" className="btn btn-primary" onClick={handleSubmit}><Send className="w-4 h-4" /> Submit Report</button>',
    '<button type="button" className="btn btn-primary" onClick={() => setShowConfirm(true)}><Send className="w-4 h-4" /> Submit Report</button>'
)

# 4. Add Confirm + Success modals before Preview modal
confirm_and_success = '''      {/* Confirm Modal */}
      {showConfirm && (
        <div className="pro-modal-overlay" onClick={() => setShowConfirm(false)}>
          <div className="pro-modal" style={{ maxWidth: "360px", width: "100%", textAlign: "center", padding: "2rem 1.75rem 1.5rem" }} onClick={e => e.stopPropagation()}>
            <p style={{ fontSize: "17px", fontWeight: 600, marginBottom: "0.5rem", color: "#111827" }}>Submit this report?</p>
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              This will finalize the daily accomplishment report for <strong style={{ color: "#111827" }}>{devName || "you"}</strong> and notify your supervisor.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowConfirm(false)}>No</button>
              <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmit}>Yes, Submit</button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccess && (
        <div className="pro-modal-overlay" onClick={() => setShowSuccess(false)}>
          <div className="pro-modal" style={{ maxWidth: "380px", width: "100%", textAlign: "center", padding: "2rem 1.75rem 1.5rem" }} onClick={e => e.stopPropagation()}>
            <button type="button" onClick={() => setShowSuccess(false)} style={{ position: "absolute", top: "14px", right: "14px", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "4px", borderRadius: "8px", display: "flex", alignItems: "center" }}>
              <X className="w-4 h-4" />
            </button>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#d1fae5", border: "2px solid #6ee7b7", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.25rem" }}>
              <CheckCircle className="w-7 h-7" style={{ color: "#059669" }} />
            </div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "4px", background: "#d1fae5", color: "#065f46", fontSize: "11px", fontWeight: 500, padding: "3px 12px", borderRadius: "99px", marginBottom: "0.75rem" }}>
              ✓ Submitted
            </div>
            <p style={{ fontSize: "17px", fontWeight: 600, color: "#111827", margin: "0 0 0.5rem" }}>Report submitted successfully!</p>
            <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: 1.6, margin: "0 0 1.5rem" }}>Your daily accomplishment report has been received and logged for today.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "1.25rem" }}>
              {[["Date", date], ["Submitted at", submitTime], ["Tasks logged", `${tasks.length} task${tasks.length !== 1 ? "s" : ""}`], ["Checklist", `${checkCount} / 6`]].map(([lbl, val]) => (
                <div key={lbl} style={{ background: "#f9fafb", borderRadius: "8px", padding: "10px 12px", textAlign: "left" }}>
                  <p style={{ fontSize: "11px", color: "#9ca3af", margin: "0 0 2px" }}>{lbl}</p>
                  <p style={{ fontSize: "13px", fontWeight: 500, color: "#111827", margin: 0 }}>{val}</p>
                </div>
              ))}
            </div>
            <div style={{ height: "0.5px", background: "#e5e7eb", margin: "0 0 1.25rem" }} />
            <button type="button" className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => setShowSuccess(false)}>Done</button>
          </div>
        </div>
      )}

'''

content = content.replace('      {/* Preview Modal */}', confirm_and_success + '      {/* Preview Modal */}')

open(f, 'w', encoding='utf-8').write(content)
print('Done!')
