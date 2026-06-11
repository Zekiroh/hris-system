f = 'apps/web/src/pages/DAR/AdminDailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add page state after filterDept
content = content.replace(
    '  const [filterDept, setFilterDept]         = useState("All");',
    '  const [filterDept, setFilterDept]         = useState("All");\n  const [currentPage, setCurrentPage]       = useState(1);\n  const PAGE_SIZE = 10;'
)

# Add paginated slice after filtered
content = content.replace(
    '  const handleSaveReview = (updated: Partial<SubmittedReport>) => {',
    '''  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleSaveReview = (updated: Partial<SubmittedReport>) => {'''
)

# Reset page on filter/search change
content = content.replace(
    '  const departments = ["All", ...Array.from(new Set(reports.map(r => r.department)))];\n',
    '  const departments = ["All", ...Array.from(new Set(reports.map(r => r.department)))];\n\n  // Reset to page 1 on filter change\n  const handleSearch = (v: string) => { setSearch(v); setCurrentPage(1); };\n  const handleFilterStatus = (v: string) => { setFilterStatus(v); setCurrentPage(1); };\n  const handleFilterDept = (v: string) => { setFilterDept(v); setCurrentPage(1); };\n'
)

# Replace filtered.map with paginated.map in tbody
content = content.replace(
    '                ) : filtered.map(r => (',
    '                ) : paginated.map(r => ('
)

# Replace pagination section
content = content.replace(
    '''          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">
              Showing {filtered.length} of {total} submissions
            </span>
            <div className="flex gap-1">
              {[
                { label: <ChevronLeft className="w-4 h-4" />, active: false },
                { label: "1", active: true },
                { label: <ChevronRight className="w-4 h-4" />, active: false },
              ].map((b, i) => (
                <button
                  key={i}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors ${
                    b.active
                      ? "text-white border-transparent"
                      : "text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                  style={b.active ? { background: "linear-gradient(90deg,#059669,#047857)" } : {}}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>''',
    '''          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
            <span className="text-xs text-gray-400">
              Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length} submissions
            </span>
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors ${
                    p === currentPage
                      ? "text-white border-transparent"
                      : "text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100"
                  }`}
                  style={p === currentPage ? { background: "linear-gradient(90deg,#059669,#047857)" } : {}}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center transition-colors text-gray-600 border-gray-200 bg-gray-50 hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>'''
)

# Update search/filter onChange handlers
content = content.replace('onChange={e => setSearch(e.target.value)}', 'onChange={e => handleSearch(e.target.value)}')
content = content.replace(
    'onChange={e => setFilterStatus(e.target.value)}\n            >\n              <option value="All">All Status</option>',
    'onChange={e => handleFilterStatus(e.target.value)}\n            >\n              <option value="All">All Status</option>'
)
content = content.replace(
    'onChange={e => setFilterDept(e.target.value)}\n            >\n              {departments.map(d => <option key={d}>{d}</option>)}',
    'onChange={e => handleFilterDept(e.target.value)}\n            >\n              {departments.map(d => <option key={d}>{d}</option>)}'
)

open(f, 'w', encoding='utf-8').write(content)
print('Done!')
