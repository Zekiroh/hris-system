f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
lines = open(f, encoding='utf-8').readlines()
lines[259] = '    const sub = {\n'
lines[260] = '      date,\n'
lines[261] = '      project,\n'
lines[262] = '      tasks: tasks.length,\n'
lines[263] = '      checklist: checklist.filter(Boolean).length,\n'
lines[264] = '      status: "Pending Review",\n'
lines[265] = '      submittedAt: timeStr,\n'
lines[266] = '      workArr,\n'

# Insert full data after line 266
lines.insert(267, '      devName,\n')
lines.insert(268, '      sprint,\n')
lines.insert(269, '      team,\n')
lines.insert(270, '      submittedTo,\n')
lines.insert(271, '      timeIn,\n')
lines.insert(272, '      timeOut,\n')
lines.insert(273, '      breakMins,\n')
lines.insert(274, '      gross,\n')
lines.insert(275, '      net,\n')
lines.insert(276, '      standup,\n')
lines.insert(277, '      reachable,\n')
lines.insert(278, '      avgResponse,\n')
lines.insert(279, '      connIssues,\n')
lines.insert(280, '      collabLog,\n')
lines.insert(281, '      taskDetails: tasks,\n')
lines.insert(282, '      devHrs,\n')
lines.insert(283, '      meetingHrs,\n')
lines.insert(284, '      idleHrs,\n')
lines.insert(285, '      keyAccomp,\n')
lines.insert(286, '      blockers,\n')
lines.insert(287, '      risks,\n')
lines.insert(288, '      planTmr,\n')
lines.insert(289, '      escalation,\n')
lines.insert(290, '      checklistItems: checklist,\n')
lines.insert(291, '      tmrArr,\n')
lines.insert(292, '      leaveNotice,\n')
lines.insert(293, '      preparedBy,\n')
lines.insert(294, '      preparedSig,\n')
lines.insert(295, '      dateSubmitted,\n')

open(f, 'w', encoding='utf-8').writelines(lines)
print('Done!')
