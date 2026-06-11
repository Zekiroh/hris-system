f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()
content = content.replace(
    'setShowConfirm(false);\n    setShowSuccess(true);',
    '''setShowConfirm(false);
    setShowSuccess(true);

    // Reset all fields
    setDevName("");
    setDate(today);
    setWorkArr("On-site");
    setProject("");
    setSprint("");
    setTeam("");
    setSubmittedTo("");
    setTimeIn("08:00");
    setTimeOut("17:00");
    setBreakMins(60);
    setSubTime("");
    setStandup("Yes");
    setReachable("Yes");
    setAvgResponse("");
    setConnIssues("");
    setCollabLog("");
    setTasks([createEmptyTask(1)]);
    setDevHrs("");
    setMeetingHrs("");
    setIdleHrs("");
    setKeyAccomp("");
    setBlockers("");
    setRisks("");
    setPlanTmr("");
    setEscalation("");
    setChecklist(Array(6).fill(false));
    setTmrArr("On-site");
    setTmrTimeIn("08:00");
    setLeaveNotice("");
    setPreparedBy("");
    setPreparedSig("");
    setDateSubmitted(today);'''
)
open(f, 'w', encoding='utf-8').write(content)
print('Done!')
