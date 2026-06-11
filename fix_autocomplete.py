f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Fix 1: Move subSearch/subFilter states to top-level (after selectedSub)
content = content.replace(
    'const [selectedSub, setSelectedSub] = React.useState<any>(null);',
    'const [selectedSub, setSelectedSub] = React.useState<any>(null);\n  const [subSearch, setSubSearch] = React.useState("");\n  const [subFilter, setSubFilter] = React.useState("All Status");'
)

# Fix 2: Remove useState declarations inside IIFE
content = content.replace(
    '          const [subSearch, setSubSearch] = React.useState("");\n          const [subFilter, setSubFilter] = React.useState("All Status");\n',
    ''
)

# Fix 3: Add autocomplete states after subFilter
content = content.replace(
    'const [subFilter, setSubFilter] = React.useState("All Status");',
    'const [subFilter, setSubFilter] = React.useState("All Status");\n  const [empSuggestions, setEmpSuggestions] = React.useState<string[]>([]);\n  const [showSuggestions, setShowSuggestions] = React.useState(false);'
)

# Fix 4: Add mock employee list + search handler before handleSubmit
content = content.replace(
    '  const handleSubmit = async () => {',
    '''  const mockEmployees = [
    "John Lloyd Reyes", "Jose Santos", "Joanna Cruz", "Jonathan dela Cruz",
    "Maria Garcia", "Michael Torres", "Anna Lim", "Carlo Mendoza",
    "Diana Ramos", "Eric Villanueva", "Faith Aquino", "Gerald Sy",
  ];

  const handleDevNameChange = (val: string) => {
    setDevName(val);
    if (val.length >= 2) {
      const matches = mockEmployees.filter(e =>
        e.toLowerCase().includes(val.toLowerCase())
      );
      setEmpSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectEmployee = (name: string) => {
    setDevName(name);
    setShowSuggestions(false);
  };

  const handleSubmit = async () => {'''
)

# Fix 5: Replace devName input with autocomplete input
content = content.replace(
    '''          <Field label="Developer Name">
            <input className="pro-input" type="text" placeholder="Enter full name" value={devName} onChange={e => setDevName(e.target.value)} />
          </Field>''',
    '''          <Field label="Developer Name">
            <div className="relative">
              <input
                className="pro-input"
                type="text"
                placeholder="Enter full name"
                value={devName}
                onChange={e => handleDevNameChange(e.target.value)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onFocus={() => devName.length >= 2 && setShowSuggestions(empSuggestions.length > 0)}
                autoComplete="off"
              />
              {showSuggestions && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {empSuggestions.map(emp => (
                    <button
                      key={emp}
                      type="button"
                      onMouseDown={() => selectEmployee(emp)}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center gap-2"
                    >
                      <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {emp.charAt(0)}
                      </span>
                      {emp}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </Field>'''
)

open(f, 'w', encoding='utf-8').write(content)
print('Done!')
