// patch-ts-fix2.js — fixes remaining 3 TS errors
const fs = require("fs");
const path = require("path");

function findTarget(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { const f = findTarget(full); if (f) return f; }
    else if (e.name === "AdminDailyAccomplishmentReport.tsx") return full;
  }
  return null;
}

const target = process.argv[2] || findTarget(process.cwd());
if (!target || !fs.existsSync(target)) {
  console.error("❌ Hindi mahanap ang AdminDailyAccomplishmentReport.tsx"); process.exit(1);
}

let code = fs.readFileSync(target, "utf8");
const original = code;
let changes = 0;

// --- Fix 1: rating === 0  (lines 245 and 765)
// Replace ALL occurrences of `rating === 0` with `(rating as number) === 0`
// This satisfies TS without changing runtime behavior
const before1 = code;
code = code.replace(/rating === 0/g, "(rating as number) === 0");
if (code !== before1) {
  const count = (before1.match(/rating === 0/g) || []).length;
  changes += count;
  console.log(`✓  Fix 1: rating === 0 → (rating as number) === 0  (${count} place(s))`);
} else {
  console.log("ℹ️  Fix 1: rating === 0 not found — already fixed or different form");
}

// --- Fix 2: aoa_to_sheet concat type error (line 902)
// Problem: [data.headers].concat(data.body) — headers is string[], body is (string|number)[][]
// Fix: cast body to string[][] via map(row => row.map(String))
// OR simpler: use spread instead of concat
const before2 = code;

// Pattern: XLSX.utils.aoa_to_sheet([data.headers].concat(data.body))
code = code.replace(
  /XLSX\.utils\.aoa_to_sheet\(\[data\.headers\]\.concat\(data\.body\)\)/g,
  "XLSX.utils.aoa_to_sheet([data.headers, ...data.body.map(row => row.map(String))])"
);
if (code !== before2) {
  changes++;
  console.log("✓  Fix 2: aoa_to_sheet concat → spread with String cast");
} else {
  console.log("ℹ️  Fix 2: aoa_to_sheet pattern not found — checking alternate form...");
  // Try alternate: maybe it's split across lines
  const before2b = code;
  code = code.replace(
    /\.aoa_to_sheet\(\s*\[data\.headers\]\s*\.concat\(\s*data\.body\s*\)\s*\)/g,
    ".aoa_to_sheet([data.headers, ...data.body.map(row => row.map(String))])"
  );
  if (code !== before2b) {
    changes++;
    console.log("✓  Fix 2: aoa_to_sheet concat fixed (multiline form)");
  } else {
    console.log("ℹ️  Fix 2: still not found — i-paste mo line 900-905 para matulungan kita");
  }
}

if (changes === 0) {
  console.log("\nℹ️  Walang nabago.");
  process.exit(0);
}

fs.writeFileSync(target + ".tsbak2", original, "utf8");
fs.writeFileSync(target, code, "utf8");
console.log(`\n✅ Fixed ${changes} issue(s) sa: ${target}`);
console.log(`   Backup: ${target}.tsbak2`);
