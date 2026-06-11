// patch-logo-dashboard2.js
// REGEX-based: ginagawang clickable ang logo + SIMPLEVIA -> /dashboard.
// Tumutugma kahit anong indentation/line breaks.

const fs = require("fs");
const path = require("path");

function findFile(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { const f = findFile(full); if (f) return f; }
    else if (/Sidebar\.(tsx|jsx)$/.test(e.name)) {
      try { if (fs.readFileSync(full, "utf8").includes("SIMPLEVIA")) return full; } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findFile(process.cwd());
if (!target || !fs.existsSync(target)) { console.error("❌ Hindi mahanap ang Sidebar.tsx na may 'SIMPLEVIA'."); process.exit(1); }

let src = fs.readFileSync(target, "utf8");
const original = src;

if (/to="\/dashboard"[\s\S]{0,120}SimpleVia Logo/.test(src) || src.includes('title="Balik sa Dashboard"')) {
  console.log("ℹ️  Clickable na ang logo. Walang ginawa.");
  process.exit(0);
}

// Hanapin ang logo <img> div, ang optional SIMPLEVIA text block, hanggang BAGO ang close (X) button.
// Group 1 = logo img div block ; Group 2 = SIMPLEVIA text block (optional, naka-{!collapsed && (...)})
const re = /(<div className="w-10 h-10 rounded-xl bg-white\/10 p-1\.5 flex-shrink-0">\s*<img src=\{logo\}[^>]*\/>\s*<\/div>)([\s\S]*?HRIS System[\s\S]*?\)\})/;

const m = src.match(re);
if (!m) {
  console.error("⚠️  Hindi nahanap ang logo/SIMPLEVIA block (regex). HINDI sinulat.");
  console.error("    I-paste mo ang logo block para i-adjust ko.");
  process.exit(1);
}

const logoDiv = m[1];
const textBlock = m[2];

const replacement =
  '<NavLink to="/dashboard" onClick={onClose} title="Balik sa Dashboard" ' +
  'className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} flex-1 min-w-0 cursor-pointer rounded-xl transition-opacity hover:opacity-90`}>\n' +
  '              ' + logoDiv + textBlock + '\n' +
  '            </NavLink>';

src = src.replace(re, replacement);

if (src === original) { console.error("⚠️  Walang nabago."); process.exit(1); }

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("✓  Logo + SIMPLEVIA -> clickable (NavLink to /dashboard)");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
