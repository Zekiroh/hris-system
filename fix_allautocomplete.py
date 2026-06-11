f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

# Add reusable autocomplete hook after handleDevNameChange
content = content.replace(
    '  const selectEmployee = (name: string) => {',
    '''  const getFieldSuggestions = (field: string, val: string): string[] => {
    if (val.length < 1) return [];
    try {
      const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
      return Array.from(new Set(
        subs.map((s: any) => s[field]).filter((v: string) => v && v.toLowerCase().includes(val.toLowerCase()))
      )) as string[];
    } catch { return []; }
  };

  const selectEmployee = (name: string) => {'''
)

# Add states for each field suggestions
content = content.replace(
    'const [showSuggestions, setShowSuggestions] = React.useState(false);',
    '''const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [projectSug, setProjectSug] = React.useState<string[]>([]);
  const [showProjectSug, setShowProjectSug] = React.useState(false);
  const [sprintSug, setSprintSug] = React.useState<string[]>([]);
  const [showSprintSug, setShowSprintSug] = React.useState(false);
  const [teamSug, setTeamSug] = React.useState<string[]>([]);
  const [showTeamSug, setShowTeamSug] = React.useState(false);
  const [submittedToSug, setSubmittedToSug] = React.useState<string[]>([]);
  const [showSubmittedToSug, setShowSubmittedToSug] = React.useState(false);'''
)

# Replace Project input
content = content.replace(
    '''          <Field label="Project / System">
            <input className="pro-input" type="text" placeholder="e.g. SIMPLEVIA HRIS" value={project} onChange={e => setProject(e.target.value)} />
          </Field>''',
    '''          <Field label="Project / System">
            <div className="relative">
              <input className="pro-input" type="text" placeholder="e.g. SIMPLEVIA HRIS" value={project} autoComplete="off"
                onChange={e => { setProject(e.target.value); const s = getFieldSuggestions("project", e.target.value); setProjectSug(s); setShowProjectSug(s.length > 0); }}
                onBlur={() => setTimeout(() => setShowProjectSug(false), 150)} />
              {showProjectSug && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {projectSug.map(v => <button key={v} type="button" onMouseDown={() => { setProject(v); setShowProjectSug(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">{v}</button>)}
                </div>
              )}
            </div>
          </Field>'''
)

# Replace Sprint input
content = content.replace(
    '''          <Field label="Sprint / Iteration">
            <input className="pro-input" type="text" placeholder="e.g. Sprint 14" value={sprint} onChange={e => setSprint(e.target.value)} />
          </Field>''',
    '''          <Field label="Sprint / Iteration">
            <div className="relative">
              <input className="pro-input" type="text" placeholder="e.g. Sprint 14" value={sprint} autoComplete="off"
                onChange={e => { setSprint(e.target.value); const s = getFieldSuggestions("sprint", e.target.value); setSprintSug(s); setShowSprintSug(s.length > 0); }}
                onBlur={() => setTimeout(() => setShowSprintSug(false), 150)} />
              {showSprintSug && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {sprintSug.map(v => <button key={v} type="button" onMouseDown={() => { setSprint(v); setShowSprintSug(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">{v}</button>)}
                </div>
              )}
            </div>
          </Field>'''
)

# Replace Team input
content = content.replace(
    '''          <Field label="Team / Unit">
            <input className="pro-input" type="text" placeholder="e.g. Backend Team" value={team} onChange={e => setTeam(e.target.value)} />
          </Field>''',
    '''          <Field label="Team / Unit">
            <div className="relative">
              <input className="pro-input" type="text" placeholder="e.g. Backend Team" value={team} autoComplete="off"
                onChange={e => { setTeam(e.target.value); const s = getFieldSuggestions("team", e.target.value); setTeamSug(s); setShowTeamSug(s.length > 0); }}
                onBlur={() => setTimeout(() => setShowTeamSug(false), 150)} />
              {showTeamSug && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {teamSug.map(v => <button key={v} type="button" onMouseDown={() => { setTeam(v); setShowTeamSug(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">{v}</button>)}
                </div>
              )}
            </div>
          </Field>'''
)

# Replace Submitted To input
content = content.replace(
    '''          <Field label="Submitted To">
            <input className="pro-input" type="text" placeholder="Supervisor name" value={submittedTo} onChange={e => setSubmittedTo(e.target.value)} />
          </Field>''',
    '''          <Field label="Submitted To">
            <div className="relative">
              <input className="pro-input" type="text" placeholder="Supervisor name" value={submittedTo} autoComplete="off"
                onChange={e => { setSubmittedTo(e.target.value); const s = getFieldSuggestions("submittedTo", e.target.value); setSubmittedToSug(s); setShowSubmittedToSug(s.length > 0); }}
                onBlur={() => setTimeout(() => setShowSubmittedToSug(false), 150)} />
              {showSubmittedToSug && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {submittedToSug.map(v => <button key={v} type="button" onMouseDown={() => { setSubmittedTo(v); setShowSubmittedToSug(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors">{v}</button>)}
                </div>
              )}
            </div>
          </Field>'''
)

open(f, 'w', encoding='utf-8').write(content)
print('Done!')
