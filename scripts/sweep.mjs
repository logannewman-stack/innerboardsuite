// The copy rules from the build tracker, enforced on the built site:
// no em dashes or en dashes anywhere (titles, alt text, meta included),
// and "InnerBoard IOS" is never autocorrected to "iOS".
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../dist", import.meta.url).pathname;
const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".html")) check(path);
  }
}

function check(path) {
  const html = readFileSync(path, "utf8");
  const lines = html.split("\n");
  lines.forEach((line, i) => {
    if (/[—–]/.test(line)) problems.push(`${path}:${i + 1}: em or en dash`);
    if (/\biOS\b/.test(line)) problems.push(`${path}:${i + 1}: "iOS" (spell it IOS)`);
  });
}

walk(root);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("sweep: clean (no dashes, no iOS)");
