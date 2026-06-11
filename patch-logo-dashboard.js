// patch-logo-dashboard.js
// Ginagawang clickable ang logo + "SIMPLEVIA" sa Sidebar -> balik sa /dashboard.
// Iisang Sidebar lang ang gamit ng admin at user, kaya pareho silang aayos.

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

if (src.includes('Balik sa Dashboard') || src.includes('to="/dashboard"\n            className="flex items-center')) {
  console.log("ℹ️  Clickable na ang logo. Walang ginawa.");
  process.exit(0);
}

let hardFail = false;
function step(name, fn) {
  const before = src;
  src = fn(src);
  if (src === before) { console.error("⚠️  Hindi nahanap ang anchor: " + name); hardFail = true; }
  else console.log("✓  " + name);
}

// 1) Siguraduhing naka-import ang NavLink (nandyan na, pero safety check lang)
if (!/NavLink/.test(src)) {
  console.warn("•  Walang NavLink import — gagamit ng onClick navigate fallback.");
}

// 2) I-wrap ang logo + SIMPLEVIA block sa NavLink to="/dashboard".
//    Target: yung outer div na may flex items-center, papalitan ng NavLink.
step("wrap logo block in NavLink -> /dashboard", s => s.replace(
  '<div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>\n            <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex-shrink-0">\n              <img src={logo} alt="SimpleVia Logo" className="w-full h-full" />\n            </div>',
  '<div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>\n            <NavLink\n              to="/dashboard"\n              onClick={onClose}\n              title="Balik sa Dashboard"\n              className={`flex items-center ${collapsed ? "justify-center" : "gap-3"} flex-1 min-w-0 rounded-xl transition-colors hover:opacity-90 cursor-pointer`}\n            >\n              <div className="w-10 h-10 rounded-xl bg-white/10 p-1.5 flex-shrink-0">\n                <img src={logo} alt="SimpleVia Logo" className="w-full h-full" />\n              </div>'
));

// 3) Isara ang NavLink pagkatapos ng SIMPLEVIA text block (bago ang close X button).
step("close NavLink after title", s => s.replace(
  '            {!collapsed && (\n              <div className="animate-fade-in flex-1">\n                <p className="text-white text-sm font-bold leading-tight tracking-wide">\n                  SIMPLEVIA\n                </p>\n                <p className="text-emerald-300/60 text-[10px] leading-tight">\n                  HRIS System\n                </p>\n              </div>\n            )}',
  '              {!collapsed && (\n                <div className="animate-fade-in flex-1 min-w-0">\n                  <p className="text-white text-sm font-bold leading-tight tracking-wide">\n                    SIMPLEVIA\n                  </p>\n                  <p className="text-emerald-300/60 text-[10px] leading-tight">\n                    HRIS System\n                  </p>\n                </div>\n              )}\n            </NavLink>'
));

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  console.error("    I-paste mo ang logo block (yung may SIMPLEVIA) para i-adjust ko.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
