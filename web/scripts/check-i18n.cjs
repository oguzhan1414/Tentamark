const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

const root = path.join(__dirname, "..", "src", "lib", "i18n", "dictionaries");

function loadDictionary(locale, group) {
  const file = path.join(root, locale, `${group}.ts`);
  const source = fs.readFileSync(file, "utf8");
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: file,
  });
  const context = { exports: {} };
  vm.runInNewContext(outputText, context, { filename: file });
  return context.exports[`${locale}${group[0].toUpperCase()}${group.slice(1)}`];
}

const errors = [];
const placeholders = (value) => [...value.matchAll(/\{([a-zA-Z][\w]*)\}/g)].map((m) => m[1]).sort().join(",");

function compare(tr, en, name) {
  if (Array.isArray(tr) || Array.isArray(en)) {
    if (!Array.isArray(tr) || !Array.isArray(en) || tr.length !== en.length) {
      errors.push(`${name}: array length/type differs (${tr?.length ?? "-"} / ${en?.length ?? "-"})`);
      return;
    }
    tr.forEach((item, i) => compare(item, en[i], `${name}[${i}]`));
    return;
  }
  if (tr && typeof tr === "object" && en && typeof en === "object") {
    for (const key of new Set([...Object.keys(tr), ...Object.keys(en)])) {
      if (!(key in tr) || !(key in en)) errors.push(`${name}.${key}: missing in ${key in tr ? "en" : "tr"}`);
      else compare(tr[key], en[key], `${name}.${key}`);
    }
    return;
  }
  if (typeof tr !== typeof en || (typeof tr === "string" && placeholders(tr) !== placeholders(en))) {
    errors.push(`${name}: value type or placeholders differ`);
  }
  if (typeof tr === "string" && (!tr.trim() || !en.trim())) errors.push(`${name}: empty translation`);
}

for (const group of ["marketing", "dashboard", "pages", "platforms", "pricing"]) {
  compare(loadDictionary("tr", group), loadDictionary("en", group), group);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log("TR/EN dictionary keys, arrays and placeholders match.");
}
