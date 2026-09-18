const fs = require("node:fs");
const ts = require("typescript");
const file = process.argv[2];
if (!file) throw new Error("Provide a TSX path");
const source = fs.readFileSync(file, "utf8");
const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const values = new Map();
function visit(node) {
  if (ts.isJsxText(node)) {
    const raw = node.getText(ast).trim().replace(/\s+/g, " ");
    if (/[\p{L}]/u.test(raw) && !raw.startsWith("//")) {
      values.set(raw, (values.get(raw) ?? 0) + 1);
    }
  }
  ts.forEachChild(node, visit);
}
visit(ast);
for (const [value, count] of values) console.log(`${count}\t${value}`);
