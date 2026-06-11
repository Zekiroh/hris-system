f = 'apps/web/src/pages/DAR/AdminDailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Fix 1: Next button validation
content = content.replace(
    '''          onClick={() => setActiveTab("s8")}
              className="btn btn-primary"
            >
              Next → Section 8''',
    '''          onClick={() => {
                if (!rating || rating === 0) {
                  toast.error("Please provide a performance rating first.");
                  return;
                }
                if (!decision || decision === "Pending Review") {
                  toast.error("Please select a Review Decision (not Pending Review).");
                  return;
                }
                if (!supervisorName.trim()) {
                  toast.error("Please enter the Supervisor Name.");
                  return;
                }
                setActiveTab("s8");
              }}
              className="btn btn-primary"
            >
              Next → Section 8'''
)

# Fix 2: Save button validation - add signoff check
content = content.replace(
    '''  const handleSave = () => {
    if (!rating || rating === 0) {
      toast.error("Please provide a performance rating before saving.");
      return;
    }
    if (!decision || decision === "Pending Review") {
      toast.error("Please select a Review Decision (Approved, Revision Requested, or Rejected).");
      return;
    }
    if (!supervisorName.trim()) {
      toast.error("Please enter the Supervisor Name before saving.");
      return;
    }
    setConfirmOpen(true);
  };''',
    '''  const handleSave = () => {
    if (!rating || rating === 0) {
      toast.error("Please provide a performance rating before saving.");
      return;
    }
    if (!decision || decision === "Pending Review") {
      toast.error("Please select a Review Decision (Approved, Revision Requested, or Rejected).");
      return;
    }
    if (!supervisorName.trim()) {
      toast.error("Please enter the Supervisor Name before saving.");
      return;
    }
    if (!empAck) {
      toast.error("Employee acknowledgment is required before finalizing.");
      return;
    }
    if (!adminAck) {
      toast.error("Supervisor sign-off is required before finalizing.");
      return;
    }
    setConfirmOpen(true);
  };'''
)

open(f, 'w', encoding='utf-8').write(content)
print('Done!')
