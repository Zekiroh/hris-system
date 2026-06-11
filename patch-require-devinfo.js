// patch-require-devinfo.js
// Hindi pwedeng mag-submit hanggat walang laman ang Section 1 (Developer Name + Project).
// Mag-e-error toast at hindi bubukas ang confirm modal kung kulang.

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

if (src.includes("handleTrySubmit")) { console.log("ℹ️  Naka-set na ang validation. Walang ginawa."); process.exit(0); }

let hardFail = false;
function step(name, fn) {
  const before = src;
  src = fn(src);
  if (src === before) { console.error("⚠️  Hindi nahanap ang anchor: " + name); hardFail = true; }
  else console.log("✓  " + name);
}

// 1) Idagdag ang toast import (kung wala pa)
if (!src.includes('from "sonner"')) {
  step("add sonner toast import", s => s.replace(
    /(\}\s*from\s*"lucide-react";)/,
    '$1\nimport { toast } from "sonner";'
  ));
} else {
  console.log("•  May sonner import na — laktaw.");
}

// 2) Idagdag ang handleTrySubmit bago ang checklistItems
step("add handleTrySubmit validator", s => s.replace(
  /(const checklistItems = \[)/,
  `const handleTrySubmit = () => {
    if (!devName.trim()) {
      toast.error("Pakilagay muna ang Developer Name bago mag-submit.");
      return;
    }
    if (!project.trim()) {
      toast.error("Pakilagay muna ang Project / System bago mag-submit.");
      return;
    }
    setShowConfirm(true);
  };

  $1`
));

// 3) I-wire ang Submit buttons (main bar + preview) papunta sa validator
step("wire Submit buttons to validator", s => {
  const before = s;
  const out = s.split("() => setShowConfirm(true)").join("handleTrySubmit");
  if (out !== before) {
    const n = (before.match(/\(\) => setShowConfirm\(true\)/g) || []).length;
    console.log("   (na-wire: " + n + " na Submit button)");
  }
  return out;
});

if (hardFail) {
  console.error("\n⚠️  May anchor na hindi tumugma — HINDI sinulat ang file.");
  process.exit(1);
}

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, src, "utf8");
console.log("\n✅ Patched: " + target);
console.log("   Backup : " + target + ".bak");
