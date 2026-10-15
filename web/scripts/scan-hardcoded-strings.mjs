import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

const roots = ["app", "components"];
const rows = [];
async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if (/\.tsx?$/.test(file)) {
      const source = await fs.readFile(file, "utf8");
      const sf = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
      const visit = node => {
        if (ts.isJsxText(node) && /\p{L}/u.test(node.getText(sf))) rows.push([file, "JSX", node.getText(sf).trim().replace(/\s+/g, " ")]);
        if (ts.isJsxAttribute(node) && ["placeholder", "aria-label", "title", "alt"].includes(node.name.getText(sf)) && node.initializer && ts.isStringLiteral(node.initializer)) rows.push([file, node.name.getText(sf), node.initializer.text]);
        if (ts.isCallExpression(node) && /toast\.(success|error|info|warning)/.test(node.expression.getText(sf))) {
          for (const arg of node.arguments) if (ts.isStringLiteral(arg)) rows.push([file, "toast", arg.text]);
        }
        if (ts.isNewExpression(node) && node.expression.getText(sf) === "Error" && node.arguments?.[0] && ts.isStringLiteral(node.arguments[0])) rows.push([file, "Error", node.arguments[0].text]);
        ts.forEachChild(node, visit);
      };
      visit(sf);
    }
  }
}
for (const root of roots) await walk(root);
const files = new Map();
for (const [file] of rows) files.set(file, (files.get(file) ?? 0) + 1);
console.log(`CANDIDATE_OCCURRENCES=${rows.length}`);
console.log(`FILES=${files.size}`);
for (const [file, count] of [...files].sort((a, b) => b[1] - a[1])) console.log(`${count} ${file}`);
if (!process.argv.includes("--summary")) {
  console.log("---");
  for (const [file, kind, value] of rows) console.log(`${file} | ${kind} | ${value}`);
}
