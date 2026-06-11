// patch-ts-fix.js
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
  console.error("❌ Hindi mahanap ang AdminDailyAccomplishmentReport.tsx");
  process.exit(1);
}

let code = fs.readFileSync(target, "utf8");
const original = code;
let changes = 0;

const replacements = [
  // Fix 1a: rating === 0 in handleSave
  {
    from: `if (!rating || rating === 0) {\n      toast.error("Please provide a performance rating before saving.")`,
    to:   `if (!rating) {\n      toast.error("Please provide a performance rating before saving.")`,
    label: "Fix 1a: rating === 0 in handleSave"
  },
  // Fix 1b: rating === 0 in Next button
  {
    from: `if (!rating || rating === 0) {\n                  toast.error("Please provide a performance rating first.")`,
    to:   `if (!rating) {\n                  toast.error("Please provide a performance rating first.")`,
    label: "Fix 1b: rating === 0 in Next button"
  },
  // Fix 2: buildExportData params
  {
    from: "function buildExportData(rows, mode) {",
    to:   "function buildExportData(rows: SubmittedReport[], mode: string) {",
    label: "Fix 2: buildExportData param types"
  },
  // Fix 3: generateExcel params
  {
    from: "function generateExcel(rows, mode) {",
    to:   "function generateExcel(rows: SubmittedReport[], mode: string) {",
    label: "Fix 3: generateExcel param types"
  },
  // Fix 4: generatePDF params
  {
    from: "function generatePDF(rows, mode) {",
    to:   "function generatePDF(rows: SubmittedReport[], mode: string) {",
    label: "Fix 4: generatePDF param types"
  },
  // Fix 5: map r param
  {
    from: "  const body = rows.map((r) => {",
    to:   "  const body = rows.map((r: SubmittedReport) => {",
    label: "Fix 5: map r param type"
  },
];

for (const rep of replacements) {
  if (code.includes(rep.from)) {
    code = code.replace(rep.from, rep.to);
    changes++;
    console.log(`✓  ${rep.label}`);
  } else {
    console.log(`ℹ️  Not found (skip): ${rep.label}`);
  }
}

if (changes === 0) {
  console.log("ℹ️  Walang nabago — baka naka-fix na o nag-iba ang code.");
  process.exit(0);
}

fs.writeFileSync(target + ".tsbak", original, "utf8");
fs.writeFileSync(target, code, "utf8");
console.log(`\n✅ Fixed ${changes} TypeScript error(s) sa: ${target}`);
console.log(`   Backup: ${target}.tsbak`);
