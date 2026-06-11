// patch-required.js
// Dinadagdagan ng pulang asterisk (*) ang "Supervisor Name" at "Digital Sign-off"
// para markado bilang required field (kagaya ng "Position *").
//
// Usage:  node patch-required.js   (auto-find)
//   o     node patch-required.js path\to\file.tsx

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
      try { if (fs.readFileSync(full, "utf8").includes("const AdminDailyAccomplishmentReport")) return full; } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findFile(process.cwd());
if (!target || !fs.existsSync(target)) {
  console.error("❌ Hindi mahanap ang DAR component. I-pass ang path bilang argument.");
  process.exit(1);
}

let src = fs.readFileSync(target, "utf8");
const original = src;
const REQ = ' <span style={{ color: "#ef4444" }}>*</span>';

let hardFail = false;
function step(name, find, repl) {
  if (src.includes(repl)) { console.log("ℹ️  Naka-set na: " + name); return; }
  if (!src.includes(find)) { console.error("⚠️  Hindi nahanap: " + name); hardFail = true; return; }
  src = src.replace(find, repl);
  console.log("✓  " + name);
}

step(
  "Supervisor Name *",
  '<label className="pro-label" style={{ fontSize: 10 }}>Supervisor Name</label>',
  '<label className="pro-label" style={{ fontSize: 10 }}>Supervisor Name' + REQ + '</label>'
);

step(
  "Digital Sign-off *",
  '<p className="pro-label" style={{ marginBottom: 14 }}>Digital Sign-off</p>',
  '<p className="pro-label" style={{ marginBottom: 14 }}>Digital Sign-off' + REQ + '</p>'
);

if (hardFail) {
  console.error("\n⚠️  May hindi tumugma — HINDI sinulat ang file.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak2", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak2");
