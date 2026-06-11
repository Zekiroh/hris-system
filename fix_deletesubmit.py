f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

content = content.replace(
    '''                  subs.splice(deleteIdx, 1);
                  localStorage.setItem("dar_submissions", JSON.stringify(subs));
                  setSubmissions(subs);''',
    '''                  subs.splice(deleteIdx, 1);
                  localStorage.setItem("dar_submissions", JSON.stringify(subs));
                  setSubSearch(v => v);'''
)

open(f, 'w', encoding='utf-8').write(content)
print("Done!")
