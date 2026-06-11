f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

content = content.replace(
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
  };''',
    '''  const handleDevNameChange = (val: string) => {
    setDevName(val);
    if (val.length >= 2) {
      try {
        const subs = JSON.parse(localStorage.getItem("dar_submissions") || "[]");
        const names: string[] = Array.from(
          new Set(
            subs
              .map((s: any) => s.devName)
              .filter((n: string) => n && n.toLowerCase().includes(val.toLowerCase()))
          )
        );
        setEmpSuggestions(names);
        setShowSuggestions(names.length > 0);
      } catch {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };'''
)

open(f, 'w', encoding='utf-8').write(content)
print('Done!')
