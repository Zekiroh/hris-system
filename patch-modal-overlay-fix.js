// patch-modal-overlay-fix.js
// Ginagawang full-viewport + naka-center + blurred ang LAHAT ng modals na gumagamit
// ng .pro-modal-overlay (Process Payroll, confirmations, atbp.) — katulad ng DAR page.
// Idinadagdag ang override sa dulo ng global CSS file na may .pro-modal-overlay.

const fs = require("fs");
const path = require("path");

// Hanapin ang .css file na may "pro-modal-overlay"
function findCss(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }
  for (const e of entries) {
    if (["node_modules", ".git", "dist", "build"].includes(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) { const f = findCss(full); if (f) return f; }
    else if (/\.css$/.test(e.name)) {
      try { if (fs.readFileSync(full, "utf8").includes("pro-modal-overlay")) return full; } catch {}
    }
  }
  return null;
}

const target = process.argv[2] || findCss(process.cwd());
if (!target || !fs.existsSync(target)) {
  console.error("❌ Hindi mahanap ang CSS file na may '.pro-modal-overlay'.");
  console.error("   I-pass ang path: node patch-modal-overlay-fix.js path\\to\\styles.css");
  process.exit(1);
}

let css = fs.readFileSync(target, "utf8");
const original = css;
const MARKER = "/* === DAR-style modal overlay fix === */";

if (css.includes(MARKER)) { console.log("ℹ️  Naka-apply na ang fix sa " + target + ". Walang ginawa."); process.exit(0); }

const override = `

${MARKER}
.pro-modal-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  height: 100dvh !important;
  margin: 0 !important;
  padding: 16px !important;
  z-index: 9999 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  overflow-y: auto !important;
  background-color: rgba(0, 0, 0, 0.6) !important;
  -webkit-backdrop-filter: blur(6px) !important;
  backdrop-filter: blur(6px) !important;
  box-sizing: border-box !important;
}
.pro-modal-overlay > .pro-modal,
.pro-modal-overlay > * {
  max-height: 90vh;
  overflow-y: auto;
  box-sizing: border-box;
}
@media (max-width: 640px) {
  .pro-modal-overlay {
    align-items: flex-start !important;
    padding-top: 24px !important;
  }
}
/* === end modal overlay fix === */
`;

css = css.replace(/\s*$/, "") + "\n" + override;

fs.writeFileSync(target + ".bak", original, "utf8");
fs.writeFileSync(target, css, "utf8");
console.log("✓  Idinagdag ang overlay fix sa: " + target);
console.log("   Backup : " + target + ".bak");
console.log("\n✅ Tapos. Lahat ng modals na gumagamit ng .pro-modal-overlay ay full-screen + center + blur na.");
