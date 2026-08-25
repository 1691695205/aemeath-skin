/**
 * Build lib/client.js from lib/client.template.mjs + assets + skin.css.
 *
 * Embeds every asset in assets/ as a base64 data URI and inlines skin.css
 * as text, then writes the final self-contained browser bundle to
 * lib/client.js (the denia-skin approach: a single portable client file).
 *
 * Usage:  node scripts/build-client.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsDir = join(root, "assets");
const templatePath = join(root, "lib", "client.template.mjs");
const outPath = join(root, "lib", "client.js");
const cssPath = join(root, "skin.css");

const MIME = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".webp": "image/webp",
	".gif": "image/gif",
	".svg": "image/svg+xml"
};

const PLUGIN_ID = "@dsh-external/dsh-client-ui-skin-aemeath";

// ---- 1. build the asset table (basename -> data URI) ----
const assets = {};
let totalBytes = 0;
for (const file of readdirSync(assetsDir)) {
	const ext = file.slice(file.lastIndexOf(".")).toLowerCase();
	const mime = MIME[ext];
	if (!mime) {
		console.warn(`[build-client] skip ${file}: unknown mime for ${ext}`);
		continue;
	}
	const buf = readFileSync(join(assetsDir, file));
	totalBytes += buf.length;
	assets[file] = `data:${mime};base64,${buf.toString("base64")}`;
}
console.log(`[build-client] embedded ${Object.keys(assets).length} assets, ${(totalBytes / 1024 / 1024).toFixed(2)} MiB raw`);

// ---- 2. read skin.css as text ----
const css = readFileSync(cssPath, "utf8");

// ---- 3. read template and substitute ----
let tpl = readFileSync(templatePath, "utf8");
const ASSET_MARKER = /\/\*__AEMEATH_ASSETS__\*\//;
const CSS_MARKER = /\/\*__AEMEATH_CSS__\*\//;
if (!ASSET_MARKER.test(tpl)) throw new Error("template missing __AEMEATH_ASSETS__ marker");
if (!CSS_MARKER.test(tpl)) throw new Error("template missing __AEMEATH_CSS__ marker");

tpl = tpl.replace(ASSET_MARKER, () => JSON.stringify(assets, null, 2));
tpl = tpl.replace(CSS_MARKER, () => JSON.stringify(css));

// ---- 4. wrap into the DSH client module registration format ----
// DSH's client-modules loader requires every client bundle to REGISTER its
// factory via `window.__ModuleLoader__.load({ id, factory })`; the loader
// materializes it lazily and calls `exports.apply(ctx)` at activation. The
// template is authored as plain ESM; here we strip the `export` and wrap it
// in the CommonJS-style factory the loader expects (denia / skin-center
// bundles use exactly this shape).
const EXPORT_MARKER = /export\s*\{\s*apply\s*\};?\s*$/;
if (!EXPORT_MARKER.test(tpl)) throw new Error("template missing `export { apply }` marker");
const body = tpl.replace(EXPORT_MARKER, "");

const factorySrc = [
	`window.__ModuleLoader__.load({`,
	`\tid: ${JSON.stringify(PLUGIN_ID)},`,
	`\tfactory: (require) => {`,
	`\t\tvar module = { exports: {} };`,
	`\t\tvar exports = module.exports;`,
	`\t\tObject.defineProperty(exports, Symbol.toStringTag, { value: "Module" });`,
	`${indent(body, "\t\t")}`,
	`\t\texports.apply = apply;`,
	`\t\treturn module.exports;`,
	`\t}`,
	`});`
].join("\n");

writeFileSync(outPath, factorySrc, "utf8");
console.log(`[build-client] wrote ${outPath} (${(factorySrc.length / 1024 / 1024).toFixed(2)} MiB)`);

function indent(text, pad) {
	return text.split("\n").map((l) => (l ? pad + l : l)).join("\n");
}
