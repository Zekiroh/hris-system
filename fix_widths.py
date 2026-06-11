f = 'apps/web/src/pages/DailyReport/DailyAccomplishmentReport.tsx'
content = open(f, encoding='utf-8').read()

content = content.replace('width: "100px" }}>\n                      <select className="pro-select text-xs py-1 w-full" value={task.priority}', 'width: "110px" }}>\n                      <select className="pro-select text-xs py-1 w-full" value={task.priority}')
content = content.replace('width: "130px" }}>\n                    <select className="pro-select text-xs py-1 w-full" value={task.taskType}', 'width: "150px" }}>\n                    <select className="pro-select text-xs py-1 w-full" value={task.taskType}')
content = content.replace('width: "120px" }}>\n                    <select className="pro-select text-xs py-1 w-full" value={task.status}', 'width: "140px" }}>\n                    <select className="pro-select text-xs py-1 w-full" value={task.status}')
content = content.replace('minWidth: "860px"', 'minWidth: "950px"')

open(f, 'w', encoding='utf-8').write(content)
print('Done!')
