const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const page = path.join(__dirname, "..", "src", "app", "fiyatlandirma", "page.tsx");
const source = fs.readFileSync(page, "utf8");
if (source.includes("{p(")) throw new Error("Pricing JSX has already been transformed");
const ast = ts.createSourceFile(page, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const replacements = [];
const values = new Set();

function visit(node) {
  if (ts.isJsxText(node)) {
    const raw = node.getText(ast);
    const first = raw.search(/\S/u);
    if (first >= 0) {
      const last = raw.search(/\s*$/u);
      const value = raw.slice(first, last);
      if (/[\p{L}]/u.test(value) && !value.startsWith("//")) {
        values.add(value);
        replacements.push({ start: node.getStart(ast) + first, end: node.getStart(ast) + last, text: `{p(${JSON.stringify(value)})}` });
      }
    }
  }
  ts.forEachChild(node, visit);
}
visit(ast);

const dictionary = (locale) => `export const ${locale}Pricing = {\n${[...values].map((value) => `  ${JSON.stringify(value)}: ${JSON.stringify(value)},`).join("\n")}\n} as const;\n`;
for (const locale of ["tr", "en"]) {
  fs.writeFileSync(path.join(__dirname, "..", "src", "lib", "i18n", "dictionaries", locale, "pricing.ts"), dictionary(locale));
}

let updated = source;
for (const replacement of replacements.reverse()) {
  updated = updated.slice(0, replacement.start) + replacement.text + updated.slice(replacement.end);
}
fs.writeFileSync(page, updated);
console.log(`Wrapped ${replacements.length} JSX text nodes; ${values.size} dictionary keys.`);
