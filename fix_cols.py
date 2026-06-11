f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Fix 1: Date column - remove line break (2026-06-\n01 issue) - set fixed width
content = content.replace(
    '<td className="text-xs font-semibold text-gray-700" style={{ width: "100px" }}>{s.date}</td>',
    '<td className="text-xs font-semibold text-gray-700" style={{ width: "90px", whiteSpace: "nowrap" }}>{s.date}</td>'
)

# Fix 2: Search icon - move to left inside input
content = content.replace(
    '''                  className="pro-input pl-9 text-sm"''',
    '''                  className="pro-input pl-8 text-sm"'''
)

# Fix 3: Adjust column widths to fit properly
content = content.replace(
    '<td style={{ width: "120px" }}>\n                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ar}`}>',
    '<td style={{ width: "100px" }}>\n                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ar}`}>'
)
content = content.replace(
    '<td className="text-center text-xs text-gray-600" style={{ width: "60px" }}>{s.tasks}</td>',
    '<td className="text-center text-xs text-gray-600" style={{ width: "50px" }}>{s.tasks}</td>'
)
content = content.replace(
    '<td className="text-center text-xs text-gray-600" style={{ width: "80px" }}>{s.checklist} / 6</td>',
    '<td className="text-center text-xs text-gray-600" style={{ width: "70px" }}>{s.checklist} / 6</td>'
)
content = content.replace(
    '<td className="text-xs text-gray-500" style={{ width: "100px" }}>{s.submittedAt}</td>',
    '<td className="text-xs text-gray-500" style={{ width: "90px", whiteSpace: "nowrap" }}>{s.submittedAt}</td>'
)
content = content.replace(
    '<td style={{ width: "160px" }}>\n                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>',
    '<td style={{ width: "150px", whiteSpace: "nowrap" }}>\n                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${st.bg} ${st.text}`}>'
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
