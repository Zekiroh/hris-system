// patch-tab-guard.js
// Hindi ma-by-pass ang Section 8 tab via direct click — kailangan muna ng
// rating, decision, at supervisor name (kapareho ng "Next -> Section 8" button).

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
if (!target || !fs.existsSync(target)) { console.error("❌ Hindi mahanap ang admin DAR file."); process.exit(1); }

let src = fs.readFileSync(target, "utf8");
const original = src;

if (src.includes("const goToTab")) { console.log("ℹ️  May tab guard na. Walang ginawa."); process.exit(0); }

let hardFail = false;
function step(name, fn) {
  const before = src;
  src = fn(src);
  if (src === before) { console.error("⚠️  Hindi nahanap ang anchor: " + name); hardFail = true; }
  else console.log("✓  " + name);
}

// 1) Magdagdag ng goToTab() guard function bago ang "const displayRating"
step("add goToTab guard", s => s.replace(
  /(const displayRating = hoverRating \|\| rating;)/,
  `const goToTab = (key: "s7" | "s8") => {
    if (key === "s8") {
      if (!rating || (rating as number) === 0) {
        toast.error("Please provide a performance rating first.");
        return;
      }
      if (!decision || decision === "Pending Review") {
        toast.error("Please select a Review Decision (not Pending Review).");
        return;
      }
      if (!supervisorName.trim()) {
        toast.error("Please enter the Supervisor Name.");
        return;
      }
    }
    setActiveTab(key);
  };

  $1`
));

// 2) Palitan ang tab onClick para dumaan sa goToTab
step("wire tab click -> goToTab", s => s.replace(
  'onClick={() => setActiveTab(t.key as "s7" | "s8")}',
  'onClick={() => goToTab(t.key as "s7" | "s8")}'
));

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
