f = 'apps/web/src/pages/DAR/AdminDailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

content = content.replace(
    '  const handleSave = () => setConfirmOpen(true); // ← ito nalang',
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
  };'''
)

open(f, 'w', encoding='utf-8').write(content)
print('Done!')
