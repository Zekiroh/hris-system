// patch-time-picker2.js
// Ginagawang time picker (type="time") ang Time In / Time Out — REGEX based,
// kaya tumutugma kahit anong indentation/line breaks.

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

let changed = 0;
function fixTime(name, stateVar) {
  // Tugma sa <input ... type="text" ... value={timeIn|timeOut} ... onChange=...setX... />
  // tanggalin ang placeholder, palitan ang type="text" -> type="time"
  const re = new RegExp(
    '<input\\s+className="pro-input"\\s+type="text"\\s+placeholder="[^"]*"\\s+value=\\{' + stateVar + '\\}\\s+onChange=\\{e => set' +
    stateVar.charAt(0).toUpperCase() + stateVar.slice(1) +
    '\\(e\\.target\\.value\\)\\}\\s*/>',
    'm'
  );
  if (new RegExp('type="time"\\s+value=\\{' + stateVar + '\\}').test(src)) { console.log("•  Naka-set na: " + name); return; }
  if (!re.test(src)) { console.warn("⚠️  Hindi nahanap (regex): " + name); return; }
  src = src.replace(re,
    '<input className="pro-input" type="time" value={' + stateVar + '} onChange={e => set' +
    stateVar.charAt(0).toUpperCase() + stateVar.slice(1) + '(e.target.value)} />'
  );
  changed++;
  console.log("✓  " + name);
}

fixTime("Time In -> time picker", "timeIn");
fixTime("Time Out -> time picker", "timeOut");

if (changed === 0) { console.log("\nℹ️  Walang binago."); process.exit(0); }

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
