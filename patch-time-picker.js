// patch-time-picker.js
// Ginagawang time picker (type="time") ang Time In / Time Out sa Section 1
// ng employee DailyAccomplishmentReport.tsx (dating type="text").

const fs = require("fs");
const path = require("path");

function findFile(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { const f = findFile(full); if (f) return f; }
    else if (/\.(tsx|jsx)$/.test(e.name)) {
      try { if (fs.readFileSync(full, "utf8").includes("My DAR Submissions")) return full; } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findFile(process.cwd());
if (!target || !fs.existsSync(target)) { console.error("❌ Hindi mahanap ang employee DAR file."); process.exit(1); }

let src = fs.readFileSync(target, "utf8");
const original = src;

let hardFail = false;
function step(name, find, repl) {
  if (src.includes(repl)) { console.log("•  Naka-set na: " + name); return; }
  if (!src.includes(find)) { console.error("⚠️  Hindi nahanap: " + name); hardFail = true; return; }
  src = src.replace(find, repl);
  console.log("✓  " + name);
}

// Time In: type="text" -> type="time"
step("Time In -> time picker",
  '<input\n              className="pro-input"\n              type="text"\n              placeholder="e.g. 08:00 AM"\n              value={timeIn}\n              onChange={e => setTimeIn(e.target.value)}\n            />',
  '<input\n              className="pro-input"\n              type="time"\n              value={timeIn}\n              onChange={e => setTimeIn(e.target.value)}\n            />'
);

// Time Out: type="text" -> type="time"
step("Time Out -> time picker",
  '<input\n              className="pro-input"\n              type="text"\n              placeholder="e.g. 05:00 PM"\n              value={timeOut}\n              onChange={e => setTimeOut(e.target.value)}\n            />',
  '<input\n              className="pro-input"\n              type="time"\n              value={timeOut}\n              onChange={e => setTimeOut(e.target.value)}\n            />'
);

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  console.error("    Baka iba ang formatting. I-paste mo ang Time In/Out block para i-adjust ko.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
