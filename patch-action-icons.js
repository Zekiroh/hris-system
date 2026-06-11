// patch-action-icons.js
// (1) Eye (View) -> green, (2) X (Delete) -> red,
// (3) Header title "Action" sa huling column (naka-center).

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
let changes = 0;

function swap(name, from, to, optional) {
  if (src.includes(to)) { console.log("•  Naka-set na: " + name); return; }
  if (!src.includes(from)) {
    if (optional) console.log("•  Laktaw (optional): " + name);
    else console.warn("⚠️  Hindi nahanap: " + name);
    return;
  }
  src = src.split(from).join(to);
  changes++;
  console.log("✓  " + name);
}

// 1) Eye -> green by default
swap("Eye icon green",
  'className="text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg p-1.5 transition-all"',
  'className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg p-1.5 transition-all"'
);

// 2) X -> red by default
swap("X icon red",
  'className="text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg p-1.5 transition-all"',
  'className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg p-1.5 transition-all"'
);

// 3) Header title: "" -> "Action"
swap('Action column header',
  '"Submitted At","Status",""]',
  '"Submitted At","Status","Action"]'
);

// 4) I-center ang Action header (dalawang posibleng anyo ng <th>)
swap("center Action header (with project)",
  'textAlign: h === "Project" ? "center" : undefined',
  'textAlign: h === "Project" || h === "Action" ? "center" : undefined',
  true
);
swap("center Action header (plain)",
  '<th key={h} style={{ whiteSpace: "nowrap" }}>{h}</th>',
  '<th key={h} style={{ whiteSpace: "nowrap", textAlign: h === "Action" ? "center" : undefined }}>{h}</th>',
  true
);

if (changes === 0) { console.log("\nℹ️  Walang binago (mukhang naka-set na lahat)."); process.exit(0); }

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
